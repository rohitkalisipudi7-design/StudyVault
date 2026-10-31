from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./studybridge.db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change_me"
    access_token_expire: int = 3600
    refresh_token_expire: int = 604800
    default_llm_provider: str = "gemini"
    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    ollama_base_url: str = "http://localhost:11434"
    chroma_persist_path: str = "./data/chroma"
    cors_origins: List[str] = ["http://localhost:3000"]
    api_base_url: str = "http://localhost:8000"

    google_client_id: str | None = None
    google_client_secret: str | None = None
    github_client_id: str | None = None
    github_client_secret: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

