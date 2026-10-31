from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.schemas.search import SearchResponse
from app.services.rag_service import search_resources
from app.llm.router import generate as llm_generate


router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., max_length=500),
    type: str | None = None,
    subject: str | None = None,
    year: int | None = None,
    level: str | None = None,
    page: int = 1,
    limit: int = 10,
    provider: str | None = None,
):
    return await search_resources(
        q=q,
        resource_type=type,
        subject=subject,
        year=year,
        level=level,
        page=page,
        limit=limit,
        provider_override=provider,
    )


@router.get("/explain/stream")
async def explain_stream(
    topic: str = Query(...),
    resource_id: str | None = None,
    level: str = "intermediate",
    provider: str | None = None,
):
    async def event_generator():
        prompt = f"Explain the topic '{topic}' at {level} level with clear steps and examples."
        full_text, provider_used = await llm_generate(prompt, provider)
        # naive chunking to simulate streaming
        chunk_size = max(64, len(full_text) // 4)
        for i in range(0, len(full_text), chunk_size):
            delta = full_text[i : i + chunk_size]
            yield f'data: {{"delta": {delta!r}, "done": false, "citations": []}}\n\n'
        yield f'data: {{"done": true, "full_text": {full_text!r}, "citations": [], "provider_used": {provider_used!r}}}\n\n'

    return StreamingResponse(event_generator(), media_type="text/event-stream")


