from pydantic import BaseModel

from app.models.annotation import Style


class AnnotationDTO(BaseModel):
    docId: str
    color: str
    style: Style
    page: int
    text: str
    note: str
    rects: list
