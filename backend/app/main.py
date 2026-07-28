from fastapi import FastAPI

from app.routers import users
from . import models
from . database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Backend running"
    }
app.include_router(users.router)

