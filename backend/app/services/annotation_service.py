from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.annotation import Annotation
from app.schemas.annotation import AnnotationBase, AnnotationCreate, AnnotationRead


class AnnotationService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    async def get_all_annotations(self) -> list[AnnotationBase]:
        anns = self.db.query(Annotation).all()
        return [AnnotationBase.model_validate(ann) for ann in anns]

    async def add_annotation(self, ann: AnnotationCreate) -> AnnotationRead:
        new_ann = Annotation(**ann.model_dump())
        self.db.add(new_ann)
        self.db.commit()
        self.db.refresh(new_ann)  # TODO: understand how this works
        return AnnotationRead.model_validate(new_ann)

    # TODO: check what should be returned from here
    async def delete_annotation(self, id: str):
        stmt = delete(Annotation).where(Annotation.id == id)
        self.db.execute(stmt)
        self.db.commit()
