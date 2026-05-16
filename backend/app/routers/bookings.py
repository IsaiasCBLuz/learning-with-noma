from datetime import date, datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..schemas import BookingCreate, BookingOut, SlotInfo
from ..services.scheduling import (
    ALL_SLOTS, DEFAULT_BLOCKED_SLOTS, SYSTEM_BLOCK_UNTIL,
    WEEKLY_FREQ, is_business_day
)
from .. import models

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _week_dates(offset: int = 0) -> list[date]:
    today = date.today()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)
    return [monday + timedelta(days=i) for i in range(5)]


@router.get("/slots", response_model=List[SlotInfo])
def get_slots(
    week_offset: int = 0,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    days = _week_dates(week_offset)
    now = datetime.now(timezone.utc)

    all_bookings = db.query(models.Booking).filter(
        models.Booking.date.in_(days),
        models.Booking.status == "confirmed",
    ).all()

    admin_blocks = {
        (b.date, b.time_slot)
        for b in db.query(models.BlockedSlot).filter(models.BlockedSlot.date.in_(days)).all()
    }

    my_bookings_by_week = db.query(models.Booking).filter(
        models.Booking.user_id == user.id,
        models.Booking.date.in_(days),
        models.Booking.status == "confirmed",
    ).all()

    weekly_limit = WEEKLY_FREQ.get(user.plan or "", 1)
    my_week_count = len(my_bookings_by_week)
    my_booked_dates = {b.date for b in my_bookings_by_week}

    result = []
    for d in days:
        if not is_business_day(d):
            continue
        for slot in ALL_SLOTS:
            dt = datetime(d.year, d.month, d.day,
                          int(slot[:2]), int(slot[3:]), tzinfo=timezone.utc)
            if dt <= now:
                result.append(SlotInfo(date=d, time_slot=slot, status="past"))
                continue

            # System-wide block until July 1, 2026
            if d < SYSTEM_BLOCK_UNTIL:
                result.append(SlotInfo(date=d, time_slot=slot, status="blocked"))
                continue

            # Admin manual block
            if (d, slot) in admin_blocks:
                result.append(SlotInfo(date=d, time_slot=slot, status="blocked"))
                continue

            # Default slot block (before 19h) — unless admin unblocked via blocked_slots removal
            if slot in DEFAULT_BLOCKED_SLOTS:
                result.append(SlotInfo(date=d, time_slot=slot, status="blocked"))
                continue

            # Contract end
            if user.contract_end and d > user.contract_end:
                result.append(SlotInfo(date=d, time_slot=slot, status="out_of_contract"))
                continue

            # Check existing bookings for this slot
            slot_booking = next((b for b in all_bookings if b.date == d and b.time_slot == slot), None)
            if slot_booking:
                if slot_booking.user_id == user.id:
                    result.append(SlotInfo(date=d, time_slot=slot, status="mine"))
                else:
                    result.append(SlotInfo(date=d, time_slot=slot, status="occupied"))
                continue

            # Weekly limit reached
            if my_week_count >= weekly_limit and d not in my_booked_dates:
                result.append(SlotInfo(date=d, time_slot=slot, status="limit"))
                continue

            # Daily limit: one class per day
            if d in my_booked_dates:
                result.append(SlotInfo(date=d, time_slot=slot, status="limit"))
                continue

            result.append(SlotInfo(date=d, time_slot=slot, status="free"))

    return result


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(
    body: BookingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not is_business_day(body.date):
        raise HTTPException(400, "Data bloqueada (feriado ou recesso)")
    if body.date < SYSTEM_BLOCK_UNTIL:
        raise HTTPException(400, "Período bloqueado pelo sistema")
    if body.time_slot in DEFAULT_BLOCKED_SLOTS:
        raise HTTPException(400, "Horário bloqueado")
    if user.contract_end and body.date > user.contract_end:
        raise HTTPException(400, "Data fora do contrato")

    # Check if slot is free
    existing = db.query(models.Booking).filter(
        models.Booking.date == body.date,
        models.Booking.time_slot == body.time_slot,
        models.Booking.status == "confirmed",
    ).first()
    if existing:
        raise HTTPException(409, "Horário já ocupado")

    week_days = _week_dates(
        (body.date - date.today()).days // 7
    )
    my_week = db.query(models.Booking).filter(
        models.Booking.user_id == user.id,
        models.Booking.date.in_(week_days),
        models.Booking.status == "confirmed",
    ).count()
    if my_week >= WEEKLY_FREQ.get(user.plan or "", 1):
        raise HTTPException(400, "Limite semanal atingido")

    my_day = db.query(models.Booking).filter(
        models.Booking.user_id == user.id,
        models.Booking.date == body.date,
        models.Booking.status == "confirmed",
    ).count()
    if my_day >= 1:
        raise HTTPException(400, "Já existe uma aula neste dia")

    booking = models.Booking(user_id=user.id, date=body.date, time_slot=body.time_slot)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    booking.username = user.username
    return booking


@router.get("/mine", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Booking)
        .filter(models.Booking.user_id == user.id)
        .order_by(models.Booking.date, models.Booking.time_slot)
        .all()
    )
    for r in rows:
        r.username = user.username
    return rows


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    if booking.user_id != user.id:
        raise HTTPException(403, "Acesso negado")
    if booking.date <= date.today():
        raise HTTPException(400, "Só é possível cancelar aulas futuras")
    booking.status = "cancelled"
    db.commit()
