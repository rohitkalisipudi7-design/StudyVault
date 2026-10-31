from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserBase


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserBase)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == body.email)
    existing = await db.execute(stmt)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == body.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(
        body.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=user)  # type: ignore[arg-type]


@router.get("/me", response_model=UserBase)
async def me(current_user: User = Depends(get_current_user)):
    return current_user

