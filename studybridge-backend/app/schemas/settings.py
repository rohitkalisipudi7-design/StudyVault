from pydantic import BaseModel


class UserSettingsResponse(BaseModel):
    default_provider: str
    has_gemini_key: bool
    has_groq_key: bool
    ollama_url: str | None = None


class UserSettingsUpdate(BaseModel):
    default_provider: str | None = None
    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    ollama_url: str | None = None


class ProviderLatency(BaseModel):
    provider: str
    latency_ms: float

