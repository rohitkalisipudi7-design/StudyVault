from typing import Any

from app.schemas.search import ResourceCard, SearchResponse
from app.rag.retriever import retrieve_candidates
from app.worker import ingest_resource


async def search_resources(
    q: str,
    resource_type: str | None,
    subject: str | None,
    year: int | None,
    level: str | None,
    page: int,
    limit: int,
    provider_override: str | None,
) -> SearchResponse:
    where: dict[str, Any] = {}
    if resource_type:
        where["type"] = resource_type
    if subject:
        where["subject"] = subject
    if year:
        where["year"] = year

    results = retrieve_candidates(
        query=q,
        collection_name="resources",
        top_k=page * limit,
        where=where,
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    start = (page - 1) * limit
    end = start + limit

    cards: list[ResourceCard] = []
    for i, (doc, meta, distance) in enumerate(zip(docs[start:end], metadatas[start:end], distances[start:end])):
        score = 1.0 - float(distance)
        cards.append(
            ResourceCard(
                id=str(meta.get("id", "")),
                title=str(meta.get("title", "")),
                type=str(meta.get("type", "")),
                subject=str(meta.get("subject", "")),
                summary=str(meta.get("summary", "")),
                source_url=str(meta.get("source_url", "")),
                preview_url=meta.get("preview_url"),
                institution=meta.get("institution"),
                year=meta.get("year"),
                relevance_score=score,
                credibility_score=int(meta.get("credibility_score", 0)),
                community_rating=float(meta.get("community_rating", 0.0)),
                rating_count=int(meta.get("rating_count", 0)),
                is_downloadable=bool(meta.get("is_downloadable", False)),
                tags=list(meta.get("tags", [])),
                uploaded_by=meta.get("uploaded_by"),
                created_at=str(meta.get("created_at", "")),
            )
        )

    # TODO: plug real provider routing and query interpretation
    query_interpretation = q
    provider_used = provider_override or "gemini"

    return SearchResponse(
        results=cards,
        total=len(docs),
        page=page,
        query_interpretation=query_interpretation,
        provider_used=provider_used,
        trending_tags=[],
    )


def enqueue_resource_ingestion(resource_id: str) -> None:
    ingest_resource.delay(resource_id)


