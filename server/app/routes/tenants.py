"""Tenant self-service routes (currently: Ark API key set/clear)."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.crypto import CryptoError, encrypt_ark_key
from app.auth.deps import get_current_user
from app.db.session import get_session
from app.models import Tenant, User

router = APIRouter(prefix="/v1/tenants/me", tags=["tenants"])


class ArkKeyRequest(BaseModel):
    api_key: str = Field(min_length=10, max_length=512)


@router.put("/ark-key", status_code=status.HTTP_204_NO_CONTENT)
async def set_ark_key(
    req: ArkKeyRequest,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    tenant = await session.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "tenant not found")
    try:
        tenant.ark_api_key_ciphertext = encrypt_ark_key(req.api_key)
    except CryptoError as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e)) from e
    await session.commit()


@router.delete("/ark-key", status_code=status.HTTP_204_NO_CONTENT)
async def clear_ark_key(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    tenant = await session.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "tenant not found")
    tenant.ark_api_key_ciphertext = None
    await session.commit()


@router.get("/ark-key", response_model=dict)
async def has_ark_key(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> dict:
    tenant = await session.get(Tenant, user.tenant_id)
    return {"hasKey": bool(tenant and tenant.ark_api_key_ciphertext)}
