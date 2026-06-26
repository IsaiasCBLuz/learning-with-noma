"""
NOMA English School — Database Models
All tables for the platform: auth, scheduling, credits, assessments, payments.
"""
from datetime import date, datetime, timezone
from sqlalchemy import (
    Boolean, Column, Integer, String, Text, Date, DateTime,
    ForeignKey, UniqueConstraint, Numeric, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


# ── Users ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    full_name            = Column(String(200), nullable=False)
    cpf                  = Column(String(14), unique=True, nullable=True, index=True)
    email                = Column(String(255), unique=True, nullable=False, index=True)
    username             = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password      = Column(Text, nullable=False)
    phone                = Column(String(20))
    role                 = Column(String(20), nullable=False, default="student")  # student | admin
    is_active            = Column(Boolean, nullable=False, default=True, server_default="true")
    must_change_password = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at           = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at           = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                                  onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profile   = relationship("StudentProfile", back_populates="user", uselist=False,
                                     cascade="all, delete-orphan")
    bookings_student  = relationship("Booking", back_populates="student",
                                     foreign_keys="Booking.student_id", cascade="all, delete-orphan")
    lesson_notes_as_student = relationship("LessonNote", back_populates="student",
                                           foreign_keys="LessonNote.student_id")
    assessment_submissions  = relationship("AssessmentSubmission", back_populates="student",
                                           foreign_keys="AssessmentSubmission.student_id")
    payments          = relationship("Payment", back_populates="student",
                                     foreign_keys="Payment.student_id", cascade="all, delete-orphan")
    notifications     = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    quiz_responses    = relationship("QuizResponse", back_populates="user")


# ── Plans ─────────────────────────────────────────────────────────────────────

class Plan(Base):
    __tablename__ = "plans"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(50), nullable=False)          # "Light Beige"
    slug             = Column(String(50), unique=True, nullable=False)  # "light_beige"
    category         = Column(String(10), nullable=False)          # light | full
    tier             = Column(String(10), nullable=False)          # beige | orange | green | gold
    credits_total    = Column(Integer, nullable=False)
    weekly_frequency = Column(Integer, nullable=False)             # 1 (light) or 2 (full)
    duration_months  = Column(Integer, nullable=False)             # 1, 3, 6, 12
    price            = Column(Numeric(10, 2), nullable=True)       # nullable: "sob consulta"
    is_active        = Column(Boolean, nullable=False, default=True)
    created_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profiles = relationship("StudentProfile", back_populates="plan")
    payments         = relationship("Payment", back_populates="plan")


# ── Student Profile ───────────────────────────────────────────────────────────

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                               unique=True, nullable=False)
    plan_id           = Column(Integer, ForeignKey("plans.id", ondelete="SET NULL"), nullable=True)
    turma             = Column(String(20))    # sprouts | buds | bloom | bee
    level             = Column(String(20))    # beginner | intermediate | advanced
    style             = Column(String(20))    # flow | roots | bee
    method            = Column(String(20))    # quest | level
    credits_remaining = Column(Integer, nullable=False, default=0)
    credits_used      = Column(Integer, nullable=False, default=0)
    contract_start    = Column(Date)
    contract_end      = Column(Date)
    created_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                               onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="student_profile")
    plan = relationship("Plan", back_populates="student_profiles")


# ── Bookings ──────────────────────────────────────────────────────────────────

class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint("date", "time_slot", name="uq_booking_slot"),
    )

    id                  = Column(Integer, primary_key=True, index=True)
    student_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date                = Column(Date, nullable=False)
    time_slot           = Column(String(5), nullable=False)     # "09:00"
    duration_minutes    = Column(Integer, nullable=False, default=90)
    status              = Column(String(20), nullable=False, default="pending")
    # status: pending | confirmed | cancelled | completed | no_show
    requested_by        = Column(String(10), nullable=False, default="student")  # student | admin
    approved_by_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at        = Column(DateTime(timezone=True), nullable=True)
    cancelled_by_id     = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at          = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at          = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                                 onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student      = relationship("User", back_populates="bookings_student",
                                foreign_keys=[student_id])
    approved_by  = relationship("User", foreign_keys=[approved_by_id])
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_id])
    lesson_note  = relationship("LessonNote", back_populates="booking", uselist=False)


# ── Blocked Slots ─────────────────────────────────────────────────────────────

