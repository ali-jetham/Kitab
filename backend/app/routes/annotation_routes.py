from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException

from app.core.dependencies import get_annotation_service
from app.schemas.annotation import AnnotationCreate
from app.services.annotation_service import AnnotationService

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.post("/")
async def add(
    ann: AnnotationCreate, service: AnnotationService = Depends(get_annotation_service)
):
    res = await service.add_annotation(ann)
    if res is None:
        raise HTTPException(404, "Document does not exist")
    return res


@router.delete("/{id}")
async def delete(id: int, service: AnnotationService = Depends(get_annotation_service)):
    await service.delete_annotation(id)
