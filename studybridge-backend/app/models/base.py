from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import TIMESTAMP


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[func.now] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

