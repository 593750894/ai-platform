"""Faithful port of d:\\SeedLandV\\electron\\ark\\tasks.ts (validateByMode + buildPayload).

Phase 2 difference vs TS: assets are passed in as already-resolved URLs (str).
The caller (Celery worker) resolves `source=url` directly, and `source=upload`
to a TOS signed URL (Phase 4 onwards). Base64 data-URI path is intentionally
removed — uploads always go through TOS.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.ark.types import (
    ArkContentImage,
    ArkContentItem,
    ArkContentText,
    ArkContentVideo,
    ArkContentAudio,
    ArkImageRole,
    ArkSubmitPayload,
    ArkUrlRef,
)
from app.models.enums import AssetKind, GenerationMode


class BuilderError(ValueError):
    """Raised on invalid mode/asset combinations. Caller maps to HTTP 400."""


@dataclass(frozen=True, slots=True)
class ResolvedAsset:
    kind: AssetKind          # image / video / audio
    url: str                 # either origin URL or TOS signed URL
    position: int            # preserves submit order; image position drives role mapping


@dataclass(frozen=True, slots=True)
class TaskParams:
    model: str
    resolution: str | None = None
    ratio: str | None = None
    duration: int | None = None
    watermark: bool | None = None
    generate_audio: bool | None = None
    return_last_frame: bool | None = None
    seed: int | None = None


def validate_by_mode(mode: GenerationMode, assets: list[ResolvedAsset]) -> None:
    imgs = sum(1 for a in assets if a.kind == AssetKind.IMAGE)
    vids = sum(1 for a in assets if a.kind == AssetKind.VIDEO)
    auds = sum(1 for a in assets if a.kind == AssetKind.AUDIO)

    if imgs > 9:
        raise BuilderError("图片最多 9 张")
    if vids > 3:
        raise BuilderError("视频参考最多 3 段")
    if auds > 3:
        raise BuilderError("音频参考最多 3 段")

    if mode == GenerationMode.TEXT_TO_VIDEO and (imgs or vids or auds):
        raise BuilderError("文生视频不接受素材")
    if mode == GenerationMode.IMAGE_TO_VIDEO and imgs != 1:
        raise BuilderError("图生视频需要且仅需要 1 张参考图")
    if mode == GenerationMode.FIRST_LAST_FRAME and imgs != 2:
        raise BuilderError("首尾帧需要 2 张图（首帧在前、尾帧在后）")


def _image_role(mode: GenerationMode, image_index: int) -> ArkImageRole:
    if mode == GenerationMode.FIRST_LAST_FRAME:
        return "first_frame" if image_index == 0 else "last_frame"
    if mode == GenerationMode.IMAGE_TO_VIDEO:
        return "first_frame"
    return "reference_image"


def build_payload(
    mode: GenerationMode,
    prompt: str,
    assets: list[ResolvedAsset],
    params: TaskParams,
) -> ArkSubmitPayload:
    validate_by_mode(mode, assets)

    content: list[ArkContentItem] = []
    if prompt and prompt.strip():
        content.append(ArkContentText(type="text", text=prompt.strip()))

    image_index = 0
    for asset in sorted(assets, key=lambda a: a.position):
        ref = ArkUrlRef(url=asset.url)
        if asset.kind == AssetKind.IMAGE:
            content.append(
                ArkContentImage(
                    type="image_url",
                    image_url=ref,
                    role=_image_role(mode, image_index),
                )
            )
            image_index += 1
        elif asset.kind == AssetKind.VIDEO:
            content.append(
                ArkContentVideo(type="video_url", video_url=ref, role="reference_video")
            )
        else:
            content.append(
                ArkContentAudio(type="audio_url", audio_url=ref, role="reference_audio")
            )

    return ArkSubmitPayload(
        model=params.model,
        content=content,
        resolution=params.resolution,
        ratio=params.ratio,
        duration=params.duration,
        watermark=params.watermark,
        generate_audio=params.generate_audio,
        return_last_frame=params.return_last_frame,
        seed=params.seed,
    )
