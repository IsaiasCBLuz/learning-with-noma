"""Google Calendar integration via Service Account."""
import json
from datetime import date, time, datetime, timedelta
from typing import Optional

from app.config import get_settings

settings = get_settings()

_service = None


def _get_service():
    global _service
    if _service is not None:
        return _service

    if not settings.google_service_account_json or not settings.google_calendar_id:
        return None

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        info = json.loads(settings.google_service_account_json)
        scopes = ["https://www.googleapis.com/auth/calendar"]
        creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)
        _service = build("calendar", "v3", credentials=creds)
        return _service
    except Exception:
        return None


async def create_event(
    student_name: str,
    student_email: str,
    lesson_date: date,
    lesson_time: time,
) -> Optional[str]:
    service = _get_service()
    if not service:
        return None

    start_dt = datetime.combine(lesson_date, lesson_time)
    end_dt = start_dt + timedelta(hours=1, minutes=30)

    event = {
        "summary": f"Aula NOMA – {student_name}",
        "description": f"Aluno(a): {student_name}\nEmail: {student_email}",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "America/Sao_Paulo"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "America/Sao_Paulo"},
        "attendees": [{"email": student_email}],
    }

    try:
        created = service.events().insert(
            calendarId=settings.google_calendar_id,
            body=event,
            sendUpdates="all",
        ).execute()
        return created.get("id")
    except Exception:
        return None


async def delete_event(event_id: str) -> bool:
    service = _get_service()
    if not service:
        return False
    try:
        service.events().delete(
            calendarId=settings.google_calendar_id,
            eventId=event_id,
        ).execute()
        return True
    except Exception:
        return False
