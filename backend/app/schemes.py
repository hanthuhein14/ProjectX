from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserOut(BaseModel):
    id:int
    username:str
    email: EmailStr

class UserCreate(BaseModel):
    username:str
    email: EmailStr
    password:str



class UserLogin(BaseModel):
    email: EmailStr
    password:str




class Token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    id: int | None = None

