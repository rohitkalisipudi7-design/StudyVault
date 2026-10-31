import secrets
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.resource import Bundle
from app.models.user import User
from app.schemas.bundles import BundleDetail, BundleSummary, GenerateBundleRequest


router = APIRouter(prefix="/bundles", tags=["bundles"])


@router.post("/generate", response_model=BundleDetail)
async def generate_bundle(
    body: GenerateBundleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topics: List[str] = body.topics or []
    share_token = secrets.token_urlsafe(16)
    bundle = Bundle(
        user_id=current_user.id,
        title="Custom Study Bundle",
        topics=topics,
        resource_ids=[],
        share_token=share_token,
    )
    db.add(bundle)
    await db.commit()
    await db.refresh(bundle)
    return bundle


@router.get("/{id}", response_model=BundleDetail)
async def get_bundle(id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Bundle).where(Bundle.id == id)
    result = await db.execute(stmt)
    bundle = result.scalar_one_or_none()
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found"
        )
    return bundle


@router.get("/me", response_model=list[BundleSummary])
async def list_my_bundles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Bundle).where(Bundle.user_id == current_user.id)
    result = await db.execute(stmt)
    bundles = result.scalars().all()
    return bundles


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bundle(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Bundle).where(Bundle.id == id)
    result = await db.execute(stmt)
    bundle = result.scalar_one_or_none()
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found"
        )
    if bundle.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
        )
    await db.delete(bundle)
    await db.commit()


