from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

# Initialize Argon2id password hasher
password_hash = PasswordHash((Argon2Hasher(),))

def hash(password: str) -> str:
    return password_hash.hash(password)

def verify(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)