from enum import StrEnum


class TaskStatus(StrEnum):
    PENDING = "pending"
    SUBMITTING = "submitting"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    MIRRORING = "mirroring"
    COMPLETED = "completed"
    COMPLETED_PARTIAL = "completed_partial"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


TERMINAL_STATUSES = frozenset(
    {
        TaskStatus.COMPLETED,
        TaskStatus.COMPLETED_PARTIAL,
        TaskStatus.FAILED,
        TaskStatus.CANCELLED,
        TaskStatus.EXPIRED,
    }
)


class GenerationMode(StrEnum):
    TEXT_TO_VIDEO = "text-to-video"
    IMAGE_TO_VIDEO = "image-to-video"
    FIRST_LAST_FRAME = "first-last-frame"
    MULTI_REFERENCE = "multi-reference"


class AssetKind(StrEnum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class AssetSource(StrEnum):
    URL = "url"
    UPLOAD = "upload"
