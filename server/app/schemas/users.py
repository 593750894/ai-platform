from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, HttpUrl


class UserPublicOut(BaseModel):
    id: UUID
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    role: str | None = None
    skills: list[str] | None = None
    tools: list[str] | None = None
    portfolio_url: str | None = None
    created_at: datetime


class UserProfileOut(UserPublicOut):
    email: EmailStr
    tenant_id: UUID
    contact_info: dict[str, Any] | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=2048)
    bio: str | None = Field(default=None, max_length=500)
    role: str | None = Field(default=None, max_length=50)
    skills: list[str] | None = None
    tools: list[str] | None = None
    portfolio_url: str | None = Field(default=None, max_length=2048)
    contact_info: dict[str, Any] | None = None
