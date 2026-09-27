from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.annotation import AnnotationRead
from app.schemas.bookmark import BookmarkRead


class DocumentBase(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, alias_generator=to_camel, from_attributes=True
    )
    id: str
    file_name: str
    cover: str
    title: str | None = None
    author: list[str] | None = None
    primary_color: str | None = None


class DocumentRead(DocumentBase):
    annotations: list[AnnotationRead]
    bookmarks: list[BookmarkRead]


class DocumentUpdate(DocumentBase):
    pass
