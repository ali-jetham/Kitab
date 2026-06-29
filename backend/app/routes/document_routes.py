from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.dependencies import get_document_service
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/docs", tags=["docs"])


@router.get("/")
async def get_docs(service: DocumentService = Depends(get_document_service)):
    return [
        {
            "id": doc.id,
            "title": doc.title,
            "author": doc.author,
            "file_name": doc.file_name,
            "cover": f"api/docs/{doc.id}/cover",
            "created_at": doc.created_at,
        }
        for doc in service.get_docs()
    ]


@router.get("/scan")
async def scan_docs(service: DocumentService = Depends(get_document_service)):
    service._scan()


@router.get("/{id}")
async def get_doc(id: str, service: DocumentService = Depends(get_document_service)):
    result = service.get_doc(id)
    if result is None:
        raise HTTPException(
            status_code=404, detail=f"Document with {id} does not exist "
        )
    return result


@router.get("/{id}/file")
async def get_doc_file(
    id: str, library: DocumentService = Depends(get_document_service)
):
    book_path = library.get_doc_file(id)
    if book_path is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(
        path=book_path,
        media_type="application/pdf",
        headers={"Cache-Control": "private, max-age=3600"},
    )


# TODO: add validation for id
@router.get("/{id}/cover")
async def get_doc_cover(id: str):
    file_path = Path(settings.LIBRARY_PATH / ".covers") / f"{id}.jpg"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Cover not found")

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "private, max-age=3600"},
    )
