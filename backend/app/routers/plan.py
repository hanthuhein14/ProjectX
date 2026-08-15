import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, oauth2, schemes
from ..database import get_db
from ..oauth2 import get_current_user


router = APIRouter(
    prefix="/plans",
    tags=["Plans"]
)


def get_plan_rating_stats(db: Session):
    rating_rows = db.query(
        models.PlanRating.plan_id,
        func.avg(models.PlanRating.rating).label("average_rating"),
        func.count(models.PlanRating.rating_id).label("rating_count")
    ).group_by(
        models.PlanRating.plan_id
    ).all()

    return {
        row.plan_id: {
            "average_rating": round(float(row.average_rating or 0), 1),
            "rating_count": row.rating_count or 0
        }
        for row in rating_rows
    }


def serialize_plan(plan: models.Plan, rating_stats: dict):
    stats = rating_stats.get(
        plan.plan_id,
        {
            "average_rating": 0,
            "rating_count": 0
        }
    )

    return {
        "plan_id": plan.plan_id,
        "plan_name": plan.plan_name,
        "plan_from": plan.plan_from,
        "plan_to": plan.plan_to,
        "amount": plan.amount,
        "plan_photo": plan.plan_photo,
        "ticket_count": plan.ticket_count,
        "average_rating": stats["average_rating"],
        "rating_count": stats["rating_count"]
    }

UPLOAD_DIR = "uploads/plans"
os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.get(
    "/",
    response_model=list[schemes.PlanOut]
)
def get_plans(
    db: Session = Depends(get_db),
    limit: int = 100,
    skip: int = 0
):
    plans = db.query(
        models.Plan
    ).order_by(
        models.Plan.plan_id
    ).offset(
        skip
    ).limit(
        limit
    ).all()

    rating_stats = get_plan_rating_stats(db)

    return [
        serialize_plan(plan, rating_stats)
        for plan in plans
    ]


@router.get(
    "/popular-destinations",
    response_model=list[schemes.PopularDestinationOut]
)
def get_popular_destinations(
    db: Session = Depends(get_db),
    limit: int = 3
):
    plan_rating_stats = db.query(
        models.PlanRating.plan_id.label("plan_id"),
        func.avg(models.PlanRating.rating).label("plan_average_rating"),
        func.count(models.PlanRating.rating_id).label("plan_rating_count")
    ).group_by(
        models.PlanRating.plan_id
    ).subquery()

    total_plans = func.count(
        models.Plan.plan_id
    ).label("total_plans")

    total_tickets = func.sum(
        models.Plan.ticket_count
    ).label("total_tickets")

    lowest_amount = func.min(
        models.Plan.amount
    ).label("lowest_amount")

    photo = func.max(
        models.Plan.plan_photo
    ).label("photo")

    rating_count = func.sum(
        func.coalesce(plan_rating_stats.c.plan_rating_count, 0)
    ).label("rating_count")

    average_rating = func.avg(
        plan_rating_stats.c.plan_average_rating
    ).label("average_rating")

    destinations = db.query(
        models.Plan.plan_to.label("destination"),
        total_plans,
        lowest_amount,
        total_tickets,
        average_rating,
        rating_count,
        photo
    ).outerjoin(
        plan_rating_stats,
        plan_rating_stats.c.plan_id == models.Plan.plan_id
    ).group_by(
        models.Plan.plan_to
    ).order_by(
        average_rating.desc().nullslast(),
        rating_count.desc(),
        total_tickets.desc()
    ).limit(
        limit
    ).all()

    return [
        {
            "destination": destination.destination,
            "total_plans": destination.total_plans,
            "lowest_amount": destination.lowest_amount,
            "total_tickets": destination.total_tickets or 0,
            "average_rating": round(float(destination.average_rating or 0), 1),
            "rating_count": destination.rating_count or 0,
            "photo": destination.photo
        }
        for destination in destinations
    ]


@router.get(
    "/ratings/me",
    response_model=dict[int, int]
)
def get_my_plan_ratings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ratings = db.query(
        models.PlanRating
    ).filter(
        models.PlanRating.user_id == current_user.id
    ).all()

    return {
        rating.plan_id: rating.rating
        for rating in ratings
    }


@router.post(
    "/{plan_id}/rating",
    response_model=schemes.PlanRatingOut
)
def rate_plan(
    plan_id: int,
    rating_data: schemes.PlanRatingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    approved_booking = db.query(
        models.Booking
    ).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.plan_id == plan_id,
        models.Booking.status == "approved"
    ).first()

    if not approved_booking:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can rate this plan only after admin approval"
        )

    rating = db.query(
        models.PlanRating
    ).filter(
        models.PlanRating.user_id == current_user.id,
        models.PlanRating.plan_id == plan_id
    ).first()

    if rating:
        rating.rating = rating_data.rating
    else:
        rating = models.PlanRating(
            user_id=current_user.id,
            plan_id=plan_id,
            rating=rating_data.rating
        )
        db.add(rating)

    db.commit()

    return {
        "plan_id": plan_id,
        "rating": rating_data.rating
    }


@router.post(
    "/upload-photo",
    response_model=schemes.PlanPhotoUploadOut
)
async def upload_plan_photo(
    plan_photo: UploadFile = File(...),
    admin=Depends(oauth2.get_current_admin)
):
    if not plan_photo.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not detected"
        )

    if not plan_photo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )

    extension = os.path.splitext(
        plan_photo.filename
    )[1].lower()

    if not extension:
        extension = ".jpg"

    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    contents = await plan_photo.read()

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return {
        "filename": filename
    }


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemes.PlanOut
)
def create_plan(
    plan: schemes.PlanCreate,
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    new_plan = models.Plan(
        **plan.model_dump()
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.put(
    "/{plan_id}",
    response_model=schemes.PlanOut
)
def update_plan(
    plan_id: int,
    plan_update: schemes.PlanUpdate,
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
    plan_query = db.query(
        models.Plan
    ).filter(
        models.Plan.plan_id == plan_id
    )

    plan = plan_query.first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan with id: {plan_id} does not exist"
        )

    update_data = plan_update.model_dump(
        exclude_unset=True
    )

    plan_query.update(
        update_data,
        synchronize_session=False
    )

    db.commit()
    db.refresh(plan)

    return plan


@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    admin=Depends(oauth2.get_current_admin)
):
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

    db.delete(plan)
    db.commit()

    return None


@router.get(
    "/{plan_id}",
    response_model=schemes.PlanOut
)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
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

    rating_stats = get_plan_rating_stats(db)

    return serialize_plan(plan, rating_stats)
