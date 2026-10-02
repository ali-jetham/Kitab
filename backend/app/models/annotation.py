import enum
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Style(str, enum.Enum):
    HIGHLIGHT = "highlight"
    UNDERLINE = "underline"


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[str] = mapped_column(primary_key=True)
    doc_id: Mapped[str] = mapped_column(ForeignKey("documents.id"))
    color: Mapped[str] = mapped_column()
    style: Mapped[Style] = mapped_column(Enum(Style, name="style"))
    page: Mapped[int] = mapped_column()
    text: Mapped[str] = mapped_column()
    note: Mapped[str] = mapped_column()
    rects: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class PDFRect:
    x1: float
    y1: float
    x2: float
    y2: float
