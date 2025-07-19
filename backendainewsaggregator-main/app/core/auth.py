from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def test_password_hashing():
    """Test function to verify password hashing works correctly"""
    test_password = "test123"
    hashed = get_password_hash(test_password)
    print(f"Original password: {test_password}")
    print(f"Hashed password: {hashed}")
    print(f"Verification result: {verify_password(test_password, hashed)}")
    return verify_password(test_password, hashed)
