from celery import Celery

from app.config import get_settings


def _make_celery() -> Celery:
    s = get_settings()
    app = Celery(
        "seedlandv",
        broker=s.redis_url,
        backend=s.redis_url,
        include=["app.workers.tasks"],
    )
    app.conf.update(
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        task_track_started=True,
        worker_prefetch_multiplier=1,
        broker_connection_retry_on_startup=True,
        # Phase 6 will add per-tenant rate limits via Redis token bucket.
    )
    return app


celery_app: Celery = _make_celery()
