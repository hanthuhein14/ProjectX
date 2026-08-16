from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings


SQLALCHEMY_DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=settings.database_username,
    password=settings.database_password,
    host=settings.database_hostname,
    port=int(settings.database_port),
    database=settings.database_name,
)


engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"sslmode": settings.database_sslmode}
)

SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

Base=declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

