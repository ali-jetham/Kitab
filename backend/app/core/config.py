from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "prod"
    LIBRARY_PATH: Path = Path("/app/library")
    model_config = SettingsConfigDict(env_file=".env")

    @property
    def DB_PATH(self) -> str:
        return f"sqlite:///{self.LIBRARY_PATH / 'library.db'}"



settings = Settings()
