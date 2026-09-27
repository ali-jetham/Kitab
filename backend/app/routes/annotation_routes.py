from fastapi import APIRouter, Depends

from app.core.dependencies import get_annotation_service
from app.schemas.annotation import AnnotationBase, AnnotationCreate, AnnotationRead
from app.services.annotation_service import AnnotationService

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.get("/")
async def get_all(
    service: AnnotationService = Depends(get_annotation_service),
) -> list[AnnotationBase]:
    return await service.get_all_annotations()


@router.post("/")
async def add(
    ann: AnnotationCreate, service: AnnotationService = Depends(get_annotation_service)
) -> AnnotationRead:
    return await service.add_annotation(ann)


# TODO: add return pydantic schema
@router.delete("/{id}")
async def delete(id: str, service: AnnotationService = Depends(get_annotation_service)):
    return await service.delete_annotation(id)
