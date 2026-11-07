import asyncio
import threading

from watchfiles import BaseFilter, Change, awatch

from app.core.config import settings
from app.db.database import SessionLocal
from app.services.document_service import DocumentService


class LibraryFilter(BaseFilter):
    ignore_dirs = (".covers",)
    allowed_extensions = (".pdf", ".epub")

    def __call__(self, change: Change, path: str) -> bool:
        return super().__call__(change, path) and path.lower().endswith(
            self.allowed_extensions
        )


class WatcherService:
    def __init__(self):
        self._stop = asyncio.Event()
        self._task: asyncio.Task | None = None
        self._lock = threading.Lock()

    def scan(self) -> None:
        with self._lock, SessionLocal() as db:
            DocumentService(db).scan()

    async def _watch(self) -> None:
        async for _ in awatch(
            settings.LIBRARY_PATH,
            watch_filter=LibraryFilter(),
            stop_event=self._stop,
            debounce=3000,
        ):
            await asyncio.to_thread(self.scan)

    async def start(self) -> None:
        await asyncio.to_thread(self.scan)
        self._task = asyncio.create_task(self._watch())

    async def stop(self) -> None:
        self._stop.set()
        if self._task:
            await self._task
