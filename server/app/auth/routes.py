from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from app.auth.security import (
    TokenError,
    decode_token,
    encode_access_token,
    encode_refresh_token,
    hash_password,
    verify_password,
)
from app.config import get_settings
from app.db.session import get_session
from app.models import Tenant, User

router = APIRouter(prefix="/v1/auth", tags=["auth"])


def _token_response(user: User) -> TokenResponse:
    s = get_settings()
    return TokenResponse(
        access_token=encode_access_token(user.id, user.tenant_id),
        refresh_token=encode_refresh_token(user.id),
        expires_in=s.jwt_access_ttl_seconds,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    existing = await session.scalar(select(User).where(User.email == req.email))
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "email already registered")

    tenant = Tenant(name=req.tenant_name or req.email.split("@", 1)[0])
    session.add(tenant)
    await session.flush()

    user = User(
        tenant_id=tenant.id,
        email=req.email,
        password_hash=hash_password(req.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    user = await session.scalar(select(User).where(User.email == req.email))
    if user is None or not verify_password(req.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid credentials")
    return _token_response(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    try:
        claims = decode_token(req.refresh_token, expected_type="refresh")
    except TokenError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e)) from e
    user = await session.scalar(select(User).where(User.id == UUID(claims["sub"])))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "user not found")
    return _token_response(user)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email, tenant_id=user.tenant_id)
