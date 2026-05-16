from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: "UserOut"


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    turma: Optional[str] = None
    plan: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    credits_total: Optional[int] = None
    must_change_password: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "student"
    turma: Optional[str] = None
    plan: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    credits_total: Optional[int] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    turma: Optional[str] = None
    plan: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    credits_total: Optional[int] = None

class InviteStudentRequest(BaseModel):
    name: str
    email: str

class ChangePasswordRequest(BaseModel):
    new_password: str


# ── Bookings ──────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    date: date
    time_slot: str

class BookingOut(BaseModel):
    id: int
    user_id: int
    date: date
    time_slot: str
    status: str
    created_at: datetime
    username: Optional[str] = None

    model_config = {"from_attributes": True}

class SlotInfo(BaseModel):
    date: date
    time_slot: str
    status: str   # free | mine | occupied | blocked | past | out_of_contract | limit


# ── Blocked Slots ─────────────────────────────────────────────────────────────

class BlockedSlotCreate(BaseModel):
    date: date
    time_slot: str
    reason: Optional[str] = None

class BlockedSlotOut(BaseModel):
    id: int
    date: date
    time_slot: str
    reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Quiz ──────────────────────────────────────────────────────────────────────

class QuizSubmit(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    turma: str
    level: str
    style: str
    method: str
    commitment: str
    topics: List[str]

class QuizResponseOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    turma: Optional[str] = None
    level: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    commitment: Optional[str] = None
    topics: Optional[List[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()
