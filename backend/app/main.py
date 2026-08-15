from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth, plan, admin, bookings, reviews
from . import models
from . database import engine
from sqlalchemy import text
from fastapi.staticfiles import StaticFiles
import os

UPLOAD_DIR = "uploads/profile"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("uploads/payment", exist_ok=True)
models.Base.metadata.create_all(bind=engine)

def ensure_booking_columns():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_count INTEGER NOT NULL DEFAULT 1"))
        connection.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER NOT NULL DEFAULT 0"))
        connection.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR"))
        connection.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_screenshot VARCHAR"))

ensure_booking_columns()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

@app.get("/")
def home():
    return {
        "message": "Backend running"
    }
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(plan.router)
app.include_router(admin.router)
app.include_router(bookings.router)
app.include_router(reviews.router)

