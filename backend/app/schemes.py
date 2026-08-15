from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    profile_photo: str | None = None

    model_config = {
        "from_attributes": True
    }


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: int | None = None


class PlanBase(BaseModel):
    plan_name: str
    plan_from: str
    plan_to: str
    amount: int
    plan_photo: str | None = None
    ticket_count: int


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    plan_name: str | None = None
    plan_from: str | None = None
    plan_to: str | None = None
    amount: int | None = None
    plan_photo: str | None = None
    ticket_count: int | None = None


class PlanOut(PlanBase):
    plan_id: int
    average_rating: float = 0
    rating_count: int = 0

    model_config = {
        "from_attributes": True
    }


class PopularDestinationOut(BaseModel):
    destination: str
    total_plans: int
    lowest_amount: int
    total_tickets: int
    average_rating: float
    rating_count: int
    photo: str | None = None


class PlanPhotoUploadOut(BaseModel):
    filename: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class UserAdminOut(UserOut):
    pass


class UsageGrowthPoint(BaseModel):
    label: str
    users: int


class AdminStats(BaseModel):
    user_count: int
    plan_count: int
    total_tickets: int
    usage_growth: list[UsageGrowthPoint]


class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    plan_id: int
    ticket_count: int
    total_amount: int
    payment_method: str | None = None
    payment_screenshot: str | None = None
    status: str
    created_at: datetime
    plan: PlanOut

    model_config = {
        "from_attributes": True
    }


class AdminBookingOut(BookingOut):
    user: UserOut
    user_rating: int | None = None


class PlanRatingCreate(BaseModel):
    rating: int


class PlanRatingOut(BaseModel):
    plan_id: int
    rating: int


class ReviewCreate(BaseModel):
    rating: int
    comment: str


class ReviewUpdate(ReviewCreate):
    pass


class ReviewOut(BaseModel):
    review_id: int
    rating: int
    comment: str
    created_at: datetime
    user: UserOut

    model_config = {
        "from_attributes": True
    }
