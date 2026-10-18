from pathlib import Path

import pymupdf
import pytest

from app.core.config import settings
from app.models import Document
from app.services.document_service import DocumentService


@pytest.fixture
def document_service(monkeypatch, tmp_path, db_session):
    monkeypatch.setattr(settings, "LIBRARY_PATH", tmp_path)
    return DocumentService(db_session)


@pytest.fixture
def make_pdf(tmp_path):
    def _make_pdf(name="test.pdf"):
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        doc = pymupdf.open()
        doc.new_page()
        doc.save(path)
        doc.close()
        return path

    return _make_pdf


@pytest.fixture
def corpus():
    return Path(__file__).parent.parent / "corpus"


class TestScan:
    def test_scan_adds_new_pdfs(self, make_pdf, document_service, db_session):
        make_pdf("a.pdf")
        make_pdf("b.pdf")
        document_service.scan()

        all_docs = db_session.query(Document).all()
        assert len(all_docs) == 2

    def test_scan_is_idempotent(self, make_pdf, document_service, db_session):
        make_pdf("a.pdf")
        make_pdf("b.pdf")
        document_service.scan()
        document_service.scan()
        document_service.scan()

        all_docs = db_session.query(Document).all()
        assert len(all_docs) == 2

    def test_scan_picks_up_files_added_later(
        self, make_pdf, document_service, db_session
    ):
        make_pdf("a.pdf")
        document_service.scan()
        make_pdf("b.pdf")
        document_service.scan()
        assert db_session.query(Document).count() == 2

    def test_scan_handles_corrupt_pdfs(self, corpus, document_service, db_session):
        document_service.library_path = corpus
        document_service.scan()
        assert db_session.query(Document).count() == 1

    def test_scan_handles_identical_pdfs(self, make_pdf, document_service, db_session):
        make_pdf("a.pdf")
        make_pdf("b.pdf")
        document_service.scan()
        # assert db_session.query(Document.id)

    def test_db_not_overwritten(self):
        pass
