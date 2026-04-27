import httpx
import pytest
import respx

from app.ark.client import ArkClient, ArkError
from app.ark.types import ArkSubmitPayload, ArkContentText

ARK_BASE = "https://ark.cn-beijing.volces.com/api/v3"


def _client() -> ArkClient:
    return ArkClient(api_key="test-key", base_url=ARK_BASE)


def _payload() -> ArkSubmitPayload:
    return ArkSubmitPayload(
        model="doubao-seedance-2-0-260128",
        content=[ArkContentText(type="text", text="hi")],
    )


@respx.mock
def test_submit_success_returns_id():
    respx.post(f"{ARK_BASE}/contents/generations/tasks").mock(
        return_value=httpx.Response(200, json={"id": "task_abc"})
    )
    r = _client().submit(_payload())
    assert r.id == "task_abc"


@respx.mock
def test_submit_400_translates_error_message():
    respx.post(f"{ARK_BASE}/contents/generations/tasks").mock(
        return_value=httpx.Response(
            429,
            json={"error": {"code": "RateLimitExceeded", "message": "slow down"}},
        )
    )
    with pytest.raises(ArkError) as exc:
        _client().submit(_payload())
    assert exc.value.status == 429
    assert exc.value.code == "RateLimitExceeded"
    assert "请求过于频繁" in str(exc.value)


@respx.mock
def test_submit_response_missing_id_raises():
    respx.post(f"{ARK_BASE}/contents/generations/tasks").mock(
        return_value=httpx.Response(200, json={"foo": "bar"})
    )
    with pytest.raises(ArkError, match="缺少任务 id"):
        _client().submit(_payload())


@respx.mock
def test_get_task_returns_parsed_response():
    respx.get(f"{ARK_BASE}/contents/generations/tasks/task_abc").mock(
        return_value=httpx.Response(
            200,
            json={
                "id": "task_abc",
                "status": "succeeded",
                "content": {"video_url": "https://cdn.x/v.mp4"},
                "usage": {"total_tokens": 12345},
            },
        )
    )
    r = _client().get_task("task_abc")
    assert r.status == "succeeded"
    assert r.content and r.content.video_url == "https://cdn.x/v.mp4"
    assert r.usage and r.usage.total_tokens == 12345


@respx.mock
def test_get_task_500_marks_transient():
    respx.get(f"{ARK_BASE}/contents/generations/tasks/x").mock(
        return_value=httpx.Response(503, text="bad gateway")
    )
    with pytest.raises(ArkError) as exc:
        _client().get_task("x")
    assert exc.value.status == 503
    assert exc.value.is_transient


def test_missing_api_key_raises_at_construction():
    with pytest.raises(ArkError, match="缺少 Ark API Key"):
        ArkClient(api_key="")
