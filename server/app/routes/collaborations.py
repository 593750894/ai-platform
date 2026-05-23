from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.db.session import get_session
from app.models import Collaboration, CollaborationStatus, CollaborationType, User
from app.schemas.collaborations import (
    CollaborationAuthor,
    CollaborationCreate,
    CollaborationListOut,
    CollaborationOut,
    CollaborationUpdate,
)

router = APIRouter(prefix="/v1/collaborations", tags=["collaborations"])


async def _to_out(collab: Collaboration, session: AsyncSession) -> CollaborationOut:
    author = await session.scalar(select(User).where(User.id == collab.user_id))
    return CollaborationOut(
        id=collab.id,
        title=collab.title,
        description=collab.description,
        collaboration_type=collab.collaboration_type,
        status=collab.status,
        budget=collab.budget,
        deadline=collab.deadline,
        requirements=collab.requirements,
        contact_info=collab.contact_info,
        author=CollaborationAuthor(
            id=author.id,
            name=author.name,
            avatar_url=author.avatar_url,
        ) if author else CollaborationAuthor(id=collab.user_id),
        created_at=collab.created_at,
        updated_at=collab.updated_at,
    )


@router.get("", response_model=CollaborationListOut)
async def list_collaborations(
    session: AsyncSession = Depends(get_session),
    limit: int = Query(default=20, le=100, ge=1),
    offset: int = Query(default=0, ge=0),
    status_filter: CollaborationStatus | None = Query(default=None, alias="status"),
    type_filter: CollaborationType | None = Query(default=None, alias="type"),
    q: str | None = Query(default=None, max_length=200),
) -> CollaborationListOut:
    base = select(Collaboration)
    count_base = select(func.count(Collaboration.id))

    if status_filter is not None:
        base = base.where(Collaboration.status == status_filter)
        count_base = count_base.where(Collaboration.status == status_filter)
    if type_filter is not None:
        base = base.where(Collaboration.collaboration_type == type_filter)
        count_base = count_base.where(Collaboration.collaboration_type == type_filter)
    if q:
        pattern = f"%{q}%"
        base = base.where(
            Collaboration.title.ilike(pattern) | Collaboration.description.ilike(pattern)
        )
        count_base = count_base.where(
            Collaboration.title.ilike(pattern) | Collaboration.description.ilike(pattern)
        )

    total = await session.scalar(count_base) or 0
    rows = (
        await session.scalars(
            base.order_by(Collaboration.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    ).all()

    items = [await _to_out(c, session) for c in rows]
    return CollaborationListOut(items=items, total=total, limit=limit, offset=offset)


@router.get("/{collaboration_id}", response_model=CollaborationOut)
async def get_collaboration(
    collaboration_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> CollaborationOut:
    collab = await session.scalar(
        select(Collaboration).where(Collaboration.id == collaboration_id)
    )
    if collab is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collaboration not found")
    return await _to_out(collab, session)


@router.post("", response_model=CollaborationOut, status_code=status.HTTP_201_CREATED)
async def create_collaboration(
    req: CollaborationCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CollaborationOut:
    collab = Collaboration(
        user_id=user.id,
        title=req.title,
        description=req.description,
        collaboration_type=req.collaboration_type,
        status=CollaborationStatus.OPEN,
        budget=req.budget,
        deadline=req.deadline,
        requirements=req.requirements,
        contact_info=req.contact_info,
    )
    session.add(collab)
    await session.commit()
    await session.refresh(collab)
    return await _to_out(collab, session)


@router.patch("/{collaboration_id}", response_model=CollaborationOut)
async def update_collaboration(
    collaboration_id: UUID,
    req: CollaborationUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> CollaborationOut:
    collab = await session.scalar(
        select(Collaboration).where(Collaboration.id == collaboration_id)
    )
    if collab is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collaboration not found")
    if collab.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the author")

    updates = req.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "no fields to update")
    for field, value in updates.items():
        setattr(collab, field, value)
    session.add(collab)
    await session.commit()
    await session.refresh(collab)
    return await _to_out(collab, session)


@router.delete("/{collaboration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collaboration(
    collaboration_id: UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    collab = await session.scalar(
        select(Collaboration).where(Collaboration.id == collaboration_id)
    )
    if collab is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "collaboration not found")
    if collab.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the author")
    await session.delete(collab)
    await session.commit()
