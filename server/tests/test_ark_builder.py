import pytest

from app.ark.builder import (
    BuilderError,
    ResolvedAsset,
    TaskParams,
    build_payload,
    validate_by_mode,
)
from app.models.enums import AssetKind, GenerationMode

PARAMS = TaskParams(
    model="doubao-seedance-2-0-260128",
    resolution="720p",
    ratio="16:9",
    duration=5,
    watermark=False,
)


def img(pos: int = 0) -> ResolvedAsset:
    return ResolvedAsset(kind=AssetKind.IMAGE, url=f"https://x/i{pos}.png", position=pos)


def vid(pos: int = 0) -> ResolvedAsset:
    return ResolvedAsset(kind=AssetKind.VIDEO, url=f"https://x/v{pos}.mp4", position=pos)


def aud(pos: int = 0) -> ResolvedAsset:
    return ResolvedAsset(kind=AssetKind.AUDIO, url=f"https://x/a{pos}.mp3", position=pos)


# ---------- validate_by_mode ----------


def test_text_to_video_rejects_assets():
    with pytest.raises(BuilderError, match="文生视频"):
        validate_by_mode(GenerationMode.TEXT_TO_VIDEO, [img(0)])


def test_image_to_video_requires_exactly_one_image():
    with pytest.raises(BuilderError):
        validate_by_mode(GenerationMode.IMAGE_TO_VIDEO, [])
    with pytest.raises(BuilderError):
        validate_by_mode(GenerationMode.IMAGE_TO_VIDEO, [img(0), img(1)])
    validate_by_mode(GenerationMode.IMAGE_TO_VIDEO, [img(0)])  # ok


def test_first_last_frame_requires_two_images():
    with pytest.raises(BuilderError):
        validate_by_mode(GenerationMode.FIRST_LAST_FRAME, [img(0)])
    validate_by_mode(GenerationMode.FIRST_LAST_FRAME, [img(0), img(1)])


def test_max_caps_9_3_3():
    with pytest.raises(BuilderError, match="9 张"):
        validate_by_mode(
            GenerationMode.MULTI_REFERENCE, [img(i) for i in range(10)]
        )
    with pytest.raises(BuilderError, match="3 段"):
        validate_by_mode(
            GenerationMode.MULTI_REFERENCE, [vid(i) for i in range(4)]
        )
    with pytest.raises(BuilderError, match="3 段"):
        validate_by_mode(
            GenerationMode.MULTI_REFERENCE, [aud(i) for i in range(4)]
        )


# ---------- build_payload ----------


def test_text_to_video_payload_shape():
    p = build_payload(GenerationMode.TEXT_TO_VIDEO, "  hello  ", [], PARAMS)
    assert p.model == PARAMS.model
    assert len(p.content) == 1
    text = p.content[0]
    assert text.type == "text"
    assert text.text == "hello"


def test_image_to_video_image_role_first_frame():
    p = build_payload(
        GenerationMode.IMAGE_TO_VIDEO, "anim", [img(0)], PARAMS
    )
    image_items = [c for c in p.content if c.type == "image_url"]
    assert len(image_items) == 1
    assert image_items[0].role == "first_frame"


def test_first_last_frame_assigns_first_then_last():
    p = build_payload(
        GenerationMode.FIRST_LAST_FRAME, "morph", [img(0), img(1)], PARAMS
    )
    image_items = [c for c in p.content if c.type == "image_url"]
    assert [it.role for it in image_items] == ["first_frame", "last_frame"]


def test_multi_reference_assigns_reference_roles():
    assets = [img(0), vid(1), aud(2)]
    p = build_payload(GenerationMode.MULTI_REFERENCE, "remix", assets, PARAMS)
    by_type = {c.type: c for c in p.content if c.type != "text"}
    assert by_type["image_url"].role == "reference_image"
    assert by_type["video_url"].role == "reference_video"
    assert by_type["audio_url"].role == "reference_audio"


def test_payload_carries_params():
    p = build_payload(GenerationMode.TEXT_TO_VIDEO, "x", [], PARAMS)
    assert p.resolution == "720p"
    assert p.ratio == "16:9"
    assert p.duration == 5
    assert p.watermark is False


def test_payload_omits_seed_when_none():
    p = build_payload(GenerationMode.TEXT_TO_VIDEO, "x", [], PARAMS)
    assert p.seed is None


def test_payload_with_seed():
    params = TaskParams(model="m", seed=42)
    p = build_payload(GenerationMode.TEXT_TO_VIDEO, "x", [], params)
    assert p.seed == 42


def test_blank_prompt_omits_text_item():
    p = build_payload(GenerationMode.IMAGE_TO_VIDEO, "   ", [img(0)], PARAMS)
    assert all(c.type != "text" for c in p.content)


def test_assets_sorted_by_position():
    # build_payload should respect position regardless of input order
    p = build_payload(
        GenerationMode.FIRST_LAST_FRAME, "x", [img(1), img(0)], PARAMS
    )
    image_items = [c for c in p.content if c.type == "image_url"]
    # position 0 first → first_frame, position 1 second → last_frame
    assert image_items[0].role == "first_frame"
    assert image_items[1].role == "last_frame"
    assert image_items[0].image_url.url.endswith("i0.png")
