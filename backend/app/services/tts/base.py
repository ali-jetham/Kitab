from abc import ABC, abstractmethod


class TTSModel(ABC):
    @abstractmethod
    def stream(
        self,
        text: str,
        voice: str,
        speed: float,
        lang: str,
    ) -> bytes:
        pass
