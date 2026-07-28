from app import models, schemes, utils
from sqlalchemy.orm import Session
from fastapi import FastAPI ,Response,status,HTTPException,Depends,APIRouter
from .. database import engine,get_db

router=APIRouter(
    prefix="/userinfo",
    tags=['User']
)

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=schemes.UserOut)
def create_user(user:schemes.UserCreate,db: Session = Depends(get_db)):

    #hash the password - user.password
    hashed_password=utils.hash(user.password)
    user.password=hashed_password


    new_user=models.User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get('/{id}',response_model=schemes.UserOut)
def get_user(id:int,db: Session = Depends(get_db)):
    db.query(models.User).filter(models.User.id==id).first()
    user=db.query(models.User).filter(models.User.id == id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"User with id: {id} not exist")
    return user