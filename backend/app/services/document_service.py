import secrets
from datetime import datetime, timezone
from pathlib import Path

import pikepdf
import pymupdf
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.document import Document
from app.utils.helper import normalize_pikepdf_value


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    def get_docs(self) -> list[Document]:
        return list(self.db.scalars(select(Document)).all())

    def get_doc(self, id: str) -> Document | None:
        return self.db.scalar(
            select(Document)
            .where(Document.id == id)
            .options(selectinload(Document.annotations))
        )

    def get_doc_file(self, id: str) -> Path | None:
        doc: Document | None = self.db.get(Document, id)
        if doc is None:
            return None
        path = Path(doc.file_path)
        return path if path.is_file() else None

    def _scan(self):
        """Scan library_root for PDFs."""
        docs = []

        for path in self.library_path.rglob("*.pdf"):
            id = secrets.token_hex(4)
            with pikepdf.open(path) as pdf:
                meta = pdf.open_metadata()
                title = normalize_pikepdf_value(meta.get("dc:title")) if meta else None
                author = (
                    normalize_pikepdf_value(meta.get("dc:creator")) if meta else None
                )

            cover = self._generate_cover(id, path)

            doc = Document(
                id=id,
                file_path=str(path),
                file_name=path.stem,
                title=title,
                author=author,
                cover=cover,
                created_at=datetime.now(timezone.utc),
            )
            docs.append(doc)
        self.db.add_all(docs)
        self.db.commit()

    def _generate_cover(self, id: str, book_path: Path) -> str:
        cover_folder = self.library_path / ".covers"
        cover_folder.mkdir(parents=True, exist_ok=True)
        cover_path = cover_folder / f"{id}.jpg"

        target_w, target_h = 400, 566

        with pymupdf.open(book_path) as doc:
            page = doc[0]
            rect = page.rect
            matrix = pymupdf.Matrix(target_w / rect.width, target_h / rect.height)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            pix.save(cover_path, "jpg", jpg_quality=75)

        return str(cover_path)

    def _generate_content_hash(self, filepath: Path):
        pass
