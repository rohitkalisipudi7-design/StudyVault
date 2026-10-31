import time

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.llm.router import generate as llm_generate
from app.models.resource import UserSettings as UserSettingsModel
from app.models.user import User
from app.schemas.settings import (
    ProviderLatency,
    UserSettingsResponse,
    UserSettingsUpdate,
)


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=UserSettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserSettingsModel).where(
        UserSettingsModel.user_id == current_user.id
    )
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()
    if not settings:
        return UserSettingsResponse(
            default_provider="gemini",
            has_gemini_key=False,
            has_groq_key=False,
            ollama_url=None,
        )
    return UserSettingsResponse(
        default_provider=settings.default_provider,
        has_gemini_key=bool(settings.encrypted_gemini_key),
        has_groq_key=bool(settings.encrypted_groq_key),
        ollama_url=settings.ollama_url,
    )


@router.put("", response_model=UserSettingsResponse)
async def update_settings(
    body: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserSettingsModel).where(
        UserSettingsModel.user_id == current_user.id
    )
    result = await db.execute(stmt)
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettingsModel(user_id=current_user.id)
        db.add(settings)

    if body.default_provider:
        settings.default_provider = body.default_provider
    if body.gemini_api_key is not None:
        settings.encrypted_gemini_key = body.gemini_api_key  # TODO: encrypt
    if body.groq_api_key is not None:
        settings.encrypted_groq_key = body.groq_api_key  # TODO: encrypt
    if body.ollama_url is not None:
        settings.ollama_url = body.ollama_url

    await db.commit()
    await db.refresh(settings)

    return UserSettingsResponse(
        default_provider=settings.default_provider,
        has_gemini_key=bool(settings.encrypted_gemini_key),
        has_groq_key=bool(settings.encrypted_groq_key),
        ollama_url=settings.ollama_url,
    )


@router.get("/providers/test", response_model=list[ProviderLatency])
async def test_providers_latency(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    providers = ["gemini", "groq", "ollama"]
    latencies: list[ProviderLatency] = []
    for provider in providers:
        start = time.perf_counter()
        try:
            await llm_generate("ping", provider)
            elapsed = (time.perf_counter() - start) * 1000
        except Exception:
            elapsed = -1.0
        latencies.append(ProviderLatency(provider=provider, latency_ms=elapsed))
    return latencies


