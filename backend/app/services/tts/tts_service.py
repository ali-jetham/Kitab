from app.services.tts.registry import get_model


class TTSService:
    def synthesize(
        self,
        model: str,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        engine = get_model(model)
        return engine.stream(
            text=text,
            voice=voice,
            speed=speed,
            lang=lang,
        )
