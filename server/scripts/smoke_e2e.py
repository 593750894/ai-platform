"""
Phase 2 end-to-end smoke test.

Walks the full happy path against a running stack:
  uvicorn app.main:app + celery worker + Postgres + Redis.

Steps:
  1. Register fresh user
  2. PUT tenant Ark API key (read from VOLC_ARK_API_KEY env)
  3. POST /v1/tasks (text-to-video, 480p, 3s — cheapest combo)
  4. Poll GET /v1/tasks/{server_id} until terminal
  5. Print final status + video_url

Usage:
    # In one shell:
    cd server && uvicorn app.main:app --reload
    # In another:
    cd server && celery -A app.workers.celery_app:celery_app worker -P solo --loglevel=info
    # In a third:
    cd server && VOLC_ARK_API_KEY=... python scripts/smoke_e2e.py
"""
from __future__ import annotations

import os
import secrets
import sys
import time

import httpx

API = os.environ.get("SEEDLANDV_API_URL", "http://localhost:8000")
ARK_KEY = os.environ.get("VOLC_ARK_API_KEY")
PROMPT = os.environ.get(
    "SMOKE_PROMPT", "一只橘色小猫在阳光下伸懒腰，慢镜头特写"
)


def main() -> int:
    if not ARK_KEY:
        print("[FAIL] set VOLC_ARK_API_KEY before running this smoke test")
        return 2

    email = f"smoke-{secrets.token_hex(4)}@local"
    password = "smoke_password_123"

    with httpx.Client(base_url=API, timeout=30) as c:
        r = c.post(
            "/v1/auth/register",
            json={"email": email, "password": password, "tenant_name": "smoke"},
        )
        r.raise_for_status()
        access = r.json()["access_token"]
        h = {"Authorization": f"Bearer {access}"}
        print(f"[OK ] registered + token issued ({email})")

        r = c.put("/v1/tenants/me/ark-key", headers=h, json={"api_key": ARK_KEY})
        r.raise_for_status()
        print("[OK ] tenant Ark key encrypted + stored")

        local_id = f"local-{int(time.time() * 1000)}-smoke"
        r = c.post(
            "/v1/tasks",
            headers=h,
            json={
                "localId": local_id,
                "mode": "text-to-video",
                "prompt": PROMPT,
                "assets": [],
                "params": {
                    "model": "doubao-seedance-2-0-fast-260128",
                    "resolution": "480p",
                    "ratio": "16:9",
                    "duration": 3,
                    "watermark": False,
                    "generateAudio": False,
                    "returnLastFrame": False,
                },
            },
        )
        r.raise_for_status()
        body = r.json()
        server_id = body["server_id"]
        print(f"[OK ] task enqueued server_id={server_id}")

        deadline = time.monotonic() + 15 * 60
        while time.monotonic() < deadline:
            r = c.get(f"/v1/tasks/{server_id}", headers=h)
            r.raise_for_status()
            t = r.json()
            print(f"     status={t['status']} videoUrl={t.get('videoUrl')}")
            if t["status"] in {"completed", "succeeded", "failed", "cancelled", "expired"}:
                if t["status"] in {"completed", "succeeded"}:
                    print("[OK ] terminal: success")
                    return 0
                print(f"[FAIL] terminal: {t['status']} error={t.get('error')}")
                return 1
            time.sleep(5)

        print("[FAIL] smoke test timed out after 15min")
        return 1


if __name__ == "__main__":
    sys.exit(main())
