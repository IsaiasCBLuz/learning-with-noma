"""
NOMA Payments Router — admin manages payments, students view their payments.
"""
import csv
import io
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user, require_admin
from ..schemas import PaymentCreate, PaymentOut, PaymentUpdate
from .. import models

router = APIRouter(tags=["payments"])


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/payments", response_model=List[PaymentOut])
def list_payments(
    status: Optional[str] = None,
    student_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    q = db.query(models.Payment).join(models.User, models.Payment.student_id == models.User.id)

    if status:
        q = q.filter(models.Payment.status == status)
    if student_id:
        q = q.filter(models.Payment.student_id == student_id)
    if date_from:
        q = q.filter(models.Payment.due_date >= date_from)
    if date_to:
        q = q.filter(models.Payment.due_date <= date_to)

    rows = q.order_by(models.Payment.due_date.desc()).all()

    result = []
    for p in rows:
        out = PaymentOut.model_validate(p)
        out.student_name = p.student.full_name
        if p.plan:
            out.plan_name = p.plan.name
        result.append(out)
    return result


@router.post("/admin/payments", response_model=PaymentOut, status_code=201)
def create_payment(
    body: PaymentCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    student = db.get(models.User, body.student_id)
    if not student:
        raise HTTPException(404, "Aluno não encontrado")

    payment = models.Payment(
        student_id=body.student_id,
        plan_id=body.plan_id,
        amount=body.amount,
        due_date=body.due_date,
        payment_method=body.payment_method,
        reference_period_start=body.reference_period_start,
        reference_period_end=body.reference_period_end,
        notes=body.notes,
        created_by_id=admin.id,
    )
    db.add(payment)

    # Notify student
    notif = models.Notification(
        user_id=body.student_id,
        type="payment",
        title="Nova cobrança registrada",
        message=f"R$ {body.amount:.2f} — vencimento {body.due_date.strftime('%d/%m/%Y')}",
        action_url="/aluno/pagamentos",
    )
    db.add(notif)

    db.commit()
    db.refresh(payment)

    out = PaymentOut.model_validate(payment)
    out.student_name = student.full_name
    return out


@router.patch("/admin/payments/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: int,
    body: PaymentUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    payment = db.get(models.Payment, payment_id)
    if not payment:
        raise HTTPException(404, "Pagamento não encontrado")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)

    # If marking as paid, set paid_at
    if body.status == "paid" and not payment.paid_at:
        payment.paid_at = datetime.now(timezone.utc)

        # Notify student
        notif = models.Notification(
            user_id=payment.student_id,
            type="payment",
            title="Pagamento confirmado",
            message=f"Seu pagamento de R$ {payment.amount:.2f} foi confirmado.",
            action_url="/aluno/pagamentos",
        )
        db.add(notif)

    db.commit()
    db.refresh(payment)

    out = PaymentOut.model_validate(payment)
    student = db.get(models.User, payment.student_id)
    out.student_name = student.full_name if student else None
    if payment.plan:
        out.plan_name = payment.plan.name
    return out


@router.delete("/admin/payments/{payment_id}", status_code=204)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    payment = db.get(models.Payment, payment_id)
    if not payment:
        raise HTTPException(404, "Pagamento não encontrado")
    db.delete(payment)
    db.commit()


# ── Revenue stats ─────────────────────────────────────────────────────────────

@router.get("/admin/revenue/monthly")
def monthly_revenue(
    year: int = Query(default=None),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Get monthly revenue breakdown for charts."""
    if year is None:
        year = date.today().year

    months = []
    for month in range(1, 13):
        total = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(
            models.Payment.status == "paid",
            extract("year", models.Payment.paid_at) == year,
            extract("month", models.Payment.paid_at) == month,
        ).scalar()
        months.append({
            "month": month,
            "year": year,
            "total": float(total),
        })
    return months


@router.get("/admin/export/payments.csv")
def export_payments_csv(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    rows = (
        db.query(models.Payment)
        .join(models.User, models.Payment.student_id == models.User.id)
        .order_by(models.Payment.due_date.desc())
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Aluno", "Valor", "Status", "Vencimento", "Pago em", "Método"])
    for p in rows:
        writer.writerow([
            p.student.full_name,
            f"{p.amount:.2f}",
            p.status,
            p.due_date.isoformat(),
            p.paid_at.strftime("%d/%m/%Y") if p.paid_at else "",
            p.payment_method or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=pagamentos.csv"},
    )


# ── Student endpoints ─────────────────────────────────────────────────────────

@router.get("/payments/mine", response_model=List[PaymentOut])
def my_payments(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Payment)
        .filter(models.Payment.student_id == user.id)
        .order_by(models.Payment.due_date.desc())
        .all()
    )
    result = []
    for p in rows:
        out = PaymentOut.model_validate(p)
        out.student_name = user.full_name
        if p.plan:
            out.plan_name = p.plan.name
        result.append(out)
    return result
