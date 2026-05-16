from datetime import date, datetime, timezone
from sqlalchemy import (
    Boolean, Column, Integer, String, Text, Date, DateTime,
    ForeignKey, UniqueConstraint, ARRAY
)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    username         = Column(String(100), unique=True, nullable=False, index=True)
    email            = Column(String(255))
    phone            = Column(String(20))
    hashed_password  = Column(Text, nullable=False)
    role             = Column(String(20), default="student")   # student | admin
    turma            = Column(String(20))   # sprouts | buds | bloom
    plan             = Column(String(20))   # light | light+ | light++ | light_annual | full | ...
    style            = Column(String(20))   # flow | roots | bee
    method           = Column(String(20))   # quest | level
    contract_start   = Column(Date)
    contract_end     = Column(Date)
    credits_total        = Column(Integer)
    must_change_password = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at           = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    bookings         = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    quiz_responses   = relationship("QuizResponse", back_populates="user")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (UniqueConstraint("date", "time_slot", name="uq_booking_slot"),)

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date       = Column(Date, nullable=False)
    time_slot  = Column(String(5), nullable=False)   # "09:00"
    status     = Column(String(20), default="confirmed")   # confirmed | cancelled
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user       = relationship("User", back_populates="bookings")


class BlockedSlot(Base):
    __tablename__ = "blocked_slots"
    __table_args__ = (UniqueConstraint("date", "time_slot", name="uq_blocked_slot"),)

    id         = Column(Integer, primary_key=True, index=True)
    date       = Column(Date, nullable=False)
    time_slot  = Column(String(5), nullable=False)
    reason     = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


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
    topics     = Column(ARRAY(String))
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user       = relationship("User", back_populates="quiz_responses")
