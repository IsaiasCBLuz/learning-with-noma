import csv
import io
import re
import unicodedata
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import require_admin
from ..security import hash_password
from ..schemas import (
    UserOut, UserCreate, UserUpdate, InviteStudentRequest,
    BookingOut, BlockedSlotCreate, BlockedSlotOut,
    QuizResponseOut,
)
from ..services.scheduling import CREDITS_BY_PLAN, calc_contract_end
from ..services.email import generate_temp_password, send_invite_email
from .. import models


def _slugify_name(name: str) -> str:
    normalized = unicodedata.normalize("NFD", name.lower())
    ascii_name = normalized.encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "_", ascii_name).strip("_")


def _unique_username(db: Session, base: str) -> str:
    candidate = base
    suffix = 2
    while db.query(models.User).filter(models.User.username == candidate).first():
        candidate = f"{base}_{suffix}"
        suffix += 1
    return candidate

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Students ──────────────────────────────────────────────────────────────────

@router.get("/students", response_model=List[UserOut])
def list_students(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.post("/students", response_model=UserOut, status_code=201)
def create_student(body: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(409, "Usuário já existe")

    credits = body.credits_total or CREDITS_BY_PLAN.get(body.plan or "", 4)
    contract_end = body.contract_end
    if body.contract_start and not contract_end and body.plan:
        contract_end = calc_contract_end(body.contract_start, credits)

    user = models.User(
        username=body.username,
        hashed_password=hash_password(body.password),
        email=body.email,
        phone=body.phone,
        role=body.role,
        turma=body.turma,
        plan=body.plan,
        style=body.style,
        method=body.method,
        contract_start=body.contract_start,
        contract_end=contract_end,
        credits_total=credits,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/students/invite", response_model=UserOut, status_code=201)
def invite_student(
    body: InviteStudentRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(409, "E-mail já cadastrado")

    username = _unique_username(db, _slugify_name(body.name))
    temp_password = generate_temp_password()

    user = models.User(
        username=username,
        hashed_password=hash_password(temp_password),
        email=body.email,
        role="student",
        must_change_password=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_invite_email(body.email, body.name, username, temp_password)
    return user


@router.patch("/students/{user_id}", response_model=UserOut)
def update_student(
    user_id: int, body: UserUpdate,
    db: Session = Depends(get_db), _=Depends(require_admin),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")

    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "password":
            user.hashed_password = hash_password(value)
        else:
            setattr(user, field, value)

    # Auto-calc contract end if plan/start changed and no explicit end given
    if body.contract_start and not body.contract_end and user.plan:
        credits = user.credits_total or CREDITS_BY_PLAN.get(user.plan, 4)
        user.contract_end = calc_contract_end(user.contract_start, credits)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/students/{user_id}", status_code=204)
def delete_student(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    db.delete(user)
    db.commit()


# ── Bookings ──────────────────────────────────────────────────────────────────

@router.get("/bookings", response_model=List[BookingOut])
def list_bookings(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(models.Booking, models.User.username)
        .join(models.User)
        .filter(models.Booking.status == "confirmed")
        .order_by(models.Booking.date, models.Booking.time_slot)
        .all()
    )
    result = []
    for booking, username in rows:
        booking.username = username
        result.append(booking)
    return result


@router.delete("/bookings/{booking_id}", status_code=204)
def cancel_booking_admin(
    booking_id: int, db: Session = Depends(get_db), _=Depends(require_admin),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    booking.status = "cancelled"
    db.commit()


# ── Blocked Slots ─────────────────────────────────────────────────────────────

@router.get("/blocked-slots", response_model=List[BlockedSlotOut])
def list_blocked_slots(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.BlockedSlot).order_by(models.BlockedSlot.date).all()


@router.post("/blocked-slots", response_model=BlockedSlotOut, status_code=201)
def block_slot(
    body: BlockedSlotCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    existing = db.query(models.BlockedSlot).filter(
        models.BlockedSlot.date == body.date,
        models.BlockedSlot.time_slot == body.time_slot,
    ).first()
    if existing:
        raise HTTPException(409, "Slot já bloqueado")
    block = models.BlockedSlot(
        date=body.date, time_slot=body.time_slot,
        reason=body.reason, created_by=admin.id,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.delete("/blocked-slots/{block_id}", status_code=204)
def unblock_slot(block_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    block = db.get(models.BlockedSlot, block_id)
    if not block:
        raise HTTPException(404, "Bloqueio não encontrado")
    db.delete(block)
    db.commit()


# ── Quiz Responses ────────────────────────────────────────────────────────────

@router.get("/quiz-responses", response_model=List[QuizResponseOut])
def list_quiz_responses(db: Session = Depends(get_db), _=Depends(require_admin)):
    return (
        db.query(models.QuizResponse)
        .order_by(models.QuizResponse.created_at.desc())
        .limit(200)
        .all()
    )


# ── CSV Export ────────────────────────────────────────────────────────────────

@router.get("/export/bookings.csv")
def export_bookings_csv(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = (
        db.query(models.Booking, models.User.username)
        .join(models.User)
        .filter(models.Booking.status == "confirmed")
        .order_by(models.Booking.date, models.Booking.time_slot)
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Aluno", "Data", "Horário"])
    for booking, username in rows:
        writer.writerow([username, booking.date.isoformat(), booking.time_slot])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agendamentos.csv"},
    )
