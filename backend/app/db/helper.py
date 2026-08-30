from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Document


def doc_exists(db: Session, id: str) -> bool:
    stmt = select(Document.id).where(Document.id == id)
    result = db.execute(stmt).scalar() is not None
    return result
