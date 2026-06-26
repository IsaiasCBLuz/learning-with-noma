"""
NOMA seed script — creates default plans, admin, and student users.
Run: python seed.py
"""
from datetime import date, datetime, timezone
from app.database import SessionLocal, engine, Base
from app.models import User, Plan, StudentProfile
from app.security import hash_password

PASSWORD = "Atum2026#"


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # ── Plans ─────────────────────────────────────────────────────────────
    plans_data = [
        # Light plans (1x/week)
        {"name": "Light Beige",  "slug": "light_beige",  "category": "light", "tier": "beige",
         "credits_total": 4,  "weekly_frequency": 1, "duration_months": 1},
        {"name": "Light Orange", "slug": "light_orange", "category": "light", "tier": "orange",
         "credits_total": 12, "weekly_frequency": 1, "duration_months": 3},
        {"name": "Light Green",  "slug": "light_green",  "category": "light", "tier": "green",
         "credits_total": 24, "weekly_frequency": 1, "duration_months": 6},
        {"name": "Light Gold",   "slug": "light_gold",   "category": "light", "tier": "gold",
         "credits_total": 48, "weekly_frequency": 1, "duration_months": 12},
        # Full plans (2x/week)
        {"name": "Full Beige",   "slug": "full_beige",   "category": "full", "tier": "beige",
         "credits_total": 8,  "weekly_frequency": 2, "duration_months": 1},
        {"name": "Full Orange",  "slug": "full_orange",  "category": "full", "tier": "orange",
         "credits_total": 24, "weekly_frequency": 2, "duration_months": 3},
        {"name": "Full Green",   "slug": "full_green",   "category": "full", "tier": "green",
         "credits_total": 48, "weekly_frequency": 2, "duration_months": 6},
        {"name": "Full Gold",    "slug": "full_gold",    "category": "full", "tier": "gold",
         "credits_total": 96, "weekly_frequency": 2, "duration_months": 12},
    ]

    for pd in plans_data:
        existing = db.query(Plan).filter(Plan.slug == pd["slug"]).first()
        if not existing:
            db.add(Plan(**pd))
            print(f"  Plan '{pd['name']}' created.")
        else:
            print(f"  Plan '{pd['name']}' already exists.")

    db.flush()

    # ── Admin user ────────────────────────────────────────────────────────
    admin_username = "Atum_admin"
    admin = db.query(User).filter(User.username == admin_username).first()
    if not admin:
        admin = User(
            full_name="Admin NOMA",
            email="admin@noma.com",
            username=admin_username,
            hashed_password=hash_password(PASSWORD),
            role="admin",
        )
        db.add(admin)
        print(f"  Admin '{admin_username}' created.")
    else:
        admin.hashed_password = hash_password(PASSWORD)
        print(f"  Admin '{admin_username}' already exists. Password updated.")

    # ── Student user ──────────────────────────────────────────────────────
    student_username = "Atum_aluno"
    student = db.query(User).filter(User.username == student_username).first()
    if not student:
        student = User(
            full_name="Aluno NOMA",
            email="aluno@noma.com",
            username=student_username,
            hashed_password=hash_password(PASSWORD),
            role="student",
        )
        db.add(student)
        db.flush()

        # Assign Light Beige plan
        light_beige = db.query(Plan).filter(Plan.slug == "light_beige").first()
        profile = StudentProfile(
            user_id=student.id,
            plan_id=light_beige.id if light_beige else None,
            turma="bloom",
            level="beginner",
            credits_remaining=light_beige.credits_total if light_beige else 4,
            credits_used=0,
            contract_start=date(2026, 6, 1),
            contract_end=date(2026, 9, 1),
        )
        db.add(profile)
        print(f"  Student '{student_username}' created with Light Beige plan.")
    else:
        student.hashed_password = hash_password(PASSWORD)
        print(f"  Student '{student_username}' already exists. Password updated.")

    db.commit()
    db.close()
    print("\nSeed completed successfully!")


if __name__ == "__main__":
    seed()
