from sqlalchemy.orm.session import Session

from app.services.tts.registry import get_engine


class TTSService:
    def __init__(self, db: Session):
        self.db: Session = db

    def stream(
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
