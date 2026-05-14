from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid

from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    RegisterRequest, LoginRequest, AdminLoginRequest,
    TokenResponse, UserOut, StudentProfileOut, EmailExistsResponse,
)
from app.security import (
    hash_password, verify_password, encrypt_field, decrypt_field,
    hash_email, create_access_token,
)
from app.deps import get_current_user, get_admin_user
from app.config import get_settings

router = APIRouter(prefix="/users", tags=["users"])
settings = get_settings()


def _user_out(user: User) -> UserOut:
    profile_out = None
    if user.profile:
        p = user.profile
        profile_out = StudentProfileOut(
            plan=p.plan,
            credits_total=p.credits_total,
            credits_used=p.credits_used,
            credits_remaining=p.credits_total - p.credits_used,
            max_per_week=p.max_per_week,
            start_date=p.start_date,
            end_date=p.end_date,
        )
    return UserOut(
        id=user.id,
        name=user.name,
        email=decrypt_field(user.email_encrypted),
        phone=decrypt_field(user.phone_encrypted) if user.phone_encrypted else None,
        role=user.role,
        profile=profile_out,
        created_at=user.created_at,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    email_hash = hash_email(body.email)
    existing = await db.execute(select(User).where(User.email_hash == email_hash))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

    user = User(
        name=body.name,
        email_encrypted=encrypt_field(body.email.lower()),
        email_hash=email_hash,
        phone_encrypted=encrypt_field(body.phone) if body.phone else None,
        password_hash=hash_password(body.password),
        role=UserRole.student,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=_user_out(user))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    email_hash = hash_email(body.email)
    result = await db.execute(
        select(User).where(User.email_hash == email_hash).options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=_user_out(user))


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(body: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    if not verify_password(body.password, settings.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Senha incorreta")

    result = await db.execute(select(User).where(User.role == UserRole.admin))
    admin = result.scalars().first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin não configurado")

    token = create_access_token({"sub": str(admin.id), "role": "admin"})
    return TokenResponse(access_token=token, user=_user_out(admin))


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.id == user.id).options(selectinload(User.profile))
    )
    user = result.scalar_one()
    return _user_out(user)


@router.get("/email-exists", response_model=EmailExistsResponse)
async def email_exists(email: str = Query(...), db: AsyncSession = Depends(get_db)):
    email_hash = hash_email(email)
    result = await db.execute(select(User).where(User.email_hash == email_hash))
    return EmailExistsResponse(exists=result.scalar_one_or_none() is not None)
