from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.models.annotation import Style


class AnnotationBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )
    color: str
    style: Style
    page: int
    text: str
    note: str


class AnnotationCreate(AnnotationBase):
    rects: list
    id: str
    doc_id: str


class AnnotationRead(AnnotationCreate):
    created_at: datetime
    updated_at: datetime


class AnnotationUpdate(BaseModel):
    color: str | None = None
    style: Style | None = None
    page: int | None = None
    text: str | None = None
    note: str | None = None
    rects: list | None = None
