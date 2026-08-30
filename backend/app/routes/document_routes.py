from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.dependencies import get_document_service
from app.schemas.document import DocumentRead, DocumentUpdate
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/")
async def get_documents(
    service: DocumentService = Depends(get_document_service),
) -> list[DocumentRead]:
    return await service.get_documents()


@router.get("/{id}")
async def get_document(
    id: str, service: DocumentService = Depends(get_document_service)
) -> DocumentRead:
    result = await service.get_document(id)
    if result is None:
        raise HTTPException(
            status_code=404, detail=f"Document with {id} does not exist "
        )
    return result


@router.get("/{id}/file")
async def get_document_file(
    id: str, service: DocumentService = Depends(get_document_service)
):
    document_path = service.get_document_file(id)
    if document_path is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(
        path=document_path,
        media_type="application/pdf",
        headers={"Cache-Control": "private, max-age=3600"},
    )


# TODO: add validation for id
@router.get("/{id}/cover")
async def get_document_cover(id: str):
    file_path = Path(settings.LIBRARY_PATH / ".covers") / f"{id}.jpg"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Cover not found")

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "private, max-age=3600"},
    )


# TODO: use a job and return the job_id
@router.post("/scan")
async def scan_documents(service: DocumentService = Depends(get_document_service)):
    service._scan()


# TODO: check if this should even be exposed to the user
@router.post("/refresh")
async def refresh_covers(service: DocumentService = Depends(get_document_service)):
    service._refresh_covers()


@router.post(f"/{id}")
async def update_document(
    id: str,
    document: DocumentUpdate,
    service: DocumentService = Depends(get_document_service),
):
    service.update_document(id, document)
