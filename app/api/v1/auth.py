from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token
)

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = "client"  # client, cleaner, admin
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        # TODO: Check if user already exists
        # TODO: Create user in Firestore
        # TODO: Send verification email
        
        # For now, return a mock response
        user_dict = {
            "uid": "mock-uid",
            "email": user_data.email,
            "role": user_data.role,
            "verified": False
        }
        
        access_token = create_access_token({"sub": "mock-uid", "role": user_data.role})
        refresh_token = create_refresh_token({"sub": "mock-uid", "role": user_data.role})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_dict
        )
        
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Login user"""
    try:
        # TODO: Get user from Firestore
        # TODO: Verify password
        
        # For now, return a mock response
        user_dict = {
            "uid": "mock-uid",
            "email": user_credentials.email,
            "role": "client",
            "verified": True
        }
        
        access_token = create_access_token({"sub": "mock-uid", "role": "client"})
        refresh_token = create_refresh_token({"sub": "mock-uid", "role": "client"})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_dict
        )
        
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(token_request: RefreshTokenRequest):
    """Refresh access token"""
    try:
        payload = verify_token(token_request.refresh_token, "refresh")
        user_id = payload.get("sub")
        user_role = payload.get("role")
        
        new_access_token = create_access_token({"sub": user_id, "role": user_role})
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out"}