from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..security import hash_password
from ..schemas import UserOut, ChangePasswordRequest
from .. import models

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    return user


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
