import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models, schemes
from ..database import get_db
from ..oauth2 import get_current_user


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

PAYMENT_UPLOAD_DIR = "uploads/payment"
os.makedirs(
    PAYMENT_UPLOAD_DIR,
    exist_ok=True
)


@router.post(
    "/{plan_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=schemes.BookingOut
)
async def request_booking(
    plan_id: int,
    ticket_count: int = Form(...),
    payment_method: str = Form(...),
    payment_screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    payment_method = payment_method.strip()

    if ticket_count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket count must be at least 1"
        )

    if payment_method not in ["Kpay", "Wavepay", "AyaPay"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment method"
        )

    if not payment_screenshot.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment screenshot file type not detected"
        )

    if not payment_screenshot.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment screenshot must be an image"
        )

    plan = db.query(
        models.Plan
    ).filter(
        models.Plan.plan_id == plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan with id: {plan_id} does not exist"
        )

    if plan.ticket_count < ticket_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough tickets available for this plan"
        )

    existing_booking = db.query(
        models.Booking
    ).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.plan_id == plan_id,
        models.Booking.status == "pending"
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a pending request for this plan"
        )

    extension = os.path.splitext(
        payment_screenshot.filename
    )[1].lower()

    if not extension:
        extension = ".jpg"

    screenshot_filename = f"{uuid.uuid4()}{extension}"
    screenshot_path = os.path.join(
        PAYMENT_UPLOAD_DIR,
        screenshot_filename
    )

    contents = await payment_screenshot.read()

    with open(screenshot_path, "wb") as buffer:
        buffer.write(contents)

    booking = models.Booking(
        user_id=current_user.id,
        plan_id=plan_id,
        ticket_count=ticket_count,
        total_amount=plan.amount * ticket_count,
        payment_method=payment_method,
        payment_screenshot=screenshot_filename,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


@router.get(
    "/me",
    response_model=list[schemes.BookingOut]
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = db.query(
        models.Booking
    ).filter(
        models.Booking.user_id == current_user.id
    ).order_by(
        models.Booking.created_at.desc()
    ).all()

    return bookings
