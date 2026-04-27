"""Faithful port of d:\\SeedLandV\\electron\\ark\\poller.ts.

Cadence: 3s start, 1.3x backoff, capped at 10s, hard 15-minute timeout.
Terminal statuses end the loop. Transient 5xx warns and continues.
"""
from __future__ import annotations

import logging
import time
from collections.abc import Callable

from app.ark.client import ArkClient, ArkError
from app.ark.types import ArkTaskResponse

logger = logging.getLogger(__name__)

TERMINAL = frozenset({"succeeded", "failed", "cancelled", "expired"})


class PollTimeout(Exception):
    pass


class PollCancelled(Exception):
    pass


def poll_until_done(
    client: ArkClient,
    task_id: str,
    *,
    initial_delay: float = 3.0,
    max_delay: float = 10.0,
    timeout: float = 15 * 60.0,
    on_update: Callable[[ArkTaskResponse], None] | None = None,
    cancel_check: Callable[[], bool] | None = None,
) -> ArkTaskResponse:
    started = time.monotonic()
    delay = initial_delay

    while True:
        if cancel_check and cancel_check():
            raise PollCancelled(f"poll for {task_id} cancelled by caller")
        if time.monotonic() - started > timeout:
            raise PollTimeout(f"polling {task_id} exceeded {timeout:.0f}s")

        time.sleep(delay)

        try:
            snap = client.get_task(task_id)
        except ArkError as e:
            if e.is_transient:
                logger.warning(
                    "ark.poll %s transient %s: %s", task_id, e.status, e
                )
                # leave delay alone; next iteration will still back off
            else:
                logger.error("ark.poll %s fatal: %s", task_id, e)
                raise
        else:
            elapsed = int(time.monotonic() - started)
            logger.info(
                "ark.poll %s status=%s elapsed=%ds", task_id, snap.status, elapsed
            )
            if on_update:
                on_update(snap)
            if snap.status in TERMINAL:
                return snap

        delay = min(delay * 1.3, max_delay)
