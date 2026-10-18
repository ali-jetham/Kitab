from fastapi import APIRouter

from app.core.dependencies import BookmarkServiceDep
from app.schemas.bookmark import BookmarkCreate, BookmarkRead

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


@router.get("/", status_code=200, response_model=list[BookmarkRead])
def get_bookmarks(service: BookmarkServiceDep):
    return service.get_bookmarks()


@router.get("/{id}", status_code=200, response_model=BookmarkRead)
def get_bookmark(id: int, service: BookmarkServiceDep):
    return service.get_bookmark(id)


@router.post("/")
def add_bookmark(bookmark: BookmarkCreate, service: BookmarkServiceDep):
    return service.add_bookmark(bookmark)


@router.delete("/{id}", status_code=204)
def delete_bookmark(id: int, service: BookmarkServiceDep):
    return service.delete_bookmark(id)
