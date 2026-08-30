from fastapi import APIRouter, Depends

from app.core.dependencies import get_annotation_service
from app.schemas.annotation import AnnotationCreate
from app.services.annotation_service import AnnotationService

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.post("/")
async def add(
    ann: AnnotationCreate, service: AnnotationService = Depends(get_annotation_service)
):
    return await service.add_annotation(ann)


@router.delete("/{id}")
async def delete(id: str, service: AnnotationService = Depends(get_annotation_service)):
    return await service.delete_annotation(id)
