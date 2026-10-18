from datetime import UTC, datetime
from pathlib import Path
from typing import cast

import pikepdf
import pymupdf
import pymupdf4llm
import sentencex
import xxhash
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.document import Document
from app.schemas.document import DocumentUpdate
from app.utils import helper
from app.utils.helper import normalize_pikepdf_value


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    def get_documents(self) -> list[Document]:
        stmt = select(Document)
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

    def get_document_file(self, id: str) -> Path:
        document = self.db.get_one(Document, id)
        path = Path(document.file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File missing for id: {id}")
        return path

    def get_document_cover(self, id: str) -> str:
        covers_path = Path(settings.LIBRARY_PATH / ".covers").resolve()
        file_path = Path(settings.LIBRARY_PATH / ".covers" / f"{id}.jpg").resolve()

        if not (file_path.is_relative_to(covers_path) and file_path.is_file()):
            raise FileNotFoundError
        return str(file_path)

    def get_page_text(self, id: str, page_number: int):
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
        sentences: list[str] = sentencex.segment("en", text)
        sentences = [s.strip() for s in sentences if s.strip()]

        doc = pymupdf.open(document_path)
        page = doc[page_number - 1]
        words = page.get_text("words", sort=True)
        sentence_objects = []

        for sentence in sentences:
            rects = page.search_for(sentence)
            if not rects:
                rects = self._find_sentence_rects(sentence, words)

            sentence_object = {"text": sentence, "rects": rects}
            sentence_objects.append(sentence_object)

        return sentence_objects

    def update_document(self, id: str, document: DocumentUpdate):
        update_data = document.model_dump(exclude_unset=True)
        stmt = update(Document).where(Document.id == id).values(**update_data)
        self.db.execute(stmt)
        self.db.commit()

    def scan(self) -> None:
        """Scan library_path for PDFs."""
        documents_ids = list(self.db.scalars(select(Document.id)).all())
        new_documents = []

        for path in self.library_path.rglob("*.pdf"):
            id = self._generate_content_hash(path)
            exists = any(doc_id == id for doc_id in documents_ids)
            if exists:
                continue

            metadata = self._get_metadata(path)
            if metadata is None:
                continue
            title, author = metadata

            cover = self._generate_cover(id, path)
            if cover is None:
                continue

            document = Document(
                id=id,
                file_path=str(path),
                file_name=path.stem,
                title=title,
                author=author,
                cover=cover,
                created_at=datetime.now(UTC),
            )
            new_documents.append(document)
        self.db.add_all(new_documents)
        self.db.commit()

    def _get_metadata(self, path: Path):
        try:
            with pikepdf.open(path) as pdf:
                meta = pdf.open_metadata()
                title = normalize_pikepdf_value(meta.get("dc:title")) if meta else None
                author = (
                    normalize_pikepdf_value(meta.get("dc:creator")) if meta else None
                )
            return title, author
        except pikepdf.PdfError:
            return None

    def _generate_cover(self, id: str, document_path: Path) -> str | None:
        cover_folder = self.library_path / ".covers"
        cover_folder.mkdir(parents=True, exist_ok=True)
        cover_path = cover_folder / f"{id}.jpg"
        target_w, target_h = 400, 566

        try:
            with pymupdf.open(document_path) as d:
                page = d[0]
                rect = page.rect
                matrix = pymupdf.Matrix(target_w / rect.width, target_h / rect.height)
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                pix.save(cover_path, "jpg", jpg_quality=75)
                return str(cover_path)
        except pymupdf.FileDataError:
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
        for file in self.library_path.iterdir():
            if file.is_file():
                file.unlink()

        documents = list(self.db.scalars(select(Document)).all())
        for d in documents:
            path = Path(d.file_path)
            if not path.is_file():
                continue
            cover = self._generate_cover(d.id, path)
            stmt = update(Document).where(Document.id == d.id).values(cover=cover)
            self.db.execute(stmt)
        self.db.commit()

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
