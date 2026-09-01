from abc import ABC, abstractmethod


class TTSEngine(ABC):
    @abstractmethod
    def stream(
        self,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        pass
