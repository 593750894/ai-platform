"""Shared pytest fixtures.

The unit tests in this folder are designed to run WITHOUT a live Postgres / Redis.
Route + integration tests live under tests/integration/ and require docker-compose up.
"""
import os

# Provide harmless defaults so `from app.config import get_settings` doesn't blow up
# during module import in unit tests (the actual values are not used in unit tests).
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://x:x@localhost/x")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
os.environ.setdefault("JWT_SECRET", "test-secret-32-chars-minimum-xxxx")
os.environ.setdefault("VOLC_TOS_AK", "test-ak")
os.environ.setdefault("VOLC_TOS_SK", "test-sk")
os.environ.setdefault("VOLC_TOS_BUCKET", "test-bucket")
os.environ.setdefault("ARK_KEY_FERNET_SECRET", "")
