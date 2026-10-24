from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints
from pydantic.alias_generators import to_camel

from app.schemas.annotation import AnnotationRead
from app.schemas.bookmark import BookmarkRead

XXH3_128_HEX = r"^[0-9a-f]{32}$"
DocumentId = Annotated[str, StringConstraints(pattern=XXH3_128_HEX)]


class DocumentBase(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, alias_generator=to_camel, from_attributes=True
    )
    id: str
    file_name: str
    title: str | None = None
    author: list[str] | None = None


class DocumentRead(DocumentBase):
    annotations: list[AnnotationRead]
    bookmarks: list[BookmarkRead]


class DocumentUpdate(DocumentBase):
    pass
