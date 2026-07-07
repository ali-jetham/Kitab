from pydantic import BaseModel, ConfigDict

from app.models.annotation import Style


class AnnotationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    docId: str
    color: str
    style: Style
    page: int
    text: str
    note: str
    rects: list
