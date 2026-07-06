from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.annotation import Annotation


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(primary_key=True)
    file_path: Mapped[str] = mapped_column()
    file_name: Mapped[str] = mapped_column()
    title: Mapped[str] = mapped_column(nullable=True)
    author: Mapped[str] = mapped_column(JSON())
    cover: Mapped[str] = mapped_column(String())
    annotations: Mapped[list["Annotation"]] = relationship()
    created_at: Mapped[datetime] = mapped_column(DateTime())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=lambda: datetime.now(UTC),
    )
