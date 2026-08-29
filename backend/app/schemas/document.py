from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.annotation import AnnotationRead


class DocumentBase(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, alias_generator=to_camel, from_attributes=True
    )

    title: str | None = None
    author: list[str] | None = None
    primary_color: str | None = None


class DocumentRead(DocumentBase):
    file_name: str
    id: str
    cover: str
    annotations: list[AnnotationRead]


class DocumentUpdate(DocumentBase):
    pass
