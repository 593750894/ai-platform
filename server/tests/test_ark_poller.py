from unittest.mock import MagicMock

import pytest

from app.ark.client import ArkError
from app.ark.poller import PollCancelled, PollTimeout, poll_until_done
from app.ark.types import ArkContent, ArkTaskResponse


def _resp(status: str, video_url: str | None = None) -> ArkTaskResponse:
    return ArkTaskResponse(
        id="task_x",
        status=status,
        content=ArkContent(video_url=video_url) if video_url else None,
    )


def test_terminal_succeeded_returns_immediately(monkeypatch):
    client = MagicMock()
    client.get_task.side_effect = [_resp("queued"), _resp("succeeded", "https://v.mp4")]
    seen: list[str] = []
    final = poll_until_done(
        client,
        "task_x",
        initial_delay=0,
        max_delay=0,
        on_update=lambda s: seen.append(s.status),
    )
    assert final.status == "succeeded"
    assert seen == ["queued", "succeeded"]


def test_terminal_failed_returns():
    client = MagicMock()
    client.get_task.side_effect = [_resp("running"), _resp("failed")]
    final = poll_until_done(client, "x", initial_delay=0, max_delay=0)
    assert final.status == "failed"


def test_transient_5xx_does_not_raise():
    client = MagicMock()
    client.get_task.side_effect = [
        ArkError("boom", status=503),
        _resp("succeeded"),
    ]
    final = poll_until_done(client, "x", initial_delay=0, max_delay=0)
    assert final.status == "succeeded"


def test_fatal_4xx_raises():
    client = MagicMock()
    client.get_task.side_effect = ArkError("nope", status=403)
    with pytest.raises(ArkError):
        poll_until_done(client, "x", initial_delay=0, max_delay=0)


def test_timeout_raises_pollttimeout():
    client = MagicMock()
    client.get_task.return_value = _resp("running")
    with pytest.raises(PollTimeout):
        poll_until_done(client, "x", initial_delay=0, max_delay=0, timeout=0.05)


def test_cancel_check_triggers_pollcancelled():
    client = MagicMock()
    client.get_task.return_value = _resp("running")
    cancelled = {"v": False}

    def check() -> bool:
        if cancelled["v"]:
            return True
        cancelled["v"] = True
        return False

    with pytest.raises(PollCancelled):
        poll_until_done(
            client,
            "x",
            initial_delay=0,
            max_delay=0,
            cancel_check=check,
        )
