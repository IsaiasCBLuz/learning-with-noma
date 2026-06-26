"""
NOMA English School — Pydantic Schemas
Request/response models for all API endpoints.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List, Any
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

class ChangePasswordRequest(BaseModel):
    new_password: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    full_name: str
    cpf: Optional[str] = None
    email: str
    username: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    must_change_password: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    full_name: str
    cpf: Optional[str] = None
    email: str
    phone: Optional[str] = None
    role: str = "student"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


# ── Plan ──────────────────────────────────────────────────────────────────────

class PlanOut(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    tier: str
    credits_total: int
    weekly_frequency: int
    duration_months: int
    price: Optional[Decimal] = None
    is_active: bool

    model_config = {"from_attributes": True}


# ── Student Profile ──────────────────────────────────────────────────────────

class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int] = None
    plan: Optional[PlanOut] = None
    turma: Optional[str] = None
    level: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    credits_remaining: int = 0
    credits_used: int = 0
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class StudentProfileCreate(BaseModel):
    plan_id: Optional[int] = None
    turma: Optional[str] = None
    level: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    credits_remaining: Optional[int] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None

class StudentProfileUpdate(BaseModel):
    plan_id: Optional[int] = None
    turma: Optional[str] = None
    level: Optional[str] = None
    style: Optional[str] = None
    method: Optional[str] = None
    credits_remaining: Optional[int] = None
    credits_used: Optional[int] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None

class StudentFullOut(BaseModel):
    """Student with profile and stats for admin detail view."""
    user: UserOut
    profile: Optional[StudentProfileOut] = None
    total_lessons: int = 0
    attended_lessons: int = 0
    pending_payments: int = 0

    model_config = {"from_attributes": True}


# ── Credits ───────────────────────────────────────────────────────────────────

class CreditAdjust(BaseModel):
    amount: int  # positive to add, negative to remove
    reason: Optional[str] = None


# ── Bookings ──────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    date: date
    time_slot: str

class BookingAdminCreate(BaseModel):
    student_id: int
    date: date
    time_slot: str

class BookingOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    date: date
    time_slot: str
    duration_minutes: int = 90
    status: str
    requested_by: str
    cancellation_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class BookingApprove(BaseModel):
    booking_id: int

class BookingCancel(BaseModel):
    reason: Optional[str] = None

class SlotInfo(BaseModel):
    date: date
    time_slot: str
    status: str  # free | mine | occupied | blocked | past | out_of_contract | limit | pending


# ── Blocked Slots ────────────────────────────────────────────────────────────

class BlockedSlotCreate(BaseModel):
    date: date
    time_slot: str
    reason: Optional[str] = None

class BlockedSlotBatchCreate(BaseModel):
    start_date: date
    end_date: date
    time_slots: List[str]  # ["09:00", "10:30", ...] or empty for all
    reason: Optional[str] = None

class BlockedSlotOut(BaseModel):
    id: int
    date: date
    time_slot: str
    reason: Optional[str] = None
    batch_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Lesson Notes ──────────────────────────────────────────────────────────────

class LessonNoteCreate(BaseModel):
    booking_id: Optional[int] = None
    lesson_date: date
    content: Optional[str] = None
    attendance: Optional[str] = None       # present | absent | late
    homework_status: Optional[str] = None  # done | partial | not_done | none
    next_lesson_plan: Optional[str] = None

class LessonNoteOut(BaseModel):
    id: int
    booking_id: Optional[int] = None
    student_id: int
    author_id: int
    author_name: Optional[str] = None
    lesson_date: date
    content: Optional[str] = None
    attendance: Optional[str] = None
    homework_status: Optional[str] = None
    next_lesson_plan: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class LessonNoteUpdate(BaseModel):
    content: Optional[str] = None
    attendance: Optional[str] = None
    homework_status: Optional[str] = None
    next_lesson_plan: Optional[str] = None


# ── Assessments ───────────────────────────────────────────────────────────────

class QuestionSchema(BaseModel):
    id: str
    type: str          # multiple_choice | true_false | short_answer
    question: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    points: int = 10

class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionSchema]
    due_date: Optional[date] = None
    target_level: Optional[str] = None
    target_turma: Optional[str] = None

class AssessmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    questions_json: Any
    created_by_id: Optional[int] = None
    is_active: bool
    due_date: Optional[date] = None
    target_level: Optional[str] = None
    target_turma: Optional[str] = None
    submissions_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}

class AssessmentStudentOut(BaseModel):
    """Assessment as seen by student (without correct answers)."""
    id: int
    title: str
    description: Optional[str] = None
    questions: List[dict]  # stripped of correct_answer
    due_date: Optional[date] = None
    already_submitted: bool = False

    model_config = {"from_attributes": True}

class AssessmentSubmit(BaseModel):
    answers: dict  # { "q1": "A", "q2": "True", ... }

class AssessmentSubmissionOut(BaseModel):
    id: int
    assessment_id: int
    assessment_title: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    answers_json: Any
    score: Optional[Decimal] = None
    max_score: Optional[Decimal] = None
    graded_at: Optional[datetime] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}


# ── Payments ──────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    student_id: int
    plan_id: Optional[int] = None
    amount: Decimal
    due_date: date
    payment_method: Optional[str] = None
    reference_period_start: Optional[date] = None
    reference_period_end: Optional[date] = None
    notes: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    plan_id: Optional[int] = None
    plan_name: Optional[str] = None
    amount: Decimal
    status: str
    due_date: date
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None
    reference_period_start: Optional[date] = None
    reference_period_end: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None
    amount: Optional[Decimal] = None
    notes: Optional[str] = None


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: Optional[str] = None
    is_read: bool
    action_url: Optional[str] = None
    related_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_students: int = 0
    active_students: int = 0
    total_lessons_month: int = 0
    pending_bookings: int = 0
    revenue_month: Decimal = Decimal("0")
    revenue_prev_month: Decimal = Decimal("0")
    overdue_payments: int = 0
    assessments_pending: int = 0


# ── Quiz (landing page) ──────────────────────────────────────────────────────

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


# Rebuild forward refs
TokenResponse.model_rebuild()
