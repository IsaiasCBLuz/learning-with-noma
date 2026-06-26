"""
NOMA Quiz Router — landing page quiz submissions.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import QuizSubmit
from .. import models

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/submit", status_code=201)
def submit_quiz(body: QuizSubmit, db: Session = Depends(get_db)):
    if body.email:
        email_clean = body.email.strip().lower()
        body.email = email_clean
        existing = db.query(models.QuizResponse).filter(
            func.lower(models.QuizResponse.email) == email_clean
        ).first()
        if existing:
            for field, value in body.model_dump().items():
                setattr(existing, field, value)
            existing.created_at = datetime.now(timezone.utc)
            db.commit()
            return {"ok": True}

    response = models.QuizResponse(
        name=body.name,
        email=body.email,
        phone=body.phone,
        turma=body.turma,
        level=body.level,
        style=body.style,
        method=body.method,
        commitment=body.commitment,
        topics=body.topics,
    )
    db.add(response)
    db.commit()
    return {"ok": True}
