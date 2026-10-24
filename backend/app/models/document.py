import enum
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.annotation import Annotation
from app.models.bookmark import Bookmark


class FileType(str, enum.Enum):
    PDF = ".pdf"
    EPUB = ".epub"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(primary_key=True)
    file_path: Mapped[str] = mapped_column()
    file_name: Mapped[str] = mapped_column()
    file_type: Mapped[FileType] = mapped_column(Enum(FileType, name="file_type"))

    title: Mapped[str] = mapped_column(nullable=True)
    author: Mapped[str] = mapped_column(JSON())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    annotations: Mapped[list["Annotation"]] = relationship()  # noqa: UP037
    bookmarks: Mapped[list["Bookmark"]] = relationship()  # noqa: UP037
