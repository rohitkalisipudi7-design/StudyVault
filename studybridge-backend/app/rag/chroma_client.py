from chromadb import PersistentClient
from typing import Any

from app.core.config import settings


_client: Any = None


def get_chroma_client() -> Any:
    global _client
    if _client is None:
        _client = PersistentClient(path=settings.chroma_persist_path)
    return _client


async def get_chroma_health() -> str:
    try:
        client = get_chroma_client()
        _ = client.list_collections()
        return "ok"
    except Exception:
        return "error"

