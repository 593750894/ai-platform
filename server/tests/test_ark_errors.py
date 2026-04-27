from app.ark.errors import (
    CODE_MAP,
    HTTP_MAP,
    lookup_by_code,
    parse_ark_error_body,
    translate_ark_error,
)
from app.ark.types import ArkErrorBody


def test_code_map_has_expected_keys():
    # Anchor a few representative codes — full table mirrors errors.ts.
    expected = {
        "AuthenticationError",
        "RateLimitExceeded",
        "InsufficientAccountBalance",
        "InvalidEndpointOrModel.NotFound",
        "SensitiveContentDetected",
        "OutputVideoSensitiveContentDetected",
        "TaskNotFound",
        "ServerOverloaded",
    }
    assert expected.issubset(CODE_MAP.keys())


def test_http_map_covers_common_statuses():
    for code in (400, 401, 403, 404, 408, 429, 500, 502, 503, 504):
        assert code in HTTP_MAP


def test_lookup_exact_match():
    assert lookup_by_code("RateLimitExceeded") == "请求过于频繁，请稍后重试"


def test_lookup_prefix_match_when_dotted_unknown():
    # "InvalidParameter.BadContentURL" — full code unknown, prefix "InvalidParameter" hits.
    msg = lookup_by_code("InvalidParameter.BadContentURL")
    assert msg == CODE_MAP["InvalidParameter"]


def test_lookup_unknown_returns_none():
    assert lookup_by_code("TotallyMadeUpCode") is None
    assert lookup_by_code("Foo.Bar.Baz") is None


def test_translate_with_known_code_appends_code_in_parens():
    result = translate_ark_error(
        429, ArkErrorBody(code="RateLimitExceeded", message="too fast")
    )
    assert "请求过于频繁" in result
    assert "RateLimitExceeded" in result


def test_translate_falls_back_to_http_map_when_code_unknown():
    result = translate_ark_error(
        404, ArkErrorBody(code="MysteryCode", message="huh")
    )
    assert "资源不存在" in result
    assert "MysteryCode" in result


def test_translate_with_only_status_no_payload():
    result = translate_ark_error(503, None)
    assert "服务暂不可用" in result


def test_translate_no_status_no_payload_default():
    assert translate_ark_error(0, None) == "请求失败"


def test_parse_error_body_with_nested_error():
    body = '{"error": {"code": "AuthenticationError", "message": "bad key"}}'
    parsed = parse_ark_error_body(body)
    assert parsed is not None
    assert parsed.code == "AuthenticationError"
    assert parsed.message == "bad key"


def test_parse_error_body_with_flat_message():
    body = '{"message": "boom", "code": "InternalServiceError"}'
    parsed = parse_ark_error_body(body)
    assert parsed is not None
    assert parsed.message == "boom"
    assert parsed.code == "InternalServiceError"


def test_parse_error_body_returns_none_on_garbage():
    assert parse_ark_error_body("not json at all") is None
    assert parse_ark_error_body("") is None
    assert parse_ark_error_body("{}") is None
