import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, oauth2, schemes
from ..database import get_db


ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin123"
PROFILE_UPLOAD_DIR = "uploads/profile"


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def build_usage_growth(users: list[models.User]):
    if not users:
        return [
            {
                "label": "Start",
                "users": 0
            }
        ]

    max_points = 7
    total_users = len(users)

    if total_users <= max_points:
        return [
            {
                "label": f"User {index}",
                "users": index
            }
            for index in range(1, total_users + 1)
        ]

    step = total_users / max_points
    points = []

    for index in range(1, max_points + 1):
        users_count = round(step * index)
        points.append(
            {
                "label": f"{users_count} users",
                "users": users_count
            }
        )

    return points


@router.post(
    "/login",
    response_model=schemes.Token
)
def admin_login(
    admin_credentials: schemes.AdminLogin
):
    if (
        admin_credentials.email.lower() != ADMIN_EMAIL
        or admin_credentials.password != ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin credentials"
        )

    access_token = oauth2.create_access_token(
        data={
            "sub": "admin",
            "is_admin": True
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/stats",
    response_model=schemes.AdminStats
)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    users = db.query(
        models.User
    ).order_by(
        models.User.id
    ).all()

    plan_count = db.query(
        models.Plan
    ).count()

    total_tickets = db.query(
        func.coalesce(
            func.sum(models.Plan.ticket_count),
            0
        )
    ).scalar()

    return {
        "user_count": len(users),
        "plan_count": plan_count,
        "total_tickets": total_tickets,
        "usage_growth": build_usage_growth(users)
    }


@router.get(
    "/users",
    response_model=list[schemes.UserAdminOut]
)
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    users = db.query(
        models.User
    ).order_by(
        models.User.id
    ).all()

    return users


@router.get(
    "/bookings",
    response_model=list[schemes.AdminBookingOut]
)
def get_booking_requests(
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    bookings = db.query(
        models.Booking
    ).order_by(
        models.Booking.created_at.desc()
    ).all()

    ratings = db.query(
        models.PlanRating
    ).all()

    rating_map = {
        (rating.user_id, rating.plan_id): rating.rating
        for rating in ratings
    }

    for booking in bookings:
        booking.user_rating = rating_map.get(
            (booking.user_id, booking.plan_id)
        )

    return bookings


@router.put(
    "/bookings/{booking_id}/{booking_status}",
    response_model=schemes.AdminBookingOut
)
def update_booking_status(
    booking_id: int,
    booking_status: str,
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    if booking_status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking status must be approved or rejected"
        )

    booking = db.query(
        models.Booking
    ).filter(
        models.Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id: {booking_id} does not exist"
        )

    if booking.status == booking_status:
        return booking

    if booking.status == "approved" and booking_status == "rejected":
        booking.plan.ticket_count += booking.ticket_count

    if booking_status == "approved" and booking.status != "approved":
        if booking.plan.ticket_count < booking.ticket_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough tickets available for this plan"
            )

        booking.plan.ticket_count -= booking.ticket_count

    booking.status = booking_status
    db.commit()
    db.refresh(booking)

    return booking


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    user = db.query(
        models.User
    ).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id: {user_id} does not exist"
        )

    if user.profile_photo:
        profile_path = os.path.join(
            PROFILE_UPLOAD_DIR,
            user.profile_photo
        )

        if os.path.exists(profile_path):
            os.remove(profile_path)

    db.delete(user)
    db.commit()

    return None
