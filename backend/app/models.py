import email
from time import timezone
from annotated_types import T
from sqlalchemy import  Column, ForeignKey, Integer, String, Boolean, UniqueConstraint  # Type Boolean goes here!
from .database import Base
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ ="users"

    id =Column(Integer,primary_key=True,nullable=False)
    username=Column(String,nullable=False)
    email=Column(String,nullable=False,unique=True)
    password=Column(String,nullable=False)
    profile_photo = Column(String, nullable=True)
    bookings = relationship("Booking", back_populates="user", cascade="all, delete")
    plan_likes = relationship("PlanLike", back_populates="user", cascade="all, delete")
    plan_ratings = relationship("PlanRating", back_populates="user", cascade="all, delete")
    reviews = relationship("Review", back_populates="user", cascade="all, delete")

class Plan(Base):
    __tablename__="plans"

    plan_id =Column(Integer,primary_key=True,nullable=False)
    plan_name=Column(String,nullable=False)
    plan_from=Column(String,nullable=False)
    plan_to=Column(String,nullable=False)
    amount=Column(Integer,nullable=False)
    plan_photo = Column(String, nullable=True)
    ticket_count=Column(Integer,nullable=False)
    bookings = relationship("Booking", back_populates="plan", cascade="all, delete")
    likes = relationship("PlanLike", back_populates="plan", cascade="all, delete")
    ratings = relationship("PlanRating", back_populates="plan", cascade="all, delete")

class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.plan_id", ondelete="CASCADE"), nullable=False)
    ticket_count = Column(Integer, nullable=False, server_default="1")
    total_amount = Column(Integer, nullable=False, server_default="0")
    payment_method = Column(String, nullable=True)
    payment_screenshot = Column(String, nullable=True)
    status = Column(String, nullable=False, server_default="pending")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    user = relationship("User", back_populates="bookings")
    plan = relationship("Plan", back_populates="bookings")

class PlanLike(Base):
    __tablename__ = "plan_likes"
    __table_args__ = (
        UniqueConstraint("user_id", "plan_id", name="unique_user_plan_like"),
    )

    like_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.plan_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    user = relationship("User", back_populates="plan_likes")
    plan = relationship("Plan", back_populates="likes")

class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    user = relationship("User", back_populates="reviews")

class PlanRating(Base):
    __tablename__ = "plan_ratings"
    __table_args__ = (
        UniqueConstraint("user_id", "plan_id", name="unique_user_plan_rating"),
    )

    rating_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.plan_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    user = relationship("User", back_populates="plan_ratings")
    plan = relationship("Plan", back_populates="ratings")
