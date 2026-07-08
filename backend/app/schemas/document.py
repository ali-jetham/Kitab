from pydantic import BaseModel, ConfigDict

from app.schemas.annotation import AnnotationBase


class DocumentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str | None = None
    author: list[str] | None = None
    primary_color: str | None = None


class DocumentRead(DocumentBase):
    file_name: str
    id: str
    cover: str
    annotations: list[AnnotationBase]


class DocumentUpdate(DocumentBase):
    pass
