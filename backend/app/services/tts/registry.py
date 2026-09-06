from functools import lru_cache

from app.services.tts.base import TTSEngine


@lru_cache
def get_engine(engine: str, model: str) -> TTSEngine:
    match engine:
        case "kokoro":
            from app.services.tts.kokoro import KokoroEngine

            return KokoroEngine(model)
        case _:
            raise ValueError(f"Unknown TTS engine: {engine}")
