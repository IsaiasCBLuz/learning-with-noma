from __future__ import annotations
import uuid
from datetime import date, time, datetime
from typing import Any

from pydantic import BaseModel, EmailStr, field_validator

from app.models import UserRole, PlanType, BookingStatus


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha precisa ter ao menos 6 caracteres")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Users ─────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str | None
    role: UserRole
    profile: StudentProfileOut | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class StudentProfileOut(BaseModel):
    plan: PlanType
    credits_total: int
    credits_used: int
    credits_remaining: int
    max_per_week: int
    start_date: date | None
    end_date: date | None

    model_config = {"from_attributes": True}


class EmailExistsResponse(BaseModel):
    exists: bool


# ── Admin: create/update student ──────────────────────────────────────────────

class AdminCreateStudentRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    password: str
    plan: PlanType
    start_date: date | None = None
    end_date: date | None = None


class AdminUpdateStudentRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    plan: PlanType | None = None
    credits_used: int | None = None
    start_date: date | None = None
    end_date: date | None = None


# ── Bookings ──────────────────────────────────────────────────────────────────

class CreateBookingRequest(BaseModel):
    date: date
    time_slot: time
    student_id: uuid.UUID | None = None


class BookingOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    student_name: str | None = None
    date: date
    time_slot: time
    status: BookingStatus
    created_by: uuid.UUID
    google_event_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Available Slots ───────────────────────────────────────────────────────────

class ToggleSlotRequest(BaseModel):
    date: date
    time_slot: time
    is_locked: bool


# ── Quiz ──────────────────────────────────────────────────────────────────────

class QuizSubmitRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    age_group: str
    level: str
    style: str
    commitment: str
    topics: list[str]
    result_turma: str
    result_estilo: str
    result_metodo: str
    result_plano: str


class QuizResponseOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str | None
    age_group: str
    level: str
    style: str
    commitment: str
    topics: list[Any]
    result_turma: str
    result_estilo: str
    result_metodo: str
    result_plano: str
    created_at: datetime

    model_config = {"from_attributes": True}
