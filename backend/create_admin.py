"""
Run once to create the admin user:
  python create_admin.py
"""
import sys
from app.database import SessionLocal
from app.models import User
from app.security import hash_password

USERNAME = "atum_noma_2026"
PASSWORD = "M@jeju10"
EMAIL    = "nomaenglishlab@gmail.com"

db = SessionLocal()
existing = db.query(User).filter(User.username == USERNAME).first()
if existing:
    print(f"Admin '{USERNAME}' already exists.")
    sys.exit(0)

admin = User(
    username=USERNAME,
    hashed_password=hash_password(PASSWORD),
    email=EMAIL,
    role="admin",
)
db.add(admin)
db.commit()
print(f"Admin '{USERNAME}' created successfully.")
db.close()
