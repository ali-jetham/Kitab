from io import BytesIO
from pathlib import Path
from typing import override

import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

from app.core.config import settings
from app.services.tts.base import TTSEngine


class KokoroEngine(TTSEngine):
    def __init__(self, model: str):
        self.library_path: Path = settings.LIBRARY_PATH
        self.model_path: Path = settings.MODEL_PATH
        self.tokenizer: Tokenizer = Tokenizer()
        self.kokoro: Kokoro = Kokoro(
            f"{self.model_path!s}/{model}.onnx",
            f"{self.model_path!s}/voices-v1.0.bin",
        )

    @override
    def stream(
        self,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        samples, sample_rate = self.kokoro.create(
            text,
            voice=voice,
            speed=speed,
            lang=lang,
        )

        output = BytesIO()
        sf.write(output, samples, sample_rate, format="wav")
        return output.getvalue()
