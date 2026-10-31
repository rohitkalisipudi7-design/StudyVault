from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserBase(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: str

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBase

