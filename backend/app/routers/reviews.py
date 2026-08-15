from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemes
from ..database import get_db
from ..oauth2 import get_current_user


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.get(
    "/",
    response_model=list[schemes.ReviewOut]
)
def get_reviews(
    db: Session = Depends(get_db)
):
    reviews = db.query(
        models.Review
    ).order_by(
        models.Review.created_at.desc()
    ).all()

    return reviews


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemes.ReviewOut
)
def create_review(
    review: schemes.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    comment = review.comment.strip()

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review comment cannot be empty"
        )

    new_review = models.Review(
        user_id=current_user.id,
        rating=review.rating,
        comment=comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.put(
    "/{review_id}",
    response_model=schemes.ReviewOut
)
def update_review(
    review_id: int,
    review_update: schemes.ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review = db.query(
        models.Review
    ).filter(
        models.Review.review_id == review_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review with id: {review_id} does not exist"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own review"
        )

    comment = review_update.comment.strip()

    if review_update.rating < 1 or review_update.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review comment cannot be empty"
        )

    review.rating = review_update.rating
    review.comment = comment

    db.commit()
    db.refresh(review)

    return review


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review = db.query(
        models.Review
    ).filter(
        models.Review.review_id == review_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review with id: {review_id} does not exist"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own review"
        )

    db.delete(review)
    db.commit()

    return None
