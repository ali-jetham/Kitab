from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Bookmark(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )
    id: str
    doc_id: str
    page: int
    note: str


class BookmarkCreate(Bookmark):
    pass


class BookmarkRead(Bookmark):
    created_at: datetime
    updated_at: datetime
