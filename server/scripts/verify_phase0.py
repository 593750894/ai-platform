"""
Phase 0 exit verification.

Checks that the local dev stack is wired up:
  1. Postgres reachable + version readable
  2. Redis reachable + ping
  3. 火山 TOS bucket exists + AK/SK can head it

Run from repo root:
    cd server && python scripts/verify_phase0.py
"""
from __future__ import annotations

import sys
import traceback

import psycopg
import redis
import tos

from app.config import get_settings


def check_postgres(s) -> tuple[bool, str]:
    try:
        # psycopg expects plain DSN, strip the SQLAlchemy dialect prefix
        dsn = s.database_url.replace("postgresql+psycopg://", "postgresql://", 1)
        with psycopg.connect(dsn, connect_timeout=5) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT version()")
                row = cur.fetchone()
                return True, str(row[0]) if row else "ok"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


def check_redis(s) -> tuple[bool, str]:
    try:
        client = redis.Redis.from_url(s.redis_url, socket_connect_timeout=5)
        pong = client.ping()
        return bool(pong), "PONG" if pong else "no pong"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


def check_tos(s) -> tuple[bool, str]:
    try:
        client = tos.TosClientV2(
            ak=s.volc_tos_ak,
            sk=s.volc_tos_sk,
            endpoint=s.volc_tos_endpoint,
            region=s.volc_tos_region,
        )
        client.head_bucket(s.volc_tos_bucket)
        return True, f"bucket={s.volc_tos_bucket} reachable"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


def main() -> int:
    try:
        s = get_settings()
    except Exception:
        print("[FAIL] settings load — check .env exists and required vars are set")
        traceback.print_exc()
        return 2

    checks = (
        ("Postgres", check_postgres),
        ("Redis", check_redis),
        ("火山 TOS", check_tos),
    )
    all_ok = True
    for name, fn in checks:
        ok, detail = fn(s)
        marker = "OK  " if ok else "FAIL"
        print(f"[{marker}] {name}: {detail}")
        all_ok = all_ok and ok

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
