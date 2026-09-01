from functools import lru_cache

from app.services.tts.base import TTSEngine


@lru_cache
def get_engine(name: str) -> TTSEngine:
    match name:
        case "kokoro":
            from app.services.tts.kokoro import KokoroEngine
            return KokoroEngine()
        case "piper":
            raise NotImplementedError("Piper is not configured")
        case _:
            raise ValueError(f"Unknown TTS engine: {name}")
