"""
NOMA API — main FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import auth, users, bookings, quiz, admin, assessments, payments, notifications

app = FastAPI(title="NOMA API", version="2.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:5174",
]
if settings.FRONTEND_URL:
    for url in settings.FRONTEND_URL.split(","):
        clean_url = url.strip().rstrip("/")
        if clean_url and clean_url not in origins:
            origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
