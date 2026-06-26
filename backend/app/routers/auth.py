"""
NOMA Auth Router — login, refresh, change password.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from jose import JWTError
from ..database import get_db
from ..security import verify_password, create_access_token, create_refresh_token, decode_token
from ..schemas import LoginRequest, RefreshRequest, TokenResponse, UserOut, ChangePasswordRequest
from ..security import hash_password
from .. import models

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            or_(
                models.User.username == body.username,
                models.User.email == body.username,
            ),
            models.User.is_active == True,
        )
        .first()
    )
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos",
        )
    return {
        "access_token": create_access_token(user.id, user.role),
        "refresh_token": create_refresh_token(user.id),
        "user": UserOut.model_validate(user),
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError
        user_id = int(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )

    user = db.get(models.User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )
    return {
        "access_token": create_access_token(user.id, user.role),
        "refresh_token": create_refresh_token(user.id),
        "user": UserOut.model_validate(user),
    }


@router.post("/change-password", response_model=UserOut)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(lambda: None),
):
    # This is handled via the users router now
    pass
