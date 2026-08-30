from fastapi import Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.services.annotation_service import AnnotationService
from app.services.bookmark_service import BookmarkService
from app.services.document_service import DocumentService


def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError:
        db.rollback()
        raise
    finally:
        db.close()


def get_document_service(
    db: Session = Depends(get_db),
):
    return DocumentService(db)


def get_annotation_service(
    db: Session = Depends(get_db),
):
    return AnnotationService(db)


def get_bookmark_service(
    db: Session = Depends(get_db),
):
    return BookmarkService(db)
