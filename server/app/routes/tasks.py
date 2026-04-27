from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.db.session import get_session
from app.models import Task, TaskAsset, User
from app.models.enums import TaskStatus
from app.schemas.tasks import (
    AssetPreview,
    AssetSourceUpload,
    AssetSourceUrl,
    SubmitTaskRequest,
    SubmitTaskResponse,
    TaskOut,
)

router = APIRouter(prefix="/v1/tasks", tags=["tasks"])


def _params_to_jsonb(p) -> dict[str, Any]:
    return p.model_dump(exclude_none=True)


def _epoch_ms(dt: datetime | None) -> int:
    return int(dt.timestamp() * 1000) if dt else 0


def _to_task_out(task: Task, assets: list[TaskAsset]) -> TaskOut:
    previews = [
        AssetPreview(
            kind=a.kind,  # type: ignore[arg-type]
            label=a.origin_url or (a.tos_key or "uploaded"),
        )
        for a in assets
    ]
    return TaskOut(
        server_id=task.uuid,
        id=task.ark_task_id,
        localId=task.local_id,
        mode=task.mode,  # type: ignore[arg-type]
        prompt=task.prompt,
        params=task.params,  # type: ignore[arg-type]
        assetsPreview=previews,
        status=task.status,
        videoUrl=task.tos_video_url or task.ark_video_url,
        lastFrameUrl=task.ark_last_frame,
        error=task.error,  # type: ignore[arg-type]
        createdAt=_epoch_ms(task.created_at),
        updatedAt=_epoch_ms(task.updated_at),
        usage=task.usage,  # type: ignore[arg-type]
    )


@router.post("", response_model=SubmitTaskResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_task(
    req: SubmitTaskRequest,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> SubmitTaskResponse:
    task = Task(
        tenant_id=user.tenant_id,
        user_id=user.id,
        local_id=req.localId,
        mode=req.mode.value,
        prompt=req.prompt,
        params=_params_to_jsonb(req.params),
        status=TaskStatus.PENDING,
    )
    session.add(task)
    await session.flush()

    for idx, asset in enumerate(req.assets):
        if isinstance(asset, AssetSourceUrl):
            session.add(
                TaskAsset(
                    task_id=task.id,
                    position=idx,
                    kind=asset.kind.value,
                    source="url",
                    origin_url=asset.url,
                )
            )
        elif isinstance(asset, AssetSourceUpload):
            # Phase 2: accept the shape, fail fast — Phase 4 wires asset_token resolution.
            raise HTTPException(
                status.HTTP_501_NOT_IMPLEMENTED,
                "asset uploads not implemented until Phase 4 — pass mode='url' for now",
            )

    await session.commit()

    # Enqueue Celery task (sync .delay; Celery's broker call is fast and we don't await it).
    from app.workers.tasks import ark_submit_and_poll

    ark_submit_and_poll.delay(task.id)

    return SubmitTaskResponse(
        server_id=task.uuid, localId=task.local_id, status=task.status
    )


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
    limit: int = 100,
) -> list[TaskOut]:
    rows = (
        await session.scalars(
            select(Task)
            .where(Task.tenant_id == user.tenant_id)
            .order_by(desc(Task.created_at))
            .limit(limit)
        )
    ).all()
    out: list[TaskOut] = []
    for t in rows:
        assets = (
            await session.scalars(
                select(TaskAsset).where(TaskAsset.task_id == t.id).order_by(TaskAsset.position)
            )
        ).all()
        out.append(_to_task_out(t, list(assets)))
    return out


@router.get("/{server_id}", response_model=TaskOut)
async def get_task(
    server_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> TaskOut:
    task = await session.scalar(
        select(Task).where(Task.uuid == server_id, Task.tenant_id == user.tenant_id)
    )
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "task not found")
    assets = (
        await session.scalars(
            select(TaskAsset).where(TaskAsset.task_id == task.id).order_by(TaskAsset.position)
        )
    ).all()
    return _to_task_out(task, list(assets))


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    server_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    task = await session.scalar(
        select(Task).where(Task.uuid == server_id, Task.tenant_id == user.tenant_id)
    )
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "task not found")
    await session.delete(task)
    await session.commit()
