from datetime import UTC, datetime
from pathlib import Path

import pikepdf
import pymupdf
import xxhash
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.document import Document
from app.schemas.document import DocumentRead, DocumentUpdate
from app.utils.helper import normalize_pikepdf_value


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    def get_documents(self) -> list[DocumentRead]:
        documents = list(self.db.scalars(select(Document)).all())
        return [DocumentRead.model_validate(d) for d in documents]

    # TODO: write a version which does NOT return with all the annotations for Library.tsx page
    def get_document(self, id: str) -> DocumentRead | None:
        document = self.db.scalar(
            select(Document)
            .where(Document.id == id)
            .options(selectinload(Document.annotations))
        )
        if document is None:
            return None
        return DocumentRead.model_validate(document)

    def get_document_file(self, id: str) -> Path | None:
        document: Document | None = self.db.get(Document, id)
        if document is None:
            return None
        path = Path(document.file_path)
        return path if path.is_file() else None

    def update_document(self, id: str, document: DocumentUpdate):
        update_data = document.model_dump(exclude_unset=True)
        stmt = update(Document).where(Document.id == id).values(**update_data)
        self.db.execute(stmt)
        self.db.commit()

    def _scan(self):
        """Scan library_path for PDFs."""
        documents = list(self.db.scalars(select(Document)).all())
        new_documents = []

        for path in self.library_path.rglob("*.pdf"):
            id = self._generate_content_hash(path)
            exists = any(d.id for d in documents)
            if exists:
                continue

            with pikepdf.open(path) as pdf:
                meta = pdf.open_metadata()
                title = normalize_pikepdf_value(meta.get("dc:title")) if meta else None
                author = (
                    normalize_pikepdf_value(meta.get("dc:creator")) if meta else None
                )

            cover = self._generate_cover(id, path)

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

    def _generate_cover(self, id: str, document_path: Path) -> str:
        cover_folder = self.library_path / ".covers"
        cover_folder.mkdir(parents=True, exist_ok=True)
        cover_path = cover_folder / f"{id}.jpg"

        target_w, target_h = 400, 566

        with pymupdf.open(document_path) as d:
            page = d[0]
            rect = page.rect
            matrix = pymupdf.Matrix(target_w / rect.width, target_h / rect.height)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            pix.save(cover_path, "jpg", jpg_quality=75)

        return str(cover_path)

    def _generate_content_hash(self, filepath: Path) -> str:
        """
        Generate a xxHash of the PDF file.
        """
        x = xxhash.xxh3_128()

        with open(filepath, "rb") as file:
            while chunk := file.read(1024 * 1024):
                x.update(chunk)
        return x.hexdigest()

    def _refresh_covers(self):
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
