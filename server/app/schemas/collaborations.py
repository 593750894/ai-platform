from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import CollaborationStatus, CollaborationType


class CollaborationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    collaboration_type: CollaborationType
    budget: str | None = Field(default=None, max_length=100)
    deadline: str | None = Field(default=None, max_length=100)
    requirements: str | None = Field(default=None, max_length=5000)
    contact_info: dict[str, Any] | None = None


class CollaborationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    collaboration_type: CollaborationType | None = None
    status: CollaborationStatus | None = None
    budget: str | None = Field(default=None, max_length=100)
    deadline: str | None = Field(default=None, max_length=100)
    requirements: str | None = Field(default=None, max_length=5000)
    contact_info: dict[str, Any] | None = None


class CollaborationAuthor(BaseModel):
    id: UUID
    name: str | None = None
    avatar_url: str | None = None


class CollaborationOut(BaseModel):
    id: UUID
    title: str
    description: str
    collaboration_type: CollaborationType
    status: CollaborationStatus
    budget: str | None = None
    deadline: str | None = None
    requirements: str | None = None
    contact_info: dict[str, Any] | None = None
    author: CollaborationAuthor
    created_at: datetime
    updated_at: datetime


class CollaborationListOut(BaseModel):
    items: list[CollaborationOut]
    total: int
    limit: int
    offset: int
