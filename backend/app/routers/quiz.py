from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.database import get_db
from app.deps import get_current_user, get_admin_user
from app.models import User, QuizResponse
from app.schemas import QuizSubmitRequest, QuizResponseOut

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/", response_model=QuizResponseOut, status_code=201)
async def submit_quiz(
    body: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = None,
):
    quiz = QuizResponse(
        user_id=user.id if user else None,
        name=body.name,
        email=body.email,
        phone=body.phone,
        age_group=body.age_group,
        level=body.level,
        style=body.style,
        commitment=body.commitment,
        topics=body.topics,
        result_turma=body.result_turma,
        result_estilo=body.result_estilo,
        result_metodo=body.result_metodo,
        result_plano=body.result_plano,
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return quiz


@router.get("/", response_model=list[QuizResponseOut])
async def list_quiz(
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(QuizResponse).order_by(QuizResponse.created_at.desc()).limit(limit)
    )
    return result.scalars().all()
