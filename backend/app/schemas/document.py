from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from pydantic.alias_generators import to_camel

from app.models.document import FileType
from app.schemas.annotation import AnnotationRead
from app.schemas.bookmark import BookmarkRead

XXH3_128_HEX = r"^[0-9a-f]{32}$"
DocumentId = Annotated[str, StringConstraints(pattern=XXH3_128_HEX)]


class FilterParams(BaseModel):
    folder: str | None = Field(default=None)
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)
    order_by: Literal["title", "created_at", "updated_at", "file_name"] = "file_name"


class DocumentBase(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True, alias_generator=to_camel, from_attributes=True
    )
    id: str
    file_name: str
    file_path: str
    file_type: FileType
    title: str | None = None
    author: list[str] | None = None


class DocumentRead(DocumentBase):
    annotations: list[AnnotationRead]
    bookmarks: list[BookmarkRead]


class DocumentUpdate(DocumentBase):
    pass
