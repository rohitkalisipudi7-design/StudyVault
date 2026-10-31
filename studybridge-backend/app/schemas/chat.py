from typing import List, Literal
from uuid import UUID

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: UUID | None = None
    provider: str | None = None


class ChatHistory(BaseModel):
    session_id: UUID
    messages: List[ChatMessage]

