"""
NOMA Admin Router — full admin panel API.
Students CRUD, bookings management, blocked slots, lesson notes, credits, dashboard.
"""
import csv
import io
import re
import uuid
import unicodedata
from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, extract, and_
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..deps import require_admin
from ..security import hash_password
from ..schemas import (
    UserOut, UserCreate, UserUpdate,
    StudentProfileCreate, StudentProfileUpdate, StudentProfileOut, StudentFullOut,
    BookingOut, BookingAdminCreate, BookingCancel,
    BlockedSlotCreate, BlockedSlotBatchCreate, BlockedSlotOut,
    LessonNoteCreate, LessonNoteOut, LessonNoteUpdate,
    CreditAdjust, PlanOut, DashboardStats,
    QuizResponseOut,
)
from ..services.email import generate_temp_password, send_invite_email, send_booking_confirmed_email, send_booking_cancelled_email
from ..services.scheduling import ALL_SLOTS, is_business_day, get_week_dates
from .. import models

router = APIRouter(prefix="/admin", tags=["admin"])


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


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), _=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    first_of_month = date(now.year, now.month, 1)
    if now.month == 1:
        first_prev_month = date(now.year - 1, 12, 1)
    else:
        first_prev_month = date(now.year, now.month - 1, 1)

    total_students = db.query(models.User).filter(
        models.User.role == "student"
    ).count()

    active_students = db.query(models.User).filter(
        models.User.role == "student",
        models.User.is_active == True,
    ).count()

    total_lessons_month = db.query(models.Booking).filter(
        models.Booking.date >= first_of_month,
        models.Booking.status.in_(["confirmed", "completed"]),
    ).count()

    pending_bookings = db.query(models.Booking).filter(
        models.Booking.status == "pending",
    ).count()

    revenue_month = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(
        models.Payment.status == "paid",
        models.Payment.paid_at >= datetime(first_of_month.year, first_of_month.month, first_of_month.day, tzinfo=timezone.utc),
    ).scalar()

    revenue_prev_month = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(
        models.Payment.status == "paid",
        models.Payment.paid_at >= datetime(first_prev_month.year, first_prev_month.month, first_prev_month.day, tzinfo=timezone.utc),
        models.Payment.paid_at < datetime(first_of_month.year, first_of_month.month, first_of_month.day, tzinfo=timezone.utc),
    ).scalar()

    overdue_payments = db.query(models.Payment).filter(
        models.Payment.status.in_(["pending", "overdue"]),
        models.Payment.due_date < date.today(),
    ).count()

    assessments_pending = db.query(models.Assessment).filter(
        models.Assessment.is_active == True,
    ).count()

    return DashboardStats(
        total_students=total_students,
        active_students=active_students,
        total_lessons_month=total_lessons_month,
        pending_bookings=pending_bookings,
        revenue_month=Decimal(str(revenue_month)),
        revenue_prev_month=Decimal(str(revenue_prev_month)),
        overdue_payments=overdue_payments,
        assessments_pending=assessments_pending,
    )


# ── Plans ─────────────────────────────────────────────────────────────────────

@router.get("/plans", response_model=List[PlanOut])
def list_plans(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.Plan).order_by(models.Plan.id).all()


# ── Students ──────────────────────────────────────────────────────────────────

@router.get("/students", response_model=List[UserOut])
def list_students(db: Session = Depends(get_db), _=Depends(require_admin)):
    return (
        db.query(models.User)
        .filter(models.User.role == "student")
        .order_by(models.User.created_at.desc())
        .all()
    )


