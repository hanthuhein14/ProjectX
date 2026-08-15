from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_hostname:str
    database_port:str
    database_password:str
    database_name:str
    database_username:str
    database_sslmode:str = "prefer"
    secret_key:str
    algorithm:str
    access_token_expire_minutes:int
    cors_origins:str = "http://localhost:5173,https://projectx71.vercel.app"

    class Config:
        env_file = ".env"

settings=Settings()
