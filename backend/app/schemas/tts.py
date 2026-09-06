from pydantic import BaseModel, Field

from app.core.constants import ModelId


class TTSRequest(BaseModel):
    engine: str = "kokoro"
    model: str = "kokoro-v1.0"
    text: str = Field(min_length=1, max_length=300)
    voice: str = "af_heart"
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    lang: str = "en-us"


class TTSRegistryResponse(BaseModel):
    quality: str
    id: str


class TTSRegistryRequest(BaseModel):
    id: ModelId
