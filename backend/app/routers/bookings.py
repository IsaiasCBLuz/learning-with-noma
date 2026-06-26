"""
NOMA Bookings Router — student booking requests, slot grid.
"""
from datetime import date, datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..deps import get_current_user
from ..schemas import BookingCreate, BookingOut, SlotInfo
from ..services.scheduling import ALL_SLOTS, DEFAULT_BLOCKED_SLOTS, is_business_day, get_week_dates
from .. import models

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/slots", response_model=List[SlotInfo])
def get_slots(
    week_offset: int = 0,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Get slot grid for a given week. Returns status for each slot."""
    days = get_week_dates(offset=week_offset)
    now = datetime.now(timezone.utc)

    # Load profile for student
    profile = None
    if user.role == "student":
        profile = db.query(models.StudentProfile).filter(
            models.StudentProfile.user_id == user.id
        ).first()

    weekly_limit = 1
    if profile and profile.plan:
        plan = db.query(models.Plan).get(profile.plan_id)
        if plan:
            weekly_limit = plan.weekly_frequency

    # Fetch all confirmed + pending bookings for this week
    all_bookings = db.query(models.Booking).filter(
        models.Booking.date.in_(days),
        models.Booking.status.in_(["confirmed", "pending"]),
    ).all()

    # Admin blocked slots
    admin_blocks = {
        (b.date, b.time_slot)
        for b in db.query(models.BlockedSlot).filter(
            models.BlockedSlot.date.in_(days)
        ).all()
    }

    # My bookings this week
    my_bookings = [b for b in all_bookings if b.student_id == user.id]
    my_week_count = len([b for b in my_bookings if b.status == "confirmed"])
    my_booked_dates = {b.date for b in my_bookings}

    result = []
    for d in days:
        if not is_business_day(d):
            continue
        for slot in ALL_SLOTS:
            dt = datetime(d.year, d.month, d.day,
                          int(slot[:2]), int(slot[3:]), tzinfo=timezone.utc)

            # Past slots
            if dt <= now:
                result.append(SlotInfo(date=d, time_slot=slot, status="past"))
                continue

            # Admin blocked
            if (d, slot) in admin_blocks:
                result.append(SlotInfo(date=d, time_slot=slot, status="blocked"))
                continue

            # Default blocked slots
            if slot in DEFAULT_BLOCKED_SLOTS:
                result.append(SlotInfo(date=d, time_slot=slot, status="blocked"))
                continue

            # Contract end
            if profile and profile.contract_end and d > profile.contract_end:
                result.append(SlotInfo(date=d, time_slot=slot, status="out_of_contract"))
                continue

            # Check existing bookings for this slot
            slot_booking = next(
                (b for b in all_bookings if b.date == d and b.time_slot == slot),
                None,
            )
            if slot_booking:
                if slot_booking.student_id == user.id:
                    status_val = "pending" if slot_booking.status == "pending" else "mine"
                    result.append(SlotInfo(date=d, time_slot=slot, status=status_val))
                else:
                    result.append(SlotInfo(date=d, time_slot=slot, status="occupied"))
                continue

            # Weekly limit
            if my_week_count >= weekly_limit and d not in my_booked_dates:
                result.append(SlotInfo(date=d, time_slot=slot, status="limit"))
                continue

            # Daily limit: one class per day
            if d in my_booked_dates:
                result.append(SlotInfo(date=d, time_slot=slot, status="limit"))
                continue

            # No credits remaining
            if profile and profile.credits_remaining <= 0:
                result.append(SlotInfo(date=d, time_slot=slot, status="limit"))
                continue

            result.append(SlotInfo(date=d, time_slot=slot, status="free"))

    return result


@router.post("", response_model=BookingOut, status_code=201)
def request_booking(
    body: BookingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Student requests a booking. Status starts as 'pending' for admin approval."""
    if not is_business_day(body.date):
        raise HTTPException(400, "Data bloqueada (feriado ou recesso)")
    if body.time_slot in DEFAULT_BLOCKED_SLOTS:
        raise HTTPException(400, "Horário bloqueado")

    # Check profile & credits
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user.id
    ).first()

    if profile:
        if profile.contract_end and body.date > profile.contract_end:
            raise HTTPException(400, "Data fora do contrato")
        if profile.credits_remaining <= 0:
            raise HTTPException(400, "Sem créditos disponíveis")

    # Check admin block
    blocked = db.query(models.BlockedSlot).filter(
        models.BlockedSlot.date == body.date,
        models.BlockedSlot.time_slot == body.time_slot,
    ).first()
    if blocked:
        raise HTTPException(400, "Horário bloqueado pelo administrador")

    # Check slot availability
    existing = db.query(models.Booking).filter(
        models.Booking.date == body.date,
        models.Booking.time_slot == body.time_slot,
        models.Booking.status.in_(["confirmed", "pending"]),
    ).first()
    if existing:
        raise HTTPException(409, "Horário já ocupado")

    # Check weekly limit
    week_days = get_week_dates(reference_date=body.date)
    plan = None
    if profile and profile.plan_id:
        plan = db.query(models.Plan).get(profile.plan_id)

    weekly_limit = plan.weekly_frequency if plan else 1
    my_week_count = db.query(models.Booking).filter(
        models.Booking.student_id == user.id,
        models.Booking.date.in_(week_days),
        models.Booking.status.in_(["confirmed", "pending"]),
    ).count()
    if my_week_count >= weekly_limit:
        raise HTTPException(400, "Limite semanal atingido")

    # Check daily limit
    my_day_count = db.query(models.Booking).filter(
        models.Booking.student_id == user.id,
        models.Booking.date == body.date,
        models.Booking.status.in_(["confirmed", "pending"]),
    ).count()
    if my_day_count >= 1:
        raise HTTPException(400, "Já existe uma aula neste dia")

    booking = models.Booking(
        student_id=user.id,
        date=body.date,
        time_slot=body.time_slot,
        status="pending",
        requested_by="student",
    )
    db.add(booking)

    # Create notification for admins
    admins = db.query(models.User).filter(models.User.role == "admin", models.User.is_active == True).all()
    for admin in admins:
        notif = models.Notification(
            user_id=admin.id,
            type="booking",
            title="Novo agendamento pendente",
            message=f"{user.full_name} solicitou aula em {body.date.strftime('%d/%m')} às {body.time_slot}",
            action_url="/admin/agenda",
            related_id=booking.id,
        )
        db.add(notif)

    db.commit()
    db.refresh(booking)

    out = BookingOut.model_validate(booking)
    out.student_name = user.full_name
    return out


@router.get("/mine", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Booking)
        .filter(models.Booking.student_id == user.id)
        .order_by(models.Booking.date.desc(), models.Booking.time_slot)
        .all()
    )
    result = []
    for r in rows:
        out = BookingOut.model_validate(r)
        out.student_name = user.full_name
        result.append(out)
    return result


@router.delete("/{booking_id}", status_code=204)
def cancel_my_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    if booking.student_id != user.id:
        raise HTTPException(403, "Acesso negado")
    if booking.status not in ("pending", "confirmed"):
        raise HTTPException(400, "Não é possível cancelar este agendamento")
    if booking.status == "confirmed" and booking.date <= date.today():
        raise HTTPException(400, "Só é possível cancelar aulas futuras")

    was_confirmed = booking.status == "confirmed"
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.cancelled_by_id = user.id

    # Refund credit if was confirmed
    if was_confirmed:
        profile = db.query(models.StudentProfile).filter(
            models.StudentProfile.user_id == user.id
        ).first()
        if profile:
            profile.credits_remaining += 1
            profile.credits_used = max(0, profile.credits_used - 1)

    db.commit()
