from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.annotation import Annotation
from app.schemas.annotation import (
    AnnotationCreate,
    AnnotationUpdate,
)


class AnnotationService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    def get_all_annotations(self) -> list[Annotation]:
        stmt = select(Annotation)
        annotations = list(self.db.scalars(stmt).all())
        return annotations

    def add_annotation(self, ann: AnnotationCreate) -> Annotation:
        new_ann = Annotation(**ann.model_dump())
        self.db.add(new_ann)
        self.db.commit()
        self.db.refresh(new_ann)
        return new_ann

    def update_annotation(self, id: str, ann: AnnotationUpdate):
        update_ann = ann.model_dump(exclude_unset=True)
        stmt = (
            update(Annotation)
            .where(Annotation.id == id)
            .values(**update_ann)
            .returning(Annotation)
        )
        annotation = self.db.execute(stmt).scalar_one()
        self.db.commit()
        return annotation

    def delete_annotation(self, id: str) -> None:
        ann = self.db.get_one(Annotation, id)
        self.db.delete(ann)
        self.db.commit()
