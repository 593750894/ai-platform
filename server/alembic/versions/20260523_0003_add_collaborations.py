"""add collaborations table

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COLLABORATION_STATUS_VALUES = ("open", "matched", "closed")

COLLABORATION_TYPE_VALUES = (
    "ai-video-team",
    "ai-comic-creator",
    "ai-short-drama",
    "digital-human",
    "prompt-engineer",
    "comfyui-workflow",
    "video-editor",
    "co-founder",
    "investment-biz",
)


def upgrade() -> None:
    collab_status = postgresql.ENUM(*COLLABORATION_STATUS_VALUES, name="collaboration_status")
    collab_status.create(op.get_bind(), checkfirst=True)

    collab_type = postgresql.ENUM(*COLLABORATION_TYPE_VALUES, name="collaboration_type")
    collab_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "collaborations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "collaboration_type",
            postgresql.ENUM(*COLLABORATION_TYPE_VALUES, name="collaboration_type", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM(*COLLABORATION_STATUS_VALUES, name="collaboration_status", create_type=False),
            nullable=False,
            server_default=sa.text("'open'::collaboration_status"),
        ),
        sa.Column("budget", sa.String(100), nullable=True),
        sa.Column("deadline", sa.String(100), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("contact_info", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_collaborations_status", "collaborations", ["status"])
    op.create_index("ix_collaborations_type", "collaborations", ["collaboration_type"])
    op.create_index("ix_collaborations_user_id", "collaborations", ["user_id"])
    op.create_index("ix_collaborations_created_at", "collaborations", ["created_at"])

    op.execute(
        """
        CREATE TRIGGER trg_collaborations_updated_at
            BEFORE UPDATE ON collaborations
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_collaborations_updated_at ON collaborations")
    op.drop_index("ix_collaborations_created_at", table_name="collaborations")
    op.drop_index("ix_collaborations_user_id", table_name="collaborations")
    op.drop_index("ix_collaborations_type", table_name="collaborations")
    op.drop_index("ix_collaborations_status", table_name="collaborations")
    op.drop_table("collaborations")
    op.execute("DROP TYPE IF EXISTS collaboration_type")
    op.execute("DROP TYPE IF EXISTS collaboration_status")
