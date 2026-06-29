import enum
from datetime import datetime, timezone

from sqlalchemy import JSON, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Style(str, enum.Enum):
    HIGHLIGHT = "highlight"
    UNDERLINE = "UNDERLINE"


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[int] = mapped_column(primary_key=True)
    docId: Mapped[str] = mapped_column(ForeignKey("documents.id"))
    color: Mapped[str] = mapped_column()
    style: Mapped[Style] = mapped_column(Enum(Style, name="style"))
    page: Mapped[int] = mapped_column()
    text: Mapped[str] = mapped_column()
    note: Mapped[str] = mapped_column()
    rects: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class PDFRect:
    x1: float
    y1: float
    x2: float
    y2: float
