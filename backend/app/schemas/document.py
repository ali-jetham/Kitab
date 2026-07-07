from pydantic import BaseModel, ConfigDict

from app.schemas.annotation import AnnotationDTO


class DocumentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str | None = None
    author: list[str] | None = None
    primary_color: str | None = None


class DocumentRead(DocumentBase):
    file_name: str
    id: str
    cover: str
    annotations: list[AnnotationDTO]


class DocumentUpdate(DocumentBase):
    pass
