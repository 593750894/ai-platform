"""Pydantic mirrors of d:\\SeedLandV\\electron\\ark\\types.ts."""
from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field

ArkImageRole = Literal["first_frame", "last_frame", "reference_image"]
ArkVideoRole = Literal["reference_video"]
ArkAudioRole = Literal["reference_audio"]


class ArkUrlRef(BaseModel):
    url: str


class ArkContentText(BaseModel):
    type: Literal["text"]
    text: str


class ArkContentImage(BaseModel):
    type: Literal["image_url"]
    image_url: ArkUrlRef
    role: ArkImageRole | None = None


class ArkContentVideo(BaseModel):
    type: Literal["video_url"]
    video_url: ArkUrlRef
    role: ArkVideoRole | None = None


class ArkContentAudio(BaseModel):
    type: Literal["audio_url"]
    audio_url: ArkUrlRef
    role: ArkAudioRole | None = None


ArkContentItem = Annotated[
    Union[ArkContentText, ArkContentImage, ArkContentVideo, ArkContentAudio],
    Field(discriminator="type"),
]


class ArkSubmitPayload(BaseModel):
    model: str
    content: list[ArkContentItem]
    resolution: str | None = None
    ratio: str | None = None
    duration: int | None = None
    watermark: bool | None = None
    generate_audio: bool | None = None
    return_last_frame: bool | None = None
    seed: int | None = None


class ArkSubmitResponse(BaseModel):
    id: str


ArkTaskStatus = Literal["queued", "running", "succeeded", "failed", "cancelled", "expired"]


class ArkContent(BaseModel):
    video_url: str | None = None
    last_frame_url: str | None = None


class ArkUsage(BaseModel):
    completion_tokens: int | None = None
    total_tokens: int | None = None


class ArkErrorBody(BaseModel):
    code: str | None = None
    message: str | None = None
    param: str | None = None
    type: str | None = None


class ArkTaskResponse(BaseModel):
    id: str
    status: ArkTaskStatus
    content: ArkContent | None = None
    usage: ArkUsage | None = None
    error: ArkErrorBody | None = None
