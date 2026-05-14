import uuid
from datetime import datetime, date, time
from sqlalchemy import (
    String, Integer, Boolean, Date, Time, DateTime, Text,
    ForeignKey, Enum as SAEnum, JSON, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class PlanType(str, enum.Enum):
    light = "light"
    light_plus = "light_plus"
    light_plusplus = "light_plusplus"
    light_star = "light_star"
    full = "full"
    full_plus = "full_plus"
    full_plusplus = "full_plusplus"
    full_star = "full_star"
    bee = "bee"


class BookingStatus(str, enum.Enum):
    scheduled = "scheduled"
    cancelled = "cancelled"
    completed = "completed"


PLAN_CREDITS = {
    PlanType.light: 4,
    PlanType.light_plus: 12,
    PlanType.light_plusplus: 24,
    PlanType.light_star: 48,
    PlanType.full: 8,
    PlanType.full_plus: 24,
    PlanType.full_plusplus: 48,
    PlanType.full_star: 96,
    PlanType.bee: 4,
}

PLAN_MAX_PER_WEEK = {
    PlanType.light: 1,
    PlanType.light_plus: 1,
    PlanType.light_plusplus: 1,
    PlanType.light_star: 1,
    PlanType.full: 2,
    PlanType.full_plus: 2,
    PlanType.full_plusplus: 2,
    PlanType.full_star: 2,
    PlanType.bee: 1,
}


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email_encrypted: Mapped[str] = mapped_column(String(512), nullable=False)
    email_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone_encrypted: Mapped[str | None] = mapped_column(String(512), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.student, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped["StudentProfile | None"] = relationship("StudentProfile", back_populates="user", uselist=False)
    bookings: Mapped[list["Booking"]] = relationship("Booking", foreign_keys="Booking.student_id", back_populates="student")
    quiz_responses: Mapped[list["QuizResponse"]] = relationship("QuizResponse", back_populates="user")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    plan: Mapped[PlanType] = mapped_column(SAEnum(PlanType), nullable=False)
    credits_total: Mapped[int] = mapped_column(Integer, nullable=False)
    credits_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time_slot: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(SAEnum(BookingStatus), default=BookingStatus.scheduled, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    google_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], back_populates="bookings")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])


class AvailableSlot(Base):
    __tablename__ = "available_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time_slot: Mapped[time] = mapped_column(Time, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    age_group: Mapped[str] = mapped_column(String(50), nullable=False)
    level: Mapped[str] = mapped_column(String(50), nullable=False)
    style: Mapped[str] = mapped_column(String(50), nullable=False)
    commitment: Mapped[str] = mapped_column(String(50), nullable=False)
    topics: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    result_turma: Mapped[str] = mapped_column(String(100), nullable=False)
    result_estilo: Mapped[str] = mapped_column(String(100), nullable=False)
    result_metodo: Mapped[str] = mapped_column(String(100), nullable=False)
    result_plano: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User | None"] = relationship("User", back_populates="quiz_responses")
