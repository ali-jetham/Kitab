from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.annotation import Style


class AnnotationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    color: str
    style: Style
    page: int
    text: str
    note: str
    rects: list


class AnnotationCreate(AnnotationBase):
    id: str
    docId: str


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
