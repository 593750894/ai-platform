from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import CollaborationStatus, CollaborationType

collab_status_enum = PG_ENUM(
    CollaborationStatus,
    name="collaboration_status",
    values_callable=lambda e: [m.value for m in e],
    create_type=False,
)

collab_type_enum = PG_ENUM(
    CollaborationType,
    name="collaboration_type",
    values_callable=lambda e: [m.value for m in e],
    create_type=False,
)


class Collaboration(Base):
    __tablename__ = "collaborations"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    collaboration_type: Mapped[CollaborationType] = mapped_column(
        collab_type_enum, nullable=False
    )
    status: Mapped[CollaborationStatus] = mapped_column(
        collab_status_enum, nullable=False, default=CollaborationStatus.OPEN
    )
    budget: Mapped[str | None] = mapped_column(String(100), nullable=True)
    deadline: Mapped[str | None] = mapped_column(String(100), nullable=True)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_info: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_collaborations_status", "status"),
        Index("ix_collaborations_type", "collaboration_type"),
        Index("ix_collaborations_user_id", "user_id"),
        Index("ix_collaborations_created_at", "created_at"),
    )
