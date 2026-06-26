"""
NOMA Users Router — profile, change password.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..deps import get_current_user
from ..security import hash_password
from ..schemas import UserOut, ChangePasswordRequest, StudentProfileOut, PlanOut
from .. import models

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    return user


@router.get("/me/profile", response_model=StudentProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "student":
        raise HTTPException(403, "Apenas alunos possuem perfil")
    profile = (
        db.query(models.StudentProfile)
        .options(joinedload(models.StudentProfile.plan))
        .filter(models.StudentProfile.user_id == user.id)
        .first()
    )
    if not profile:
        raise HTTPException(404, "Perfil não encontrado")
    return profile


@router.post("/users/change-password", response_model=UserOut)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if len(body.new_password) < 8:
        raise HTTPException(400, "A senha deve ter no mínimo 8 caracteres")
    user.hashed_password = hash_password(body.new_password)
    user.must_change_password = False
    db.commit()
    db.refresh(user)
    return user


@router.get("/plans", response_model=List[PlanOut])
def list_plans_for_students(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return db.query(models.Plan).order_by(models.Plan.id).all()

