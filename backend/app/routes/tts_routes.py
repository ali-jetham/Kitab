from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.dependencies import get_tts_service
from app.schemas.tts import TTSRegistryRequest, TTSRegistryResponse, TTSRequest
from app.services.tts.tts_service import TTSService

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/")
def synthesize(
    request: TTSRequest,
    service: TTSService = Depends(get_tts_service),
):
    wav_bytes = service.synthesize(
        engine_name=request.engine,
        model_id=request.model,
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


@router.get("/models")
def get_models(
    service: TTSService = Depends(get_tts_service),
) -> list[TTSRegistryResponse]:
    """
    Get remote models.
    """
    return service.get_models()


@router.post("/models")
def download_model(
    dto: TTSRegistryRequest, service: TTSService = Depends(get_tts_service)
):
    service.download_model(dto.id)


@router.get("/models/{id}/voices")
def get_voices(dto: TTSRegistryRequest, service: TTSService = Depends(get_tts_service)):
    return service.get_voices(dto.id)
