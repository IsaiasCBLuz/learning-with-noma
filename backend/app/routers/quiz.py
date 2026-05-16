from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import QuizSubmit
from .. import models

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/submit", status_code=201)
def submit_quiz(body: QuizSubmit, db: Session = Depends(get_db)):
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
