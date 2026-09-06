from pathlib import Path

import requests
from sqlalchemy.orm.session import Session

from app.core.config import settings
from app.core.constants import MODEL_URLS, ModelId, VoiceId
from app.schemas.tts import TTSRegistryResponse
from app.services.tts.registry import get_engine


class TTSService:
    def __init__(self, db: Session):
        self.db: Session = db
        self.model_path = settings.MODEL_PATH

    def synthesize(
        self,
        engine_name: str,
        model_id: str,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        engine = get_engine(engine_name, model_id)
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
        model = MODEL_URLS[id]
        url = model["url"]
        file_name = url.split("/")[-1]
        self._download_file(url, file_name)
        self.download_voices(id, model["required_voice_ids"])

    def get_voices(self, id: ModelId):
        pass

    def download_voices(
        self,
        model_id: ModelId,
        voice_ids: list[VoiceId] | None = None,
    ):
        voices: list = MODEL_URLS[model_id]["voices"]

        if voice_ids is None:
            voice_packs = voices
        else:
            requested_ids = {voice_id.value for voice_id in voice_ids}
            voice_packs = [voice for voice in voices if voice["id"] in requested_ids]

            available_ids = {voice["id"] for voice in voice_packs}
            unsupported_ids = requested_ids - available_ids
            if unsupported_ids:
                unsupported_ids_text = ", ".join(sorted(unsupported_ids))
                raise ValueError(
                    f"Voice packs {unsupported_ids_text} are not available for model {model_id.value}"
                )

        for voice_pack in voice_packs:
            self._download_file(voice_pack["url"], voice_pack["name"])

    def _download_file(self, url: str, file_name: str):
        Path(self.model_path).mkdir(parents=True, exist_ok=True)
        file_path = Path(self.model_path, file_name)

        if file_path.exists():
            return

        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with file_path.open("wb") as f:
                f.writelines(r.iter_content(chunk_size=8192))
