from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class GenerateBundleRequest(BaseModel):
    topics: Optional[List[str]] = None
    # In v1 we accept either topics or a syllabus PDF via frontend → topics extraction


class BundleSummary(BaseModel):
    id: UUID
    title: str
    topics: List[str]
    resource_ids: List[UUID]
    share_token: str

    class Config:
        from_attributes = True


class BundleDetail(BundleSummary):
    pass

