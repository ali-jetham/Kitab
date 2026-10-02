from fastapi import APIRouter

from app.core.dependencies import AnnotationServiceDep
from app.schemas.annotation import (
    AnnotationBase,
    AnnotationCreate,
    AnnotationRead,
    AnnotationUpdate,
)

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.get("/")
async def get_all(service: AnnotationServiceDep) -> list[AnnotationBase]:
    return await service.get_all_annotations()


@router.post("/")
async def add(ann: AnnotationCreate, service: AnnotationServiceDep) -> AnnotationRead:
    return await service.add_annotation(ann)


@router.put("/{id}")
async def update(id: str, ann: AnnotationUpdate, service: AnnotationServiceDep):
    return await service.update_annotation(id, ann)


# TODO: add return pydantic schema
@router.delete("/{id}")
async def delete(id: str, service: AnnotationServiceDep):
    return await service.delete_annotation(id)
