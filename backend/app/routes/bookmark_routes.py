from fastapi import APIRouter, Depends

from app.core.dependencies import get_bookmark_service
from app.schemas.bookmark import BookmarkCreate, BookmarkRead
from app.services.bookmark_service import BookmarkService

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


@router.get("/")
async def get_bookmarks(
    service: BookmarkService = Depends(get_bookmark_service),
) -> list[BookmarkRead]:
    return await service.get_bookmarks()


@router.get("/{id}")
async def get_bookmark(
    id: int, service: BookmarkService = Depends(get_bookmark_service)
):
    return await service.get_bookmark(id)


@router.post("/")
async def add_bookmark(
    bookmark: BookmarkCreate, service: BookmarkService = Depends(get_bookmark_service)
):
    return await service.add_bookmark(bookmark)


@router.delete("/{id}")
async def delete_bookmark(
    id: int, service: BookmarkService = Depends(get_bookmark_service)
):
    return await service.delete_bookmark(id)
