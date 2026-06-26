"""
NOMA API — main FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, bookings, quiz, admin, assessments, payments, notifications

app = FastAPI(title="NOMA API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(quiz.router)
app.include_router(admin.router)
app.include_router(assessments.router)
app.include_router(payments.router)
app.include_router(notifications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
