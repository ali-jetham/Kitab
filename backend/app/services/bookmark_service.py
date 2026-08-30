from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.bookmark import Bookmark
from app.schemas.bookmark import BookmarkCreate, BookmarkRead


class BookmarkService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    async def get_bookmarks(self) -> list[BookmarkRead]:
        stmt = select(Bookmark).order_by(Bookmark.created_at.desc())
        bookmarks = self.db.scalars(stmt)
        return [BookmarkRead.model_validate(bm) for bm in bookmarks]

    async def get_bookmark(self, id: int) -> BookmarkRead | None:
        stmt = select(Bookmark).where(Bookmark.id == id)
        bookmark = self.db.scalar(stmt)
        if bookmark:
            return BookmarkRead.model_validate(bookmark)
        return None

    async def add_bookmark(self, bookmark: BookmarkCreate):
        new_bookmark = Bookmark(**bookmark.model_dump())
        self.db.add(new_bookmark)
        self.db.commit()

    async def delete_bookmark(self, id: int):
        stmt = delete(Bookmark).where(Bookmark.id == id)
        self.db.execute(stmt)
        self.db.commit()
