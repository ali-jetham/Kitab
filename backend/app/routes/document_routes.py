from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.dependencies import get_document_service
from app.schemas.document import DocumentRead, DocumentUpdate
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/docs", tags=["docs"])


@router.get("/")
async def get_docs(
    service: DocumentService = Depends(get_document_service),
) -> list[DocumentRead]:
    return service.get_docs()


@router.get("/scan")
async def scan_docs(service: DocumentService = Depends(get_document_service)):
    service._scan()


@router.get("/{id}")
async def get_doc(
    id: str, service: DocumentService = Depends(get_document_service)
) -> DocumentRead:
    result = service.get_doc(id)
    if result is None:
        raise HTTPException(
            status_code=404, detail=f"Document with {id} does not exist "
        )
    return result


@router.get("/{id}/file")
async def get_doc_file(
    id: str, service: DocumentService = Depends(get_document_service)
):
    book_path = service.get_doc_file(id)
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


@router.post(f"/{id}")
async def update_doc(
    id: str,
    document: DocumentUpdate,
    service: DocumentService = Depends(get_document_service),
):
    service.update_doc(id, document)
