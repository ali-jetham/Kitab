from fastapi import APIRouter, Depends

from app.core.dependencies import get_annotation_service
from app.schemas.annotation import AnnotationDTO
from app.services.annotation_service import AnnotationService

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.post("/")
async def add(
    ann: AnnotationDTO, service: AnnotationService = Depends(get_annotation_service)
):
    await service.add_annotation(ann)


@router.delete("/{id}")
async def delete(id: int, service: AnnotationService = Depends(get_annotation_service)):
    await service.delete_annotation(id)
