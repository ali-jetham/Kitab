from fastapi import APIRouter
from fastapi.responses import Response

from app.core.dependencies import TTSServiceDep
from app.schemas.tts import TTSRequest

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/synthesize")
def synthesize(request: TTSRequest, service: TTSServiceDep):
    wav_bytes = service.synthesize(
        model=request.model,
        text=request.input,
        voice=request.voice,
        speed=request.speed,
        lang=request.lang,
    )

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={"Cache-Control": "no-store"},
    )
