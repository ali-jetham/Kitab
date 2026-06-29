from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.annotation import Annotation
from app.models.document import Document
from app.schemas.annotation import AnnotationDTO


class AnnotationService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    async def add_annotation(self, ann: AnnotationDTO) -> AnnotationDTO | None:
        new_ann = Annotation(**ann.model_dump())
        doc_exists = self.db.scalar(
            select(Document).where(Document.id == new_ann.docId)
        )
        if not doc_exists:
            return None

        self.db.add(new_ann)
        self.db.commit()

    async def delete_annotation(self, id: int):
        stmt = delete(Annotation).where(Annotation.id == id)
        self.db.execute(stmt)
        self.db.commit()
