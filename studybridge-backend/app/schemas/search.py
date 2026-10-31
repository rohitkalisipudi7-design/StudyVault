from typing import List, Optional

from pydantic import BaseModel


class ResourceCard(BaseModel):
    id: str
    title: str
    type: str
    subject: str
    summary: str
    source_url: str
    preview_url: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[int] = None
    relevance_score: float
    credibility_score: int
    community_rating: float
    rating_count: int
    is_downloadable: bool
    tags: List[str]
    uploaded_by: Optional[str] = None
    created_at: str


class SearchResponse(BaseModel):
    results: List[ResourceCard]
    total: int
    page: int
    query_interpretation: str
    provider_used: str
    trending_tags: List[str]

