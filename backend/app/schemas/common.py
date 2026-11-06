import pymupdf
from pydantic import RootModel, model_validator


class PDFRect(RootModel[tuple[float, float, float, float]]):
    @model_validator(mode="before")
    @classmethod
    def convert_rect(cls, value):
        return tuple(value) if isinstance(value, pymupdf.Rect) else value
