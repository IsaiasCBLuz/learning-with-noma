"""
Executar após `alembic upgrade head` para criar o usuário admin.

Uso:
    python create_admin.py --email admin@noma.com --password suasenha --name "Admin NOMA"
"""
import asyncio
import argparse

from app.database import AsyncSessionLocal
from app.models import User, UserRole
from app.security import encrypt_field, hash_email, hash_password
from sqlalchemy import select


async def main(name: str, email: str, password: str):
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email_hash == hash_email(email)))
        if existing.scalar_one_or_none():
            print(f"❌  Já existe um usuário com o email {email}")
            return

        admin = User(
            name=name,
            email_encrypted=encrypt_field(email.lower()),
            email_hash=hash_email(email),
            password_hash=hash_password(password),
            role=UserRole.admin,
        )
        db.add(admin)
        await db.commit()
        print(f"✅  Admin criado: {name} <{email}>")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--name", default="Admin NOMA")
    args = parser.parse_args()
    asyncio.run(main(args.name, args.email, args.password))
