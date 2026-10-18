from fastapi import APIRouter
from fastapi.responses import Response

from app.core.dependencies import TTSServiceDep
from app.schemas.tts import TTSRegistryRequest, TTSRegistryResponse, TTSRequest

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/synthesize")
def synthesize(request: TTSRequest, service: TTSServiceDep):
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
        media_type="audio/wav",
        headers={"Cache-Control": "no-store"},
    )


@router.get("/models")
def get_models(service: TTSServiceDep) -> list[TTSRegistryResponse]:
    """
    Get remote models.
    """
    return service.get_models()


@router.post("/models")
def download_model(dto: TTSRegistryRequest, service: TTSServiceDep):
    service.download_model(dto.id)


@router.get("/models/{id}/voices")
def get_voices(dto: TTSRegistryRequest, service: TTSServiceDep):
    return service.get_voices(dto.id)
