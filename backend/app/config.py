from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    fernet_key: str
    admin_password_hash: str
    google_calendar_id: str = ""
    google_service_account_json: str = ""
    frontend_url: str = "http://localhost:5173"
    token_expire_hours: int = 24

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