class BlockedSlot(Base):
    __tablename__ = "blocked_slots"
    __table_args__ = (
        UniqueConstraint("date", "time_slot", name="uq_blocked_slot"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    date       = Column(Date, nullable=False)
    time_slot  = Column(String(5), nullable=False)
    reason     = Column(Text)
    batch_id   = Column(String(36), nullable=True, index=True)  # UUID for batch blocks
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ── Lesson Notes ──────────────────────────────────────────────────────────────

class LessonNote(Base):
    __tablename__ = "lesson_notes"

    id                = Column(Integer, primary_key=True, index=True)
    booking_id        = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    student_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    author_id         = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    lesson_date       = Column(Date, nullable=False)
    content           = Column(Text)
    attendance        = Column(String(10))   # present | absent | late
    homework_status   = Column(String(20))   # done | partial | not_done | none
    next_lesson_plan  = Column(Text)
    created_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                               onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    booking  = relationship("Booking", back_populates="lesson_note")
    student  = relationship("User", back_populates="lesson_notes_as_student",
                            foreign_keys=[student_id])
    author   = relationship("User", foreign_keys=[author_id])


# ── Assessments ───────────────────────────────────────────────────────────────

class Assessment(Base):
    __tablename__ = "assessments"

    id              = Column(Integer, primary_key=True, index=True)
    title           = Column(String(200), nullable=False)
    description     = Column(Text)
    questions_json  = Column(JSON, nullable=False)
    # JSON structure:
    # [
    #   {
    #     "id": "q1",
    #     "type": "multiple_choice" | "true_false" | "short_answer",
    #     "question": "...",
    #     "options": ["A", "B", "C", "D"],   (for MC/TF)
    #     "correct_answer": "A",              (for auto-grading)
    #     "points": 10
    #   }, ...
    # ]
    created_by_id   = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    is_active       = Column(Boolean, nullable=False, default=True)
    due_date        = Column(Date, nullable=True)
    target_level    = Column(String(20), nullable=True)
    target_turma    = Column(String(20), nullable=True)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                             onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    created_by  = relationship("User", foreign_keys=[created_by_id])
    submissions = relationship("AssessmentSubmission", back_populates="assessment",
                               cascade="all, delete-orphan")


class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"
    __table_args__ = (
        UniqueConstraint("assessment_id", "student_id", name="uq_assessment_student"),
    )

    id             = Column(Integer, primary_key=True, index=True)
    assessment_id  = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    student_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answers_json   = Column(JSON, nullable=False)
    score          = Column(Numeric(5, 2), nullable=True)
    max_score      = Column(Numeric(5, 2), nullable=True)
    graded_by_id   = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    graded_at      = Column(DateTime(timezone=True), nullable=True)
    submitted_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    assessment = relationship("Assessment", back_populates="submissions")
    student    = relationship("User", back_populates="assessment_submissions",
                              foreign_keys=[student_id])
    graded_by  = relationship("User", foreign_keys=[graded_by_id])


# ── Payments ──────────────────────────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id                     = Column(Integer, primary_key=True, index=True)
    student_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id                = Column(Integer, ForeignKey("plans.id", ondelete="SET NULL"), nullable=True)
    amount                 = Column(Numeric(10, 2), nullable=False)
    status                 = Column(String(20), nullable=False, default="pending")
    # status: pending | paid | overdue | cancelled
    due_date               = Column(Date, nullable=False)
    paid_at                = Column(DateTime(timezone=True), nullable=True)
    payment_method         = Column(String(30), nullable=True)   # pix | transfer | cash
    reference_period_start = Column(Date, nullable=True)
    reference_period_end   = Column(Date, nullable=True)
    notes                  = Column(Text, nullable=True)
    created_by_id          = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at             = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at             = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                                    onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student    = relationship("User", back_populates="payments", foreign_keys=[student_id])
    plan       = relationship("Plan", back_populates="payments")
    created_by = relationship("User", foreign_keys=[created_by_id])


# ── Notifications ─────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type       = Column(String(20), nullable=False)   # booking | payment | assessment | system
    title      = Column(String(200), nullable=False)
    message    = Column(Text)
    is_read    = Column(Boolean, nullable=False, default=False, server_default="false")
    action_url = Column(String(500), nullable=True)
    related_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="notifications")


# ── Quiz Response (landing page leads) ────────────────────────────────────────

class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255))
    phone      = Column(String(20))
    turma      = Column(String(20))
    level      = Column(String(20))
    style      = Column(String(20))
    method     = Column(String(20))
    commitment = Column(String(20))
    topics     = Column(JSON)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user       = relationship("User", back_populates="quiz_responses")
