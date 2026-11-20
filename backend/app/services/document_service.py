import io
from datetime import UTC, datetime
from pathlib import Path
from typing import TypedDict, cast

import pikepdf
import pymupdf
import pymupdf4llm
import sentencex
import xxhash
from ebooklib import ITEM_COVER, ITEM_IMAGE, epub
from PIL import Image, ImageOps
from sqlalchemy import select, update
from sqlalchemy.orm import Session, load_only, selectinload

from app.core.config import settings
from app.models.document import Document
from app.schemas.document import DocumentUpdate, FilterParams
from app.utils import helper
from app.utils.helper import normalize_pikepdf_value


class SentenceDict(TypedDict):
    text: str
    rects: list[pymupdf.Rect]


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH
        self.valid_files = {".pdf", ".epub"}

    def get_documents(self, filter_query: FilterParams) -> list[Document]:
        stmt = select(Document)
        if filter_query.folder is not None:
            stmt = stmt.where(Document.file_path == filter_query.folder)
        stmt = stmt.order_by(getattr(Document, filter_query.order_by))
        documents = list(self.db.scalars(stmt).all())
        return documents

    def get_document(self, id: str) -> Document:
        stmt = (
            select(Document)
            .where(Document.id == id)
            .options(
                selectinload(Document.annotations), selectinload(Document.bookmarks)
            )
        )
        return self.db.scalars(stmt).one()

    def get_document_folders(self):
        stmt = select(Document.file_path).distinct()
        folders = list(self.db.scalars(stmt).all())
        folders = self._build_tree(folders)
        return folders

    def _build_tree(self, paths: list[str]) -> list[dict]:
        root = {"children": []}
        nodes = {"": root}

        for path in sorted(paths):
            parts = path.split("/")
            for i in range(len(parts)):
                current = "/".join(parts[: i + 1])
                if current not in nodes:
                    node = {"name": parts[i], "path": current, "children": []}
                    nodes["/".join(parts[:i])]["children"].append(node)
                    nodes[current] = node
        return root["children"]

    def get_document_file(self, id: str) -> Path:
        document = self.db.get_one(Document, id)
        path = (
            self.library_path
            / document.file_path
            / (document.file_name + document.file_type.value)
        )

        print(path)
        if not path.is_file():
            raise FileNotFoundError(f"File missing for id: {id}")
        return path

    def get_document_cover(self, id: str) -> str:
        covers_dir = Path(settings.LIBRARY_PATH / ".covers").resolve()
        cover_path = Path(settings.LIBRARY_PATH / ".covers" / f"{id}.jpg").resolve()
        if not (cover_path.is_relative_to(covers_dir) and cover_path.is_file()):
            raise FileNotFoundError
        return str(cover_path)

    def get_page_text(self, id: str, page_number: int) -> list:
        document_path = self.get_document_file(id)

        text = cast(
            str,
            pymupdf4llm.to_text(
                document_path,
                pages=[page_number - 1],
                header=False,
                footer=False,
                table_format="plain",
            ),
        )
        sentences: list[str] = sentencex.segment("en", text)  # ty: ignore[unresolved-attribute]
        sentences = [s.strip() for s in sentences if s.strip()]

        doc = pymupdf.open(document_path)
        page = doc[page_number - 1]
        words = page.get_text("words", sort=True)
        sentence_objects: list[SentenceDict] = []

        for sentence in sentences:
            rects = page.search_for(sentence)
            if not rects:
                rects = self._find_sentence_rects(sentence, words)

            sentence_object: SentenceDict = {"text": sentence, "rects": rects}
            sentence_objects.append(sentence_object)

        return sentence_objects

    def update_document(self, id: str, document: DocumentUpdate):
        update_data = document.model_dump(exclude_unset=True)
        stmt = update(Document).where(Document.id == id).values(**update_data)
        self.db.execute(stmt)
        self.db.commit()

    def scan(self) -> None:
        """Scan library_path for PDFs."""
        stmt = select(Document).options(load_only(Document.id, Document.file_path))
        documents = self.db.scalars(stmt).all()
        documents = {doc.id: doc for doc in documents}
        new_documents = []

        for path in self.library_path.rglob("*"):
            if path.is_file() and path.suffix.lower() in self.valid_files:
                id = self._generate_content_hash(path)
                rel = self._get_relative_path(path)
                if id in documents:
                    if documents[id].file_path != str(rel.parent):
                        documents[id].file_path = str(rel.parent)
                        documents[id].file_name = path.stem
                    continue

                if path.suffix == ".pdf":
                    metadata = self._get_metadata(path)
                    try:
                        self._generate_cover(id, path)
                    except pymupdf.FileDataError:
                        print(f"Count not generate cover for {id}")
                elif path.suffix == ".epub":
                    metadata = self._get_epub_metadata(path)
                else:
                    metadata = None

                if metadata is None:
                    continue
                title, author = metadata

                document = Document(
                    id=id,
                    file_path=str(self._get_relative_path(path).parent),
                    file_name=path.stem,
                    file_type=path.suffix,
                    title=title,
                    author=author,
                    created_at=datetime.now(UTC),
                )
                new_documents.append(document)
        self.db.add_all(new_documents)
        self.db.commit()

    def _get_relative_path(self, path: Path) -> Path:
        return path.relative_to(self.library_path)

    def _get_metadata(self, path: Path):
        """Uses pikepdf to parse PDF metadata."""
        match path.suffix:
            case ".pdf":
                try:
                    with pikepdf.open(path) as pdf:
                        meta = pdf.open_metadata()
                        title = (
                            normalize_pikepdf_value(meta.get("dc:title"))
                            if meta
                            else None
                        )
                        author = (
                            normalize_pikepdf_value(meta.get("dc:creator"))
                            if meta
                            else None
                        )
                    return title, author
                except pikepdf.PdfError:
                    return None
            case ".epub":
                book = epub.read_epub(path)
                title = book.get_metadata("DC", "title")[0][0]
                author = [name for name, _ in book.get_metadata("DC", "creator")]
                return title, author

    def _get_epub_metadata(self, path: Path):
        try:
            book = epub.read_epub(path)
            title = book.get_metadata("DC", "title")[0][0]
            author = [name for name, _ in book.get_metadata("DC", "creator")]
            return title, author
        except Exception as e:
            print(e)

    def _generate_cover(self, document_id: str, document_path: Path) -> None:
        cover_folder = self.library_path / ".covers"
        cover_folder.mkdir(parents=True, exist_ok=True)
        cover_path = cover_folder / f"{document_id}.jpg"
        target_w, target_h = 400, 566

        match document_path.suffix:
            case ".pdf":
                with pymupdf.open(document_path) as d:
                    page = d[0]
                    rect = page.rect
                    matrix = pymupdf.Matrix(
                        target_w / rect.width, target_h / rect.height
                    )
                    pix = page.get_pixmap(matrix=matrix, alpha=False)
                    pix.save(cover_path, "jpg", jpg_quality=75)
            case ".epub":
                book = epub.read_epub(document_path)
                cover = self._find_epub_cover(book)
                if cover is not None:
                    with Image.open(io.BytesIO(cover.get_content())) as img:
                        img = ImageOps.exif_transpose(img).convert("RGB")
                        img = ImageOps.fit(
                            img, (target_w, target_h), Image.Resampling.LANCZOS
                        )
                        img.save(cover_path, "JPEG", quality=75, optimize=True)

    def _find_epub_cover(self, book: epub.EpubBook):
        # 1. EPUB2: <meta name="cover" content="item-id"/>
        for _, attrs in book.get_metadata("OPF", "cover"):
            item = book.get_item_with_id(attrs.get("content", ""))
            if item is not None:
                return item

        # 2. EPUB3 properties="cover-image" (ebooklib exposes this as ITEM_COVER)
        for item in book.get_items_of_type(ITEM_COVER):
            return item

        # 3. Any image with "cover" in its filename
        for item in book.get_items_of_type(ITEM_IMAGE):
            if "cover" in item.file_name.lower():
                return item

        return None

    def _generate_content_hash(self, filepath: Path) -> str:
        """
        Generate a xxHash of the PDF file.
        """
        x = xxhash.xxh3_128()

        with open(filepath, "rb") as file:
            while chunk := file.read(1024 * 1024):
                x.update(chunk)
        return x.hexdigest()

    def refresh_covers(self):
        """
        Refresh covers for all documents.
        """
        covers_dir = self.library_path / ".covers"
        covers_dir.mkdir(exist_ok=True)
        for file in covers_dir.iterdir():
            if file.is_file():
                file.unlink()

        documents = list(self.db.scalars(select(Document)).all())
        for doc in documents:
            path = self.library_path / doc.file_path / (doc.file_name + doc.file_type)
            if not path.is_file():
                raise FileNotFoundError(f"File missing for id: {doc.id}")
            self._generate_cover(doc.id, path)

    def _find_sentence_rects(self, sentence: str, words) -> list[pymupdf.Rect]:
        target = helper.normalize_word(sentence)

        chars = []
        char_to_word = []

        for i, w in enumerate(words):
            word = helper.normalize_word(w[4])
            for c in word:
                chars.append(c)
                char_to_word.append(i)

        stream = "".join(chars)
        start = stream.find(target)

        if start == -1:
            return []

        end = start + len(target)
        first_word = char_to_word[start]
        last_word = char_to_word[end - 1]
        matched_words = words[first_word : last_word + 1]

        line_rects = {}
        for w in matched_words:
            rect = pymupdf.Rect(w[:4])
            line_id = (w[5], w[6])

            if line_id not in line_rects:
                line_rects[line_id] = rect
            else:
                line_rects[line_id] |= rect

        return list(line_rects.values())
