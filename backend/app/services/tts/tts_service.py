from pathlib import Path

import requests
from sqlalchemy.orm.session import Session

from app.core.config import settings
from app.core.constants import MODEL_URLS, ModelId
from app.schemas.tts import TTSRegistryResponse
from app.services.tts.registry import get_engine


class TTSService:
    def __init__(self, db: Session):
        self.db: Session = db
        self.model_path = settings.MODEL_PATH

    def synthesize(
        self,
        engine_name: str,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        engine = get_engine(engine_name)
        return engine.stream(
            text=text,
            voice=voice,
            speed=speed,
            lang=lang,
        )

    def get_models(self) -> list[TTSRegistryResponse]:
        return [
            TTSRegistryResponse.model_validate({"id": k, **v})
            for k, v in MODEL_URLS.items()
        ]

    def download_model(self, id: ModelId):
        url = MODEL_URLS[id]["url"]
        file_name = url.split("/")[-1]
        Path(self.model_path).mkdir(parents=True, exist_ok=True)

        if Path(f"{self.model_path}/{file_name}").exists():
            return

        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(f"{self.model_path}/{file_name}", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        file_name = "voices-v1.0.bin"
        with requests.get(
            "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin",
            stream=True,
        ) as r:
            r.raise_for_status()
            with open(f"{self.model_path}/{file_name}", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

    def download_voice(self, id: str):
        pass
