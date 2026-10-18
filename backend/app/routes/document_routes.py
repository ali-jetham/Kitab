from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.core.dependencies import DocumentServiceDep
from app.schemas.document import DocumentBase, DocumentId, DocumentRead, DocumentUpdate

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/", status_code=200, response_model=list[DocumentBase])
def get_documents(service: DocumentServiceDep):
    return service.get_documents()


@router.get("/{id}", status_code=200, response_model=DocumentRead)
def get_document(id: str, service: DocumentServiceDep):
    return service.get_document(id)


@router.get("/{id}/file")
def get_document_file(id: DocumentId, service: DocumentServiceDep) -> FileResponse:
    document_path = service.get_document_file(id)
    return FileResponse(
        path=document_path,
        media_type="application/pdf",
        headers={"Cache-Control": "private, max-age=3600"},
    )


@router.get("/{id}/{page}/text")
def get_document_page_text(id: DocumentId, page: int, service: DocumentServiceDep):
    return service.get_page_text(id, page)


@router.get("/{id}/cover")
def get_document_cover(id: DocumentId, service: DocumentServiceDep):
    file_path = service.get_document_cover(id)
    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "private, max-age=3600"},
    )


# TODO: use a job and return the job_id
@router.post("/scan")
def scan_documents(service: DocumentServiceDep):
    service.scan()


@router.post("/refresh")
def refresh_covers(service: DocumentServiceDep):
    service.refresh_covers()


@router.post(f"/{id}")
def update_document(id: str, document: DocumentUpdate, service: DocumentServiceDep):
    service.update_document(id, document)
