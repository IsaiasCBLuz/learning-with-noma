"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # ENUM types — idempotent
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE userrole AS ENUM ('student', 'admin');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE plantype AS ENUM (
                'light', 'light_plus', 'light_plusplus', 'light_star',
                'full', 'full_plus', 'full_plusplus', 'full_star', 'bee'
            );
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE bookingstatus AS ENUM ('scheduled', 'cancelled', 'completed');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """)

    # Tables — raw SQL avoids SQLAlchemy's auto-enum-creation
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name        VARCHAR(255) NOT NULL,
            email_encrypted VARCHAR(512) NOT NULL,
            email_hash  VARCHAR(255) NOT NULL UNIQUE,
            phone_encrypted VARCHAR(512),
            password_hash VARCHAR(255) NOT NULL,
            role        userrole NOT NULL DEFAULT 'student',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS student_profiles (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            plan        plantype NOT NULL,
            credits_total   INTEGER NOT NULL,
            credits_used    INTEGER NOT NULL DEFAULT 0,
            max_per_week    INTEGER NOT NULL,
            start_date  DATE,
            end_date    DATE
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date        DATE NOT NULL,
            time_slot   TIME NOT NULL,
            status      bookingstatus NOT NULL DEFAULT 'scheduled',
            created_by  UUID NOT NULL REFERENCES users(id),
            google_event_id VARCHAR(255),
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS available_slots (
            id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            date        DATE NOT NULL,
            time_slot   TIME NOT NULL,
            is_locked   BOOLEAN NOT NULL DEFAULT false,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS quiz_responses (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
            name            VARCHAR(255) NOT NULL,
            email           VARCHAR(255) NOT NULL,
            phone           VARCHAR(50),
            age_group       VARCHAR(50) NOT NULL,
            level           VARCHAR(50) NOT NULL,
            style           VARCHAR(50) NOT NULL,
            commitment      VARCHAR(50) NOT NULL,
            topics          JSON NOT NULL,
            result_turma    VARCHAR(100) NOT NULL,
            result_estilo   VARCHAR(100) NOT NULL,
            result_metodo   VARCHAR(100) NOT NULL,
            result_plano    VARCHAR(100) NOT NULL,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    # Indexes for common lookups
    op.execute("CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date, time_slot)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id, status)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS quiz_responses CASCADE")
    op.execute("DROP TABLE IF EXISTS available_slots CASCADE")
    op.execute("DROP TABLE IF EXISTS bookings CASCADE")
    op.execute("DROP TABLE IF EXISTS student_profiles CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")
    op.execute("DROP TYPE IF EXISTS bookingstatus")
    op.execute("DROP TYPE IF EXISTS plantype")
    op.execute("DROP TYPE IF EXISTS userrole")
