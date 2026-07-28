import email
from time import timezone
from annotated_types import T
from sqlalchemy import  Column, ForeignKey, Integer, String, Boolean  # Type Boolean goes here!
from .database import Base
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ ="users"

    id =Column(Integer,primary_key=True,nullable=False)
    usernamme=Column(String,nullable=False)
    email=Column(String,nullable=False,unique=True)
    password=Column(String,nullable=False)
    