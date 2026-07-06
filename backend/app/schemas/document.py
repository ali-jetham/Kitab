from pydantic import BaseModel, ConfigDict

from app.schemas.annotation import AnnotationDTO


class DocumentDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    title: str | None = None
    author: list[str] | None = None
    cover: str
    annotations: list[AnnotationDTO]
