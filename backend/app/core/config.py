from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    LIBRARY_PATH: Path = Path("/app/library")
    DB_PATH: str = rf"sqlite:///{LIBRARY_PATH}/library.db"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
