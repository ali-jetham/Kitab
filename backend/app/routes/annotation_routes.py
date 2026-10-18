from fastapi import APIRouter

from app.core.dependencies import AnnotationServiceDep
from app.schemas.annotation import (
    AnnotationBase,
    AnnotationCreate,
    AnnotationRead,
    AnnotationUpdate,
)

router = APIRouter(prefix="/api/annotations", tags=["annotations"])


@router.get("/", status_code=200, response_model=list[AnnotationBase])
def get_all(service: AnnotationServiceDep):
    return service.get_all_annotations()


@router.post("/", status_code=200, response_model=AnnotationRead)
def add(ann: AnnotationCreate, service: AnnotationServiceDep):
    return service.add_annotation(ann)


@router.put("/{id}", status_code=201, response_model=AnnotationRead)
def update(id: str, ann: AnnotationUpdate, service: AnnotationServiceDep):
    return service.update_annotation(id, ann)


@router.delete("/{id}", status_code=204)
def delete(id: str, service: AnnotationServiceDep):
    return service.delete_annotation(id)
