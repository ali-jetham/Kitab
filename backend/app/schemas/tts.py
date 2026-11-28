from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    model: str = "kokoro-v1.0"
    input: str = Field(min_length=1, max_length=500)
    voice: str = "af_heart"
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    lang: str = "en-us"
