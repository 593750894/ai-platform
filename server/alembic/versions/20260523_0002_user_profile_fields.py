"""add user profile fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(2048), nullable=True))
    op.add_column("users", sa.Column("bio", sa.String(500), nullable=True))
    op.add_column("users", sa.Column("role", sa.String(50), nullable=True))
    op.add_column("users", sa.Column("skills", postgresql.JSONB(), nullable=True))
    op.add_column("users", sa.Column("tools", postgresql.JSONB(), nullable=True))
    op.add_column("users", sa.Column("portfolio_url", sa.String(2048), nullable=True))
    op.add_column("users", sa.Column("contact_info", postgresql.JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "contact_info")
    op.drop_column("users", "portfolio_url")
    op.drop_column("users", "tools")
    op.drop_column("users", "skills")
    op.drop_column("users", "role")
    op.drop_column("users", "bio")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "name")
