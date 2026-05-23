from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.db.session import get_session
from app.models import User
from app.schemas.users import UserProfileOut, UserProfileUpdate, UserPublicOut

router = APIRouter(prefix="/v1/users", tags=["users"])

_PUBLIC_COLUMNS = [
    User.id,
    User.name,
    User.avatar_url,
    User.bio,
    User.role,
    User.skills,
    User.tools,
    User.portfolio_url,
    User.created_at,
]


@router.get("", response_model=list[UserPublicOut])
async def list_users(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
) -> list[UserPublicOut]:
    rows = (
        await session.execute(
            select(*_PUBLIC_COLUMNS)
            .order_by(User.created_at.desc())
            .limit(min(limit, 100))
            .offset(offset)
        )
    ).all()
    return [UserPublicOut.model_validate(dict(r._mapping)) for r in rows]


@router.get("/me", response_model=UserProfileOut)
async def get_my_profile(
    user: User = Depends(get_current_user),
) -> UserProfileOut:
    return UserProfileOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        skills=user.skills,
        tools=user.tools,
        portfolio_url=user.portfolio_url,
        contact_info=user.contact_info,
        created_at=user.created_at,
    )


@router.patch("/me", response_model=UserProfileOut)
async def update_my_profile(
    req: UserProfileUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> UserProfileOut:
    updates = req.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "no fields to update")
    for field, value in updates.items():
        setattr(user, field, value)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return UserProfileOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        skills=user.skills,
        tools=user.tools,
        portfolio_url=user.portfolio_url,
        contact_info=user.contact_info,
        created_at=user.created_at,
    )


@router.get("/{user_id}", response_model=UserPublicOut)
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> UserPublicOut:
    row = (
        await session.execute(
            select(*_PUBLIC_COLUMNS).where(User.id == user_id)
        )
    ).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "user not found")
    return UserPublicOut.model_validate(dict(row._mapping))
