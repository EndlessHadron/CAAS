from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.core.security import (
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.services.user_service import user_service
from app.models.users import UserCreate, UserRole

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
    """Register a new user with real JWT tokens"""
    try:
        # Validate role
        if user_data.role not in ["client", "cleaner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role specified. Must be: client, cleaner, or admin"
            )
        
        # Validate password strength
        if len(user_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Check if user already exists
        if user_service.check_user_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user
        user_create = UserCreate(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=UserRole(user_data.role),
            phone=user_data.phone
        )
        
        user_id = user_service.create_user(user_create)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        # Get the created user
        user = user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created user"
            )
        
        # Create real JWT tokens
        access_token = create_access_token({"sub": user_id, "role": user_data.role})
        refresh_token = create_refresh_token({"sub": user_id, "role": user_data.role})
        
        # Format user response as dict
        user_response = user_service.format_user_response(user).dict()
        
        logger.info(f"User registered successfully: {user_data.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )


@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Login user with real JWT tokens"""
    try:
        # Authenticate user
        user = user_service.authenticate_user(
            user_credentials.email, 
            user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create real JWT tokens
        access_token = create_access_token({"sub": user['uid'], "role": user['role']})
        refresh_token = create_refresh_token({"sub": user['uid'], "role": user['role']})
        
        # Format user response as dict
        user_response = user_service.format_user_response(user).dict()
        
        logger.info(f"User logged in successfully: {user_credentials.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(token_request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(token_request.refresh_token, "refresh")
        user_id = payload.get("sub")
        user_role = payload.get("role")
        
        if not user_id or not user_role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token payload"
            )
        
        # Verify user still exists
        user = user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists"
            )
        
        new_access_token = create_access_token({"sub": user_id, "role": user_role})
        
        logger.info(f"Token refreshed for user: {user_id}")
        
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


@router.get("/stats")
async def get_auth_stats():
    """Get authentication system statistics"""
    try:
        stats = user_service.get_user_statistics()
        return {
            "status": "operational",
            "database": "firestore",
            "users": stats
        }
    except Exception as e:
        logger.error(f"Failed to get auth stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )