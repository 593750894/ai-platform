"""Sync httpx port of d:\\SeedLandV\\electron\\ark\\client.ts.

Per-tenant Ark API key is decrypted from `tenants.ark_api_key_ciphertext` and
passed in via the `api_key` argument — never read from process env.
"""
from __future__ import annotations

import json

import httpx

from app.ark.errors import parse_ark_error_body, translate_ark_error
from app.ark.types import ArkSubmitPayload, ArkSubmitResponse, ArkTaskResponse
from app.config import get_settings


class ArkError(Exception):
    def __init__(
        self,
        message: str,
        status: int = 0,
        raw: str | None = None,
        code: str | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.raw = raw
        self.code = code

    @property
    def is_transient(self) -> bool:
        return self.status >= 500 or self.status == 429


class ArkClient:
    def __init__(self, api_key: str, base_url: str | None = None, timeout: float = 30.0) -> None:
        if not api_key:
            raise ArkError("缺少 Ark API Key（请在租户上配置）")
        self._api_key = api_key
        self._base = (base_url or get_settings().ark_base_url).rstrip("/")
        self._timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self._api_key}",
        }

    def submit(self, payload: ArkSubmitPayload) -> ArkSubmitResponse:
        url = f"{self._base}/contents/generations/tasks"
        body = payload.model_dump(exclude_none=True)
        with httpx.Client(timeout=self._timeout) as c:
            r = c.post(url, json=body, headers=self._headers())
        text = r.text
        if r.status_code >= 400:
            err = parse_ark_error_body(text)
            raise ArkError(
                translate_ark_error(r.status_code, err),
                status=r.status_code,
                raw=text,
                code=err.code if err else None,
            )
        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            raise ArkError("接口响应解析失败", status=r.status_code, raw=text) from e
        if not data.get("id"):
            raise ArkError("接口响应缺少任务 id 字段", status=r.status_code, raw=text)
        return ArkSubmitResponse.model_validate(data)

    def get_task(self, task_id: str) -> ArkTaskResponse:
        url = f"{self._base}/contents/generations/tasks/{task_id}"
        with httpx.Client(timeout=self._timeout) as c:
            r = c.get(url, headers=self._headers())
        text = r.text
        if r.status_code >= 400:
            err = parse_ark_error_body(text)
            raise ArkError(
                translate_ark_error(r.status_code, err),
                status=r.status_code,
                raw=text,
                code=err.code if err else None,
            )
        return ArkTaskResponse.model_validate_json(text)
