from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users,auth
from . import models
from . database import engine


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Backend running"
    }
app.include_router(users.router)
app.include_router(auth.router)

