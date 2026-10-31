from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class ResourceDetail(BaseModel):
    id: UUID
    title: str
    type: str
    subject: str
    summary: Optional[str] = None
    source_url: str
    preview_url: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[int] = None
    credibility_score: int
    community_rating: float
    rating_count: int
    is_downloadable: bool
    tags: List[str]
    uploaded_by: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class RateResourceRequest(BaseModel):
    rating: int


class UploadResourceResponse(BaseModel):
    id: UUID

