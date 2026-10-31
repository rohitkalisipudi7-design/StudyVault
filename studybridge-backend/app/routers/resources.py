from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.resource import Rating, Resource, SavedResource
from app.models.user import User
from app.schemas.resources import ResourceDetail, RateResourceRequest, UploadResourceResponse
from app.services.rag_service import enqueue_resource_ingestion


router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("/{id}", response_model=ResourceDetail)
async def get_resource(id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Resource).where(Resource.id == id)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return ResourceDetail(
        id=resource.id,
        title=resource.title,
        type=resource.type,
        subject=resource.subject,
        summary=None,
        source_url=resource.source_url,
        preview_url=resource.preview_url,
        institution=resource.institution,
        year=resource.year,
        credibility_score=resource.credibility_score,
        community_rating=resource.community_rating,
        rating_count=resource.rating_count,
        is_downloadable=resource.is_downloadable,
        tags=resource.tags,
        uploaded_by=resource.uploaded_by,
        created_at=str(resource.created_at),
    )


@router.post("/upload", response_model=UploadResourceResponse)
async def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(...),
    type: str = Form(...),
    year: int | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # For v1, pretend file is already hosted and use filename as source_url placeholder.
    resource = Resource(
        title=title,
        subject=subject,
        type=type,
        source_url=file.filename,
        year=year,
        is_downloadable=True,
        uploaded_by="community",
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    enqueue_resource_ingestion(str(resource.id))
    return UploadResourceResponse(id=resource.id)


@router.post("/{id}/rate")
async def rate_resource(
    id: UUID,
    body: RateResourceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Resource).where(Resource.id == id)
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    rating = Rating(user_id=current_user.id, resource_id=id, rating=body.rating)
    db.add(rating)
    # naive aggregate update
    resource.rating_count += 1
    resource.community_rating = (
        (resource.community_rating * (resource.rating_count - 1)) + body.rating
    ) / resource.rating_count
    await db.commit()
    return {"status": "ok"}


@router.post("/{id}/save")
async def save_resource(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = SavedResource(user_id=current_user.id, resource_id=id)
    db.add(saved)
    await db.commit()
    return {"status": "ok"}


@router.get("/trending")
async def trending_resources(db: AsyncSession = Depends(get_db)):
    # Simple implementation: top 10 by rating_count
    stmt = select(Resource).order_by(Resource.rating_count.desc()).limit(10)
    result = await db.execute(stmt)
    resources = result.scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "type": r.type,
            "subject": r.subject,
            "source_url": r.source_url,
            "rating_count": r.rating_count,
        }
        for r in resources
    ]



