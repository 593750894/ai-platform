"""Sync engine for Celery workers (which run sync httpx + sync SQLAlchemy)."""
from __future__ import annotations

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings


def _make_sync_url(async_url: str) -> str:
    # psycopg 3 driver string works for both async + sync engines via SQLAlchemy.
    return async_url


def _make_engine() -> Engine:
    s = get_settings()
    return create_engine(
        _make_sync_url(s.database_url),
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


sync_engine: Engine = _make_engine()
SyncSessionLocal: sessionmaker[Session] = sessionmaker(
    sync_engine, expire_on_commit=False, autoflush=False
)
