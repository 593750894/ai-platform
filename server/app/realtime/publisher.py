"""Redis pub/sub publisher: status deltas → `task:{tenant_id}` channel.

Phase 3's WebSocket route subscribes and fans out per connected client.
Sync client because Celery worker is sync.
"""
from __future__ import annotations

import json
import logging
from functools import lru_cache
from typing import Any
from uuid import UUID

import redis

from app.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache
def _client() -> redis.Redis:
    return redis.Redis.from_url(get_settings().redis_url, decode_responses=True)


def channel_for(tenant_id: UUID | str) -> str:
    return f"task:{tenant_id}"


def publish_task_update(tenant_id: UUID | str, payload: dict[str, Any]) -> None:
    try:
        _client().publish(channel_for(tenant_id), json.dumps(payload, default=str))
    except redis.RedisError as e:
        # Pub/sub failures must not kill the worker — DB is still source of truth.
        logger.warning("redis publish failed for tenant=%s: %s", tenant_id, e)
