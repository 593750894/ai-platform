"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TASK_STATUS_VALUES = (
    "pending",
    "submitting",
    "queued",
    "running",
    "succeeded",
    "mirroring",
    "completed",
    "completed_partial",
    "failed",
    "cancelled",
    "expired",
)


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    task_status = postgresql.ENUM(*TASK_STATUS_VALUES, name="task_status")
    task_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "tenants",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("ark_api_key_ciphertext", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_users_tenant_id", "users", ["tenant_id"])

    op.create_table(
        "tasks",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            unique=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("local_id", sa.String(64), nullable=False),
        sa.Column("ark_task_id", sa.String(128), nullable=True, unique=True),
        sa.Column("mode", sa.String(32), nullable=False),
        sa.Column("prompt", sa.String(), nullable=False),
        sa.Column("params", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(*TASK_STATUS_VALUES, name="task_status", create_type=False),
            nullable=False,
            server_default=sa.text("'pending'::task_status"),
        ),
        sa.Column("ark_video_url", sa.String(), nullable=True),
        sa.Column("ark_last_frame", sa.String(), nullable=True),
        sa.Column("tos_video_key", sa.String(), nullable=True),
        sa.Column("tos_video_url", sa.String(), nullable=True),
        sa.Column("usage", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("error", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("attempt", sa.Integer(), nullable=False, server_default="0"),
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
        sa.Column("terminal_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_tasks_tenant_status_created",
        "tasks",
        ["tenant_id", "status", "created_at"],
    )
    op.create_index("ix_tasks_tenant_local_id", "tasks", ["tenant_id", "local_id"])

    op.create_table(
        "task_assets",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "task_id",
            sa.BigInteger(),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.Column("kind", sa.String(16), nullable=False),
        sa.Column("source", sa.String(16), nullable=False),
        sa.Column("origin_url", sa.String(), nullable=True),
        sa.Column("tos_key", sa.String(), nullable=True),
        sa.Column("size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("mime", sa.String(128), nullable=True),
        sa.Column("sha256", sa.String(64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("task_id", "position", name="uq_task_assets_task_position"),
    )

    op.create_table(
        "task_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "task_id",
            sa.BigInteger(),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(*TASK_STATUS_VALUES, name="task_status", create_type=False),
            nullable=True,
        ),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.create_index("ix_task_events_task_at", "task_events", ["task_id", "at"])

    # Trigger: keep tasks.updated_at fresh on every UPDATE
    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
    op.drop_index("ix_task_events_task_at", table_name="task_events")
    op.drop_table("task_events")
    op.drop_table("task_assets")
    op.drop_index("ix_tasks_tenant_local_id", table_name="tasks")
    op.drop_index("ix_tasks_tenant_status_created", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("ix_users_tenant_id", table_name="users")
    op.drop_table("users")
    op.drop_table("tenants")
    op.execute("DROP TYPE IF EXISTS task_status")
