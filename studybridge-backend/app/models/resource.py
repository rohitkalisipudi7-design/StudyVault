from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Float, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Resource(Base, TimestampMixin):
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    subject: Mapped[str] = mapped_column(String(128), nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    preview_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    institution: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    credibility_score: Mapped[int] = mapped_column(Integer, default=0)
    community_rating: Mapped[float] = mapped_column(Float, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    is_downloadable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    uploaded_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    embeddings: Mapped[List["ResourceEmbedding"]] = relationship(
        back_populates="resource", cascade="all, delete-orphan"
    )


class ResourceEmbedding(Base):
    __tablename__ = "resource_embeddings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chroma_id: Mapped[str] = mapped_column(String(128), nullable=False)

    resource: Mapped[Resource] = relationship(back_populates="embeddings")


class Rating(Base, TimestampMixin):
    __tablename__ = "ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)


class SavedResource(Base, TimestampMixin):
    __tablename__ = "saved_resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)


class Bundle(Base, TimestampMixin):
    __tablename__ = "bundles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    topics: Mapped[List[str]] = mapped_column(JSON, default=list)
    resource_ids: Mapped[List[str]] = mapped_column(
        JSON, default=list
    )
    share_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class ChatSession(Base, TimestampMixin):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    messages: Mapped[dict] = mapped_column(JSON, default=dict)
    provider_used: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True
    )
    default_provider: Mapped[str] = mapped_column(String(32), default="gemini")
    encrypted_gemini_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    encrypted_groq_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ollama_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class TrendingQuery(Base, TimestampMixin):
    __tablename__ = "trending_queries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    count: Mapped[int] = mapped_column(Integer, default=0)
    window_date: Mapped[str] = mapped_column(String(16), nullable=False)

