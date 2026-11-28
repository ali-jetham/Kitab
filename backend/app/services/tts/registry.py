from functools import lru_cache

from app.services.tts.base import TTSModel


@lru_cache
def get_model(model: str) -> TTSModel:
    match model:
        case "kokoro-v1.0":
            from app.services.tts.kokoro import KokoroModel

            return KokoroModel(model)
        case _:
            raise ValueError(f"Unknown TTS engine: {model}")
