import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings


settings = get_settings()


def _asyncpg_url(url: str) -> str:
    """asyncpg uses ?ssl=require, not ?sslmode=require (Aiven default format)."""
    return re.sub(r'sslmode=\w+', 'ssl=require', url)


engine = create_async_engine(_asyncpg_url(settings.database_url), echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
