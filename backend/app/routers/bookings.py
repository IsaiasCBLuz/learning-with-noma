from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
import uuid

from app.database import get_db
from app.deps import get_current_user, get_admin_user
from app.models import (
    User, Booking, AvailableSlot, StudentProfile,
    BookingStatus, UserRole,
)
from app.schemas import CreateBookingRequest, BookingOut, ToggleSlotRequest
from app.security import decrypt_field
from app.services import google_calendar

router = APIRouter(prefix="/bookings", tags=["bookings"])

FIXED_BLOCKED_BEFORE = "17:30"  # slots before this need to be explicitly liberated


def _booking_out(b: Booking) -> BookingOut:
    student_name = b.student.name if b.student else None
    return BookingOut(
        id=b.id,
        student_id=b.student_id,
        student_name=student_name,
        date=b.date,
        time_slot=b.time_slot,
        status=b.status,
        created_by=b.created_by,
        google_event_id=b.google_event_id,
        created_at=b.created_at,
    )


def _week_start(ref: date) -> date:
    return ref - timedelta(days=ref.weekday())


@router.get("/week", response_model=dict)
async def get_week_slots(
    week_start: date = Query(..., description="YYYY-MM-DD, Monday of the week"),
    student_id: uuid.UUID | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = student_id if (user.role == UserRole.admin and student_id) else user.id

    week_end = week_start + timedelta(days=4)

    bookings_result = await db.execute(
        select(Booking)
        .where(
            and_(
                Booking.date >= week_start,
                Booking.date <= week_end,
                Booking.status == BookingStatus.scheduled,
            )
        )
        .options(selectinload(Booking.student))
    )
    all_bookings = bookings_result.scalars().all()

    locked_result = await db.execute(
        select(AvailableSlot).where(
            and_(
                AvailableSlot.date >= week_start,
                AvailableSlot.date <= week_end,
                AvailableSlot.is_locked == False,
            )
        )
    )
    liberated = {(s.date, str(s.time_slot)[:5]) for s in locked_result.scalars().all()}

    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == target_id)
    )
    profile = profile_result.scalar_one_or_none()
    credits_remaining = (profile.credits_total - profile.credits_used) if profile else None

    bookings_this_week = sum(
        1 for b in all_bookings
        if str(b.student_id) == str(target_id)
    )

    TIME_SLOTS = [
        "07:30", "08:00", "09:00", "10:00", "11:00",
        "14:00", "16:00", "18:00", "19:00", "20:00", "21:00", "22:00"
    ]

    today = date.today()
    slots = []
    for delta in range(5):
        day = week_start + timedelta(days=delta)
        for ts in TIME_SLOTS:
            booked = next(
                (b for b in all_bookings if b.date == day and str(b.time_slot)[:5] == ts),
                None,
            )
            is_past = day < today or (day == today and ts < today.strftime("%H:%M"))
            is_liberated = (day, ts) in liberated
            before_1730 = ts <= FIXED_BLOCKED_BEFORE and not is_liberated and user.role != UserRole.admin

            if is_past:
                slot_status = "past"
            elif booked and str(booked.student_id) == str(target_id):
                slot_status = "booked_by_me"
            elif booked:
                slot_status = "booked" if user.role == UserRole.admin else "occupied"
            elif before_1730:
                slot_status = "locked"
            else:
                slot_status = "available"

            slots.append({"date": str(day), "time_slot": ts, "status": slot_status,
                          "booking_id": str(booked.id) if booked else None})

    return {
        "slots": slots,
        "credits_remaining": credits_remaining,
        "bookings_this_week": bookings_this_week,
    }


@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: CreateBookingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student_id = body.student_id if (user.role == UserRole.admin and body.student_id) else user.id

    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == student_id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile and user.role != UserRole.admin:
        raise HTTPException(status_code=400, detail="Aluno sem plano ativo")

    if profile:
        if profile.credits_used >= profile.credits_total:
            raise HTTPException(status_code=400, detail="Créditos esgotados")

        week_start = _week_start(body.date)
        week_end = week_start + timedelta(days=6)
        weekly_count_result = await db.execute(
            select(func.count(Booking.id)).where(
                and_(
                    Booking.student_id == student_id,
                    Booking.date >= week_start,
                    Booking.date <= week_end,
                    Booking.status == BookingStatus.scheduled,
                )
            )
        )
        weekly_count = weekly_count_result.scalar_one()
        if weekly_count >= profile.max_per_week:
            raise HTTPException(
                status_code=400,
                detail=f"Limite de {profile.max_per_week} aula(s) por semana atingido",
            )

    conflict = await db.execute(
        select(Booking).where(
            and_(
                Booking.date == body.date,
                Booking.time_slot == body.time_slot,
                Booking.status == BookingStatus.scheduled,
            )
        )
    )
    if conflict.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Horário já ocupado")

    booking = Booking(
        student_id=student_id,
        date=body.date,
        time_slot=body.time_slot,
        status=BookingStatus.scheduled,
        created_by=user.id,
    )
    db.add(booking)

    if profile:
        profile.credits_used += 1

    await db.commit()
    await db.refresh(booking)

    try:
        student_result = await db.execute(select(User).where(User.id == student_id))
        student = student_result.scalar_one()
        event_id = await google_calendar.create_event(
            student_name=student.name,
            student_email=decrypt_field(student.email_encrypted),
            lesson_date=body.date,
            lesson_time=body.time_slot,
        )
        if event_id:
            booking.google_event_id = event_id
            await db.commit()
    except Exception:
        pass

    await db.refresh(booking)
    booking.student = student if 'student' in dir() else None
    return _booking_out(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
        .options(selectinload(Booking.student))
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    if user.role != UserRole.admin and booking.student_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")

    booking.status = BookingStatus.cancelled

    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == booking.student_id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile and profile.credits_used > 0:
        profile.credits_used -= 1

    if booking.google_event_id:
        try:
            await google_calendar.delete_event(booking.google_event_id)
        except Exception:
            pass

    await db.commit()


@router.get("/admin/all", response_model=list[BookingOut])
async def admin_list_bookings(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.status == BookingStatus.scheduled)
        .options(selectinload(Booking.student))
        .order_by(Booking.date.desc(), Booking.time_slot.asc())
    )
    return [_booking_out(b) for b in result.scalars().all()]


@router.get("/my", response_model=list[BookingOut])
async def my_bookings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.student_id == user.id, Booking.status == BookingStatus.scheduled)
        .options(selectinload(Booking.student))
        .order_by(Booking.date.asc())
    )
    return [_booking_out(b) for b in result.scalars().all()]


@router.post("/slots/toggle", status_code=status.HTTP_200_OK)
async def toggle_slot(
    body: ToggleSlotRequest,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AvailableSlot).where(
            and_(AvailableSlot.date == body.date, AvailableSlot.time_slot == body.time_slot)
        )
    )
    slot = result.scalar_one_or_none()
    if slot:
        slot.is_locked = body.is_locked
    else:
        slot = AvailableSlot(date=body.date, time_slot=body.time_slot, is_locked=body.is_locked)
        db.add(slot)
    await db.commit()
    return {"ok": True}
