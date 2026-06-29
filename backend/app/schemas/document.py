from pydantic import BaseModel

from app.schemas.annotation import AnnotationDTO


class DocumentDTO(BaseModel):
    id: str
    file_name: str
    title: str
    author: list[str]
    cover: str
    annotations: list[AnnotationDTO]
