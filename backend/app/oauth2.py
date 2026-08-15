from fastapi import Depends,status,HTTPException
from fastapi.security import OAuth2
import jwt
from datetime import datetime,timedelta,timezone

from . import schemes,database,models
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings

oauth2_scheme=OAuth2PasswordBearer(tokenUrl='login')
#Secret key
#algorithm
#Expriation time

SECRET_KEY=settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def create_access_token(data:dict):
    to_encode=data.copy()

    expire=datetime.now(timezone.utc)+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})

    encode_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encode_jwt

def verify_access_token(token:str,credentials_exception):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])

        user_id=payload.get("user_id")

        if user_id is None:
            raise credentials_exception
        token_data=schemes.TokenData(id=int(user_id))
    except jwt.PyJWTError:
        raise credentials_exception
    return token_data

def verify_admin_access_token(token:str,credentials_exception):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])

        is_admin=payload.get("is_admin")

        if is_admin is not True:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    return payload

def get_current_admin(token:str=Depends(oauth2_scheme)):
    credentials_exception=HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=f"Could not validate admin credentials",headers={"WWW-Authenticate":"Bearer"})

    return verify_admin_access_token(token, credentials_exception)
    
def get_current_user(token:str=Depends(oauth2_scheme),db: Session = Depends(database.get_db)):
    credentials_exception=HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=f"Could not validate credentials",headers={"WWW-Authenticate":"Bearer"})

    token=verify_access_token(token, credentials_exception)
    user=db.query(models.User).filter(models.User.id== token.id).first()

    return user
