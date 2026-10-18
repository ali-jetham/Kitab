from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.bookmark import Bookmark
from app.schemas.bookmark import BookmarkCreate


class BookmarkService:
    def __init__(self, db: Session):
        self.db = db
        self.library_path = settings.LIBRARY_PATH

    def get_bookmarks(self) -> list[Bookmark]:
        stmt = select(Bookmark).order_by(Bookmark.created_at.desc())
        bookmarks = list(self.db.scalars(stmt).all())
        return bookmarks

    def get_bookmark(self, id: int) -> Bookmark:
        bookmark = self.db.get_one(Bookmark, id)
        return bookmark

    def add_bookmark(self, bookmark: BookmarkCreate):
        new_bookmark = Bookmark(**bookmark.model_dump())
        self.db.add(new_bookmark)
        self.db.commit()

    def delete_bookmark(self, id: int) -> None:
        bm = self.db.get_one(Bookmark, id)
        self.db.delete(bm)
        self.db.commit()
