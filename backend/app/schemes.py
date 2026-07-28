from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserOut(BaseModel):
    id:int
    email: EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password:str



class UserLogin(BaseModel):
    email: EmailStr
    password:str