from typing import Any

from app.rag.chroma_client import get_chroma_client
from app.rag.embedder import embed_query


def retrieve_candidates(
    query: str,
    collection_name: str,
    top_k: int = 20,
    where: dict[str, Any] | None = None,
) -> dict:
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=collection_name)
    query_vector = embed_query(query)
    return collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        where=where or {},
        include=["documents", "metadatas", "distances", "ids"],
    )

