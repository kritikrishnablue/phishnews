from fastapi import APIRouter, HTTPException, Depends, Header
from app.models.user import UserCreate, UserLogin, UserOut
from app.database.mongo import users_collection
from app.core.auth import get_password_hash, verify_password, create_access_token
from typing import Optional
import os
import sys

auth_router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ", 1)[1]
    try:
        from jose import jwt
        payload = jwt.decode(token, os.getenv("SECRET_KEY", "supersecret"), algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@auth_router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    try:
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Add debug logging
        sys.stdout.write(f"Registering user: {user.email}\n")
        sys.stdout.flush()
        
        hashed_pw = get_password_hash(user.password)
        sys.stdout.write(f"Password hashed successfully: {bool(hashed_pw)}\n")
        sys.stdout.flush()
        
        user_doc = {
            "email": user.email,
            "password": hashed_pw,
            "preferences": user.preferences or {"topics": [], "sources": [], "countries": []},
            "reading_history": [],
            "bookmarks": user.bookmarks or [],
            "liked_articles": user.liked_articles or []
        }
        
        result = users_collection.insert_one(user_doc)
        sys.stdout.write(f"User saved to DB with ID: {result.inserted_id}\n")
        sys.stdout.flush()
        
        token = create_access_token({"sub": user.email})
        return {
            "email": user.email,
            "token": token,
            "preferences": user_doc["preferences"],
            "reading_history": user_doc["reading_history"],
            "bookmarks": user_doc["bookmarks"],
            "liked_articles": user_doc["liked_articles"]
        }
    except HTTPException:
        raise
    except Exception as e:
        sys.stdout.write(f"Registration error: {e}\n")
        sys.stdout.flush()
        raise HTTPException(status_code=500, detail="Registration failed")

@auth_router.post("/login", response_model=UserOut)
def login(user: UserLogin):
    try:
        sys.stdout.write(f"\n=== LOGIN ATTEMPT ===\n")
        sys.stdout.write(f"Email: {user.email}\n")
        sys.stdout.write(f"Password: '{user.password}'\n")  # Show the actual password
        sys.stdout.write(f"Password length: {len(user.password)}\n")
        sys.stdout.flush()
        
        db_user = users_collection.find_one({"email": user.email})
        sys.stdout.write(f"User found in DB: {bool(db_user)}\n")
        sys.stdout.flush()
        
        if not db_user:
            sys.stdout.write("❌ User not found in database\n")
            sys.stdout.flush()
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        sys.stdout.write(f"Stored hashed password: {db_user['password'][:20]}...\n")
        sys.stdout.flush()
        
        # Test password verification
        is_valid = verify_password(user.password, db_user["password"])
        sys.stdout.write(f"Password verification result: {is_valid}\n")
        sys.stdout.flush()
        
        if not is_valid:
            sys.stdout.write("❌ Password verification failed\n")
            sys.stdout.write(f"Trying to verify with password: '{user.password}'\n")
            sys.stdout.flush()
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        sys.stdout.write("✅ Password verification successful\n")
        sys.stdout.flush()
        
        token = create_access_token({"sub": user.email})
        sys.stdout.write(f"Token created: {token[:20]}...\n")
        sys.stdout.flush()
        
        return {
            "email": user.email,
            "token": token,
            "preferences": db_user.get("preferences", {"topics": [], "sources": [], "countries": []}),
            "reading_history": db_user.get("reading_history", []),
            "bookmarks": db_user.get("bookmarks", []),
            "liked_articles": db_user.get("liked_articles", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        sys.stdout.write(f"❌ Login error: {e}\n")
        sys.stdout.flush()
        raise HTTPException(status_code=500, detail="Login failed")

# Add this new endpoint to check user data
@auth_router.get("/test/user/{email}")
def get_user_data(email: str):
    """Get user data from database (for debugging)"""
    user = users_collection.find_one({"email": email})
    if not user:
        return {"error": "User not found"}
    
    # Don't return the actual password hash for security
    user_data = {
        "email": user["email"],
        "has_password": bool(user.get("password")),
        "password_length": len(user.get("password", "")),
        "preferences": user.get("preferences"),
        "bookmarks_count": len(user.get("bookmarks", [])),
        "liked_articles_count": len(user.get("liked_articles", []))
    }
    return user_data

# Add this new endpoint for testing
@auth_router.delete("/test/clear-user/{email}")
def clear_test_user(email: str):
    """Clear a test user from database (for testing only)"""
    result = users_collection.delete_one({"email": email})
    return {"message": f"Deleted {result.deleted_count} user(s) with email {email}"}

# Add this endpoint to test password hashing
@auth_router.get("/test/password-hash")
def test_password_hashing():
    """Test password hashing functionality"""
    from app.core.auth import test_password_hashing
    return {"result": test_password_hashing()}

# Add this new endpoint to test password verification
@auth_router.post("/test/verify-password")
def test_verify_password(email: str, password: str):
    """Test password verification for a specific user"""
    user = users_collection.find_one({"email": email})
    if not user:
        return {"error": "User not found"}
    
    is_valid = verify_password(password, user["password"])
    return {
        "email": email,
        "password_provided": password,
        "password_length": len(password),
        "hashed_password_stored": user["password"][:20] + "...",
        "verification_result": is_valid
    }
