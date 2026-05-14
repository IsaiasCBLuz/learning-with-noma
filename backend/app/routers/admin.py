from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
import uuid

from app.database import get_db
from app.deps import get_admin_user
from app.models import User, StudentProfile, UserRole, PLAN_CREDITS, PLAN_MAX_PER_WEEK, PlanType
from app.schemas import (
    AdminCreateStudentRequest, AdminUpdateStudentRequest,
    UserOut, StudentProfileOut,
)
from app.security import hash_password, encrypt_field, decrypt_field, hash_email

router = APIRouter(prefix="/admin", tags=["admin"])


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


@router.get("/students", response_model=list[UserOut])
async def list_students(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.student)
        .options(selectinload(User.profile))
        .order_by(User.created_at.desc())
    )
    return [_user_out(u) for u in result.scalars().all()]


@router.post("/students", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_student(
    body: AdminCreateStudentRequest,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
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
    await db.flush()

    plan = body.plan
    profile = StudentProfile(
        user_id=user.id,
        plan=plan,
        credits_total=PLAN_CREDITS[plan],
        credits_used=0,
        max_per_week=PLAN_MAX_PER_WEEK[plan],
        start_date=body.start_date,
        end_date=body.end_date,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)
    user.profile = profile
    return _user_out(user)


@router.patch("/students/{user_id}", response_model=UserOut)
async def update_student(
    user_id: uuid.UUID,
    body: AdminUpdateStudentRequest,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == user_id, User.role == UserRole.student)
        .options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    if body.name is not None:
        user.name = body.name
    if body.phone is not None:
        user.phone_encrypted = encrypt_field(body.phone)

    if user.profile is None and body.plan is not None:
        plan = body.plan
        profile = StudentProfile(
            user_id=user.id,
            plan=plan,
            credits_total=PLAN_CREDITS[plan],
            credits_used=0,
            max_per_week=PLAN_MAX_PER_WEEK[plan],
            start_date=body.start_date,
            end_date=body.end_date,
        )
        db.add(profile)
    elif user.profile is not None:
        p = user.profile
        if body.plan is not None:
            p.plan = body.plan
            p.credits_total = PLAN_CREDITS[body.plan]
            p.max_per_week = PLAN_MAX_PER_WEEK[body.plan]
        if body.credits_used is not None:
            p.credits_used = body.credits_used
        if body.start_date is not None:
            p.start_date = body.start_date
        if body.end_date is not None:
            p.end_date = body.end_date

    await db.commit()
    await db.refresh(user)
    return _user_out(user)


@router.delete("/students/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    user_id: uuid.UUID,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.role == UserRole.student))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    await db.delete(user)
    await db.commit()
