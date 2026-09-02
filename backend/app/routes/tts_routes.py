from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.constants import ModelId
from app.core.dependencies import get_tts_service
from app.schemas.tts import TTSRegistryResponse, TTSRequest
from app.services.tts.tts_service import TTSService

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/")
def stream(
    request: TTSRequest,
    service: TTSService = Depends(get_tts_service),
):
    wav_bytes = service.synthesize(
        engine_name=request.engine,
        text=request.text,
        voice=request.voice,
        speed=request.speed,
        lang=request.lang,
    )

    return Response(
        content=wav_bytes,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )


@router.get("/registry")
def get_models(
    service: TTSService = Depends(get_tts_service),
) -> list[TTSRegistryResponse]:
    """
    Get remote models.
    """
    return service.get_models()


@router.post("/registry")
def download_model(id: ModelId, service: TTSService = Depends(get_tts_service)):
    service.download_model(id)
