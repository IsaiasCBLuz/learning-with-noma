"""
NOMA Assessments Router — create, list, submit, grade assessments.
"""
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user, require_admin
from ..schemas import (
    AssessmentCreate, AssessmentOut, AssessmentStudentOut,
    AssessmentSubmit, AssessmentSubmissionOut,
)
from .. import models

router = APIRouter(tags=["assessments"])


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/assessments", response_model=List[AssessmentOut])
def list_assessments(db: Session = Depends(get_db), _=Depends(require_admin)):
    assessments = (
        db.query(models.Assessment)
        .order_by(models.Assessment.created_at.desc())
        .all()
    )
    result = []
    for a in assessments:
        out = AssessmentOut.model_validate(a)
        out.submissions_count = (
            db.query(models.AssessmentSubmission)
            .filter(models.AssessmentSubmission.assessment_id == a.id)
            .count()
        )
        result.append(out)
    return result


@router.post("/admin/assessments", response_model=AssessmentOut, status_code=201)
def create_assessment(
    body: AssessmentCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    assessment = models.Assessment(
        title=body.title,
        description=body.description,
        questions_json=[q.model_dump() for q in body.questions],
        created_by_id=admin.id,
        due_date=body.due_date,
        target_level=body.target_level,
        target_turma=body.target_turma,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.patch("/admin/assessments/{assessment_id}/toggle")
def toggle_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    assessment = db.get(models.Assessment, assessment_id)
    if not assessment:
        raise HTTPException(404, "Avaliação não encontrada")
    assessment.is_active = not assessment.is_active
    db.commit()
    return {"is_active": assessment.is_active}


@router.delete("/admin/assessments/{assessment_id}", status_code=204)
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    assessment = db.get(models.Assessment, assessment_id)
    if not assessment:
        raise HTTPException(404, "Avaliação não encontrada")
    db.delete(assessment)
    db.commit()


@router.get("/admin/assessments/{assessment_id}/submissions", response_model=List[AssessmentSubmissionOut])
def list_submissions(
    assessment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subs = (
        db.query(models.AssessmentSubmission)
        .filter(models.AssessmentSubmission.assessment_id == assessment_id)
        .order_by(models.AssessmentSubmission.submitted_at.desc())
        .all()
    )
    result = []
    for s in subs:
        out = AssessmentSubmissionOut.model_validate(s)
        student = db.get(models.User, s.student_id)
        assessment = db.get(models.Assessment, s.assessment_id)
        out.student_name = student.full_name if student else None
        out.assessment_title = assessment.title if assessment else None
        result.append(out)
    return result


# ── Student endpoints ─────────────────────────────────────────────────────────

@router.get("/assessments/mine", response_model=List[AssessmentStudentOut])
def my_assessments(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """List assessments available to this student (active, matching level/turma)."""
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user.id
    ).first()

    q = db.query(models.Assessment).filter(models.Assessment.is_active == True)

    # Filter by level/turma if set on the assessment
    assessments = q.order_by(models.Assessment.created_at.desc()).all()

    result = []
    for a in assessments:
        # Check if matches student profile
        if a.target_level and profile and profile.level != a.target_level:
            continue
        if a.target_turma and profile and profile.turma != a.target_turma:
            continue

        # Check if already submitted
        submitted = db.query(models.AssessmentSubmission).filter(
            models.AssessmentSubmission.assessment_id == a.id,
            models.AssessmentSubmission.student_id == user.id,
        ).first()

        # Strip correct answers from questions
        questions = []
        for q_item in (a.questions_json or []):
            clean = {k: v for k, v in q_item.items() if k != "correct_answer"}
            questions.append(clean)

        result.append(AssessmentStudentOut(
            id=a.id,
            title=a.title,
            description=a.description,
            questions=questions,
            due_date=a.due_date,
            already_submitted=submitted is not None,
        ))
    return result


@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentSubmissionOut, status_code=201)
def submit_assessment(
    assessment_id: int,
    body: AssessmentSubmit,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    assessment = db.get(models.Assessment, assessment_id)
    if not assessment or not assessment.is_active:
        raise HTTPException(404, "Avaliação não encontrada ou inativa")

    # Check if already submitted
    existing = db.query(models.AssessmentSubmission).filter(
        models.AssessmentSubmission.assessment_id == assessment_id,
        models.AssessmentSubmission.student_id == user.id,
    ).first()
    if existing:
        raise HTTPException(409, "Você já respondeu esta avaliação")

    # Auto-grade
    score = Decimal("0")
    max_score = Decimal("0")
    for q in (assessment.questions_json or []):
        points = Decimal(str(q.get("points", 10)))
        max_score += points
        if q.get("correct_answer") and body.answers.get(q["id"]) == q["correct_answer"]:
            score += points

    submission = models.AssessmentSubmission(
        assessment_id=assessment_id,
        student_id=user.id,
        answers_json=body.answers,
        score=score,
        max_score=max_score,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    out = AssessmentSubmissionOut.model_validate(submission)
    out.student_name = user.full_name
    out.assessment_title = assessment.title
    return out


@router.get("/assessments/mine/results", response_model=List[AssessmentSubmissionOut])
def my_assessment_results(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    subs = (
        db.query(models.AssessmentSubmission)
        .filter(models.AssessmentSubmission.student_id == user.id)
        .order_by(models.AssessmentSubmission.submitted_at.desc())
        .all()
    )
    result = []
    for s in subs:
        out = AssessmentSubmissionOut.model_validate(s)
        assessment = db.get(models.Assessment, s.assessment_id)
        out.assessment_title = assessment.title if assessment else None
        out.student_name = user.full_name
        result.append(out)
    return result