@router.get("/students/{user_id}", response_model=StudentFullOut)
def get_student_detail(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.get(models.User, user_id)
    if not user or user.role != "student":
        raise HTTPException(404, "Aluno não encontrado")

    profile = (
        db.query(models.StudentProfile)
        .options(joinedload(models.StudentProfile.plan))
        .filter(models.StudentProfile.user_id == user_id)
        .first()
    )

    total_lessons = db.query(models.Booking).filter(
        models.Booking.student_id == user_id,
        models.Booking.status.in_(["confirmed", "completed"]),
    ).count()

    attended = db.query(models.LessonNote).filter(
        models.LessonNote.student_id == user_id,
        models.LessonNote.attendance == "present",
    ).count()

    pending_payments = db.query(models.Payment).filter(
        models.Payment.student_id == user_id,
        models.Payment.status.in_(["pending", "overdue"]),
    ).count()

    return StudentFullOut(
        user=UserOut.model_validate(user),
        profile=StudentProfileOut.model_validate(profile) if profile else None,
        total_lessons=total_lessons,
        attended_lessons=attended,
        pending_payments=pending_payments,
    )


@router.get("/students/{user_id}/profile", response_model=StudentProfileOut)
def get_student_profile(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    profile = (
        db.query(models.StudentProfile)
        .options(joinedload(models.StudentProfile.plan))
        .filter(models.StudentProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(404, "Perfil não encontrado")
    return profile


@router.post("/students", response_model=UserOut, status_code=201)
def create_student(body: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    """Create a new student. Generates temp password and sends invite email."""
    if body.email and db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(409, "E-mail já cadastrado")
    if body.cpf and db.query(models.User).filter(models.User.cpf == body.cpf).first():
        raise HTTPException(409, "CPF já cadastrado")

    username = _unique_username(db, _slugify_name(body.full_name))
    temp_password = generate_temp_password()

    user = models.User(
        full_name=body.full_name,
        cpf=body.cpf,
        email=body.email,
        username=username,
        hashed_password=hash_password(temp_password),
        phone=body.phone,
        role="student",
        must_change_password=True,
    )
    db.add(user)
    db.flush()

    # Create empty student profile
    profile = models.StudentProfile(user_id=user.id)
    db.add(profile)

    db.commit()
    db.refresh(user)

    # Send invite email
    if body.email:
        send_invite_email(body.email, body.full_name, username, temp_password)

    return user


@router.post("/students/{user_id}/profile", response_model=StudentProfileOut, status_code=201)
def create_or_update_student_profile(
    user_id: int,
    body: StudentProfileCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")

    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user_id
    ).first()

    if profile:
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        # If plan changed, set credits from plan
        if body.plan_id and body.credits_remaining is None:
            plan = db.get(models.Plan, body.plan_id)
            if plan:
                profile.credits_remaining = plan.credits_total
                profile.credits_used = 0
    else:
        plan = db.get(models.Plan, body.plan_id) if body.plan_id else None
        profile = models.StudentProfile(
            user_id=user_id,
            credits_remaining=body.credits_remaining or (plan.credits_total if plan else 0),
            **body.model_dump(exclude_unset=True, exclude={"credits_remaining"}),
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/students/{user_id}", response_model=UserOut)
def update_student(
    user_id: int, body: UserUpdate,
    db: Session = Depends(get_db), _=Depends(require_admin),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/students/{user_id}/profile", response_model=StudentProfileOut)
def update_student_profile(
    user_id: int, body: StudentProfileUpdate,
    db: Session = Depends(get_db), _=Depends(require_admin),
):
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(404, "Perfil não encontrado")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    # If plan changed, update credits
    if body.plan_id and body.credits_remaining is None:
        plan = db.get(models.Plan, body.plan_id)
        if plan:
            profile.credits_remaining = plan.credits_total
            profile.credits_used = 0

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/students/{user_id}", status_code=204)
def delete_student(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    db.delete(user)
    db.commit()


# ── Credits ───────────────────────────────────────────────────────────────────

@router.post("/students/{user_id}/credits", response_model=StudentProfileOut)
def adjust_credits(
    user_id: int, body: CreditAdjust,
    db: Session = Depends(get_db), _=Depends(require_admin),
):
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(404, "Perfil não encontrado")

    profile.credits_remaining += body.amount
    if profile.credits_remaining < 0:
        profile.credits_remaining = 0

    db.commit()
    db.refresh(profile)
    return profile


# ── Admins ────────────────────────────────────────────────────────────────────

@router.get("/admins", response_model=List[UserOut])
def list_admins(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(models.User).filter(models.User.role == "admin").order_by(models.User.created_at).all()


@router.post("/admins", response_model=UserOut, status_code=201)
def create_admin(body: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if body.email and db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(409, "E-mail já cadastrado")

    username = _unique_username(db, _slugify_name(body.full_name))
    temp_password = generate_temp_password()

    user = models.User(
        full_name=body.full_name,
        cpf=body.cpf,
        email=body.email,
        username=username,
        hashed_password=hash_password(temp_password),
        phone=body.phone,
        role="admin",
        must_change_password=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if body.email:
        send_invite_email(body.email, body.full_name, username, temp_password)

    return user


# ── Bookings ──────────────────────────────────────────────────────────────────

@router.get("/bookings", response_model=List[BookingOut])
def list_bookings(
    status: Optional[str] = None,
    student_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    q = db.query(models.Booking).join(models.User, models.Booking.student_id == models.User.id)

    if status:
        q = q.filter(models.Booking.status == status)
    if student_id:
        q = q.filter(models.Booking.student_id == student_id)
    if date_from:
        q = q.filter(models.Booking.date >= date_from)
    if date_to:
        q = q.filter(models.Booking.date <= date_to)

    rows = q.order_by(models.Booking.date.desc(), models.Booking.time_slot).all()

    result = []
    for booking in rows:
        out = BookingOut.model_validate(booking)
        out.student_name = booking.student.full_name
        result.append(out)
    return result


@router.post("/bookings", response_model=BookingOut, status_code=201)
def admin_create_booking(
    body: BookingAdminCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """Admin creates a booking directly for a student (auto-confirmed)."""
    student = db.get(models.User, body.student_id)
    if not student:
        raise HTTPException(404, "Aluno não encontrado")

    # Check slot
    existing = db.query(models.Booking).filter(
        models.Booking.date == body.date,
        models.Booking.time_slot == body.time_slot,
        models.Booking.status.in_(["confirmed", "pending"]),
    ).first()
    if existing:
        raise HTTPException(409, "Horário já ocupado")

    booking = models.Booking(
        student_id=body.student_id,
        date=body.date,
        time_slot=body.time_slot,
        status="confirmed",
        requested_by="admin",
        approved_by_id=admin.id,
    )
    db.add(booking)

    # Debit credit
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == body.student_id
    ).first()
    if profile and profile.credits_remaining > 0:
        profile.credits_remaining -= 1
        profile.credits_used += 1

    # Notify student
    notif = models.Notification(
        user_id=body.student_id,
        type="booking",
        title="Aula agendada",
        message=f"Sua aula foi agendada para {body.date.strftime('%d/%m')} às {body.time_slot}",
        action_url="/aluno/agenda",
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)

    # Send email
    if student.email:
        send_booking_confirmed_email(
            student.email, student.full_name,
            body.date.strftime("%d/%m/%Y"), body.time_slot,
        )

    out = BookingOut.model_validate(booking)
    out.student_name = student.full_name
    return out


@router.patch("/bookings/{booking_id}/approve", response_model=BookingOut)
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    if booking.status != "pending":
        raise HTTPException(400, "Agendamento não está pendente")

    booking.status = "confirmed"
    booking.approved_by_id = admin.id

    # Debit credit
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == booking.student_id
    ).first()
    if profile and profile.credits_remaining > 0:
        profile.credits_remaining -= 1
        profile.credits_used += 1

    # Notify student
    student = db.get(models.User, booking.student_id)
    notif = models.Notification(
        user_id=booking.student_id,
        type="booking",
        title="Aula confirmada!",
        message=f"Sua aula de {booking.date.strftime('%d/%m')} às {booking.time_slot} foi confirmada.",
        action_url="/aluno/agenda",
    )
    db.add(notif)

    # Mark related notifications for admins as read
    db.query(models.Notification).filter(
        models.Notification.type == "booking",
        models.Notification.is_read == False,
        (models.Notification.related_id == booking.id) | 
        (
            (models.Notification.action_url == "/admin/agenda") & 
            (models.Notification.message.contains(f"solicitou aula em {booking.date.strftime('%d/%m')} às {booking.time_slot}"))
        )
    ).update({"is_read": True}, synchronize_session=False)

    db.commit()
    db.refresh(booking)

    # Send email
    if student and student.email:
        send_booking_confirmed_email(
            student.email, student.full_name,
            booking.date.strftime("%d/%m/%Y"), booking.time_slot,
        )

    out = BookingOut.model_validate(booking)
    out.student_name = student.full_name if student else None
    return out


@router.patch("/bookings/{booking_id}/reject", response_model=BookingOut)
def reject_booking(
    booking_id: int,
    body: BookingCancel,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    if booking.status != "pending":
        raise HTTPException(400, "Agendamento não está pendente")

    booking.status = "cancelled"
    booking.cancellation_reason = body.reason
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.cancelled_by_id = admin.id

    student = db.get(models.User, booking.student_id)
    notif = models.Notification(
        user_id=booking.student_id,
        type="booking",
        title="Agendamento não aprovado",
        message=f"Seu agendamento de {booking.date.strftime('%d/%m')} às {booking.time_slot} não foi aprovado.",
        action_url="/aluno/agenda",
    )
    db.add(notif)

    # Mark related notifications for admins as read
    db.query(models.Notification).filter(
        models.Notification.type == "booking",
        models.Notification.is_read == False,
        (models.Notification.related_id == booking.id) | 
        (
            (models.Notification.action_url == "/admin/agenda") & 
            (models.Notification.message.contains(f"solicitou aula em {booking.date.strftime('%d/%m')} às {booking.time_slot}"))
        )
    ).update({"is_read": True}, synchronize_session=False)

    db.commit()
    db.refresh(booking)

    out = BookingOut.model_validate(booking)
    out.student_name = student.full_name if student else None
    return out


@router.delete("/bookings/{booking_id}", status_code=204)
def cancel_booking_admin(
    booking_id: int,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")

    was_confirmed = booking.status == "confirmed"
    booking.status = "cancelled"
    booking.cancellation_reason = reason
    booking.cancelled_at = datetime.now(timezone.utc)
    booking.cancelled_by_id = admin.id

    # Refund credit
    if was_confirmed:
        profile = db.query(models.StudentProfile).filter(
            models.StudentProfile.user_id == booking.student_id
        ).first()
        if profile:
            profile.credits_remaining += 1
            profile.credits_used = max(0, profile.credits_used - 1)

    student = db.get(models.User, booking.student_id)

    # Notify student
    notif = models.Notification(
        user_id=booking.student_id,
        type="booking",
        title="Aula cancelada",
        message=f"Sua aula de {booking.date.strftime('%d/%m')} às {booking.time_slot} foi cancelada.",
        action_url="/aluno/agenda",
    )
    db.add(notif)

    db.commit()

    # Send email
    if student and student.email:
        send_booking_cancelled_email(
            student.email, student.full_name,
            booking.date.strftime("%d/%m/%Y"), booking.time_slot,
            reason,
        )


@router.patch("/bookings/{booking_id}/complete", response_model=BookingOut)
def complete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    booking = db.get(models.Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Agendamento não encontrado")
    booking.status = "completed"
    db.commit()
    db.refresh(booking)
    out = BookingOut.model_validate(booking)
    return out


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


@router.post("/blocked-slots/batch", response_model=List[BlockedSlotOut], status_code=201)
def block_slots_batch(
    body: BlockedSlotBatchCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """Block all (or specific) slots for a date range."""
    batch_id = str(uuid.uuid4())
    slots_to_block = body.time_slots or ALL_SLOTS
    created = []

    current = body.start_date
    while current <= body.end_date:
        if is_business_day(current):
            for slot in slots_to_block:
                existing = db.query(models.BlockedSlot).filter(
                    models.BlockedSlot.date == current,
                    models.BlockedSlot.time_slot == slot,
                ).first()
                if not existing:
                    block = models.BlockedSlot(
                        date=current, time_slot=slot,
                        reason=body.reason, batch_id=batch_id,
                        created_by=admin.id,
                    )
                    db.add(block)
                    created.append(block)
        current += timedelta(days=1)

    db.commit()
    for b in created:
        db.refresh(b)
    return created


@router.delete("/blocked-slots/{block_id}", status_code=204)
def unblock_slot(block_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    block = db.get(models.BlockedSlot, block_id)
    if not block:
        raise HTTPException(404, "Bloqueio não encontrado")
    db.delete(block)
    db.commit()


@router.delete("/blocked-slots/batch/{batch_id}", status_code=204)
def unblock_batch(batch_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    blocks = db.query(models.BlockedSlot).filter(
        models.BlockedSlot.batch_id == batch_id
    ).all()
    for b in blocks:
        db.delete(b)
    db.commit()


# ── Lesson Notes ──────────────────────────────────────────────────────────────

@router.get("/students/{user_id}/lesson-notes", response_model=List[LessonNoteOut])
def list_lesson_notes(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    notes = (
        db.query(models.LessonNote)
        .filter(models.LessonNote.student_id == user_id)
        .order_by(models.LessonNote.lesson_date.desc())
        .all()
    )
    result = []
    for n in notes:
        out = LessonNoteOut.model_validate(n)
        author = db.get(models.User, n.author_id)
        out.author_name = author.full_name if author else None
        result.append(out)
    return result


@router.post("/students/{user_id}/lesson-notes", response_model=LessonNoteOut, status_code=201)
def create_lesson_note(
    user_id: int, body: LessonNoteCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    student = db.get(models.User, user_id)
    if not student:
        raise HTTPException(404, "Aluno não encontrado")

    note = models.LessonNote(
        booking_id=body.booking_id,
        student_id=user_id,
        author_id=admin.id,
        lesson_date=body.lesson_date,
        content=body.content,
        attendance=body.attendance,
        homework_status=body.homework_status,
        next_lesson_plan=body.next_lesson_plan,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    out = LessonNoteOut.model_validate(note)
    out.author_name = admin.full_name
    return out


@router.patch("/lesson-notes/{note_id}", response_model=LessonNoteOut)
def update_lesson_note(
    note_id: int, body: LessonNoteUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    note = db.get(models.LessonNote, note_id)
    if not note:
        raise HTTPException(404, "Anotação não encontrada")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    out = LessonNoteOut.model_validate(note)
    out.author_name = admin.full_name
    return out


@router.delete("/lesson-notes/{note_id}", status_code=204)
def delete_lesson_note(note_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    note = db.get(models.LessonNote, note_id)
    if not note:
        raise HTTPException(404, "Anotação não encontrada")
    db.delete(note)
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
        db.query(models.Booking, models.User.full_name)
        .join(models.User, models.Booking.student_id == models.User.id)
        .filter(models.Booking.status.in_(["confirmed", "completed"]))
        .order_by(models.Booking.date, models.Booking.time_slot)
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Aluno", "Data", "Horário", "Status"])
    for booking, name in rows:
        writer.writerow([name, booking.date.isoformat(), booking.time_slot, booking.status])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agendamentos.csv"},
    )
