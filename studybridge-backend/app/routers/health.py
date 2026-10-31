from fastapi import APIRouter

from app.core.config import settings
from app.db.session import get_db_health
from app.rag.chroma_client import get_chroma_health


router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    db_status = await get_db_health()
    chroma_status = await get_chroma_health()
    return {
        "status": "ok" if db_status == "ok" and chroma_status == "ok" else "error",
        "version": "1.0.0",
        "db": db_status,
        "chroma": chroma_status,
    }

