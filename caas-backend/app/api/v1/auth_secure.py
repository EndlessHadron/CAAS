"""
Secure authentication endpoints with production-grade security
Replaces basic auth with enhanced security features
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime

from app.core.security_enhanced import security_service, TokenPair
from app.services.user_service import user_service
from app.core.database import get_firestore_client
from app.models.users import User

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter()

class LoginRequest(BaseModel):
    """Secure login request with validation"""
    email: EmailStr
    password: str
    
    @validator('password')
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class RegisterRequest(BaseModel):
    """Secure registration request"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = "client"
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')  
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain number')
        return v
    
    @validator('role')
    def valid_role(cls, v):
        if v not in ['client', 'cleaner']:
            raise ValueError('Invalid role')
        return v

class TokenResponse(BaseModel):
    """Secure token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 300  # 5 minutes
    user: dict

class RefreshRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str

@router.post("/login", response_model=TokenResponse)
async def secure_login(
    request: Request,
    response: Response,
    login_data: LoginRequest
) -> TokenResponse:
    """
    Secure login endpoint with rate limiting and account lockout
    """
    try:
        email = login_data.email.lower().strip()
        
        # Check rate limiting
        if not await security_service.check_rate_limit(email, request):
            logger.warning(f"Rate limit exceeded for login attempt: {email}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again in 15 minutes.",
                headers={"Retry-After": "900"}
            )
        
        # Check account lockout
        if await security_service.is_account_locked(email):
            logger.warning(f"Account locked login attempt: {email}")
            await security_service.record_login_attempt(email, False, request)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account temporarily locked due to failed login attempts."
            )
        
        # Validate credentials
        user_data = user_service.authenticate_user(email, login_data.password)
        if not user_data:
            await security_service.record_login_attempt(email, False, request)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check user status
        if user_data.get('status') == 'suspended':
            logger.warning(f"Suspended user login attempt: {email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended. Contact support."
            )
        
        # Create secure token pair
        token_pair = security_service.create_token_pair(
            user_id=user_data['uid'],
            role=user_data['role'],
            email=email
        )
        
        # Set secure cookies
        response.set_cookie(
            key="refresh_token",
            value=token_pair.refresh_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,
            samesite="strict",
            path="/api/v1/auth/refresh"
        )
        
        # Record successful login
        await security_service.record_login_attempt(email, True, request)
        
        # Update last login time
        user_service.update_last_active(user_data['uid'])
        
        logger.info(f"Successful secure login: {email}")
        
        return TokenResponse(
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
            expires_in=300,  # 5 minutes
            user={
                "uid": user_data['uid'],
                "email": user_data['email'],
                "role": user_data['role'],
                "profile": user_data.get('profile', {}),
                "status": user_data.get('status', 'active')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for {login_data.email}: {e}")
        await security_service.record_login_attempt(login_data.email, False, request)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service temporarily unavailable"
        )

@router.post("/register", response_model=TokenResponse)
async def secure_register(
    request: Request,
    response: Response,
    registration_data: RegisterRequest
) -> TokenResponse:
    """
    Secure registration endpoint with enhanced validation
    """
    try:
        email = registration_data.email.lower().strip()
        
        # Check rate limiting for registration
        if not await security_service.check_rate_limit(f"register:{email}", request):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many registration attempts. Please try again later."
            )
        
        # Check if user already exists
        if user_service.get_user_by_email(email):
            logger.warning(f"Registration attempt with existing email: {email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Hash password with enhanced security
        password_hash = security_service.get_password_hash(registration_data.password)
        
        # Create user
        user_data = {
            "email": email,
            "password_hash": password_hash,
            "role": registration_data.role,
            "profile": {
                "first_name": registration_data.first_name,
                "last_name": registration_data.last_name,
                "phone": registration_data.phone,
            },
            "status": "pending_verification",
            "verification": {
                "email": False,
                "phone": False,
                "identity": False,
                "background": False
            },
            "preferences": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Create user in database
        user_id = user_service.create_user(user_data)
        user_data['uid'] = user_id
        
        # Create secure token pair
        token_pair = security_service.create_token_pair(
            user_id=user_id,
            role=registration_data.role,
            email=email
        )
        
        # Set secure refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=token_pair.refresh_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,
            samesite="strict", 
            path="/api/v1/auth/refresh"
        )
        
        logger.info(f"Successful secure registration: {email}")
        
        return TokenResponse(
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
            expires_in=300,
            user={
                "uid": user_id,
                "email": email,
                "role": registration_data.role,
                "profile": user_data["profile"],
                "status": "pending_verification"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error for {registration_data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service temporarily unavailable"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    refresh_data: RefreshRequest
) -> TokenResponse:
    """
    Refresh access token using refresh token
    """
    try:
        # Verify refresh token
        payload = security_service.verify_refresh_token(refresh_data.refresh_token)
        
        # Get user data
        user_id = payload.get("sub")
        user_data = user_service.get_user_by_id(user_id)
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check user status
        if user_data.get('status') == 'suspended':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended"
            )
        
        # Create new token pair
        token_pair = security_service.create_token_pair(
            user_id=user_id,
            role=user_data['role'],
            email=user_data['email']
        )
        
        # Blacklist old refresh token
        old_token_id = payload.get("jti")
        if old_token_id:
            security_service.blacklist_token(
                old_token_id,
                datetime.fromtimestamp(payload.get("exp", 0))
            )
        
        logger.info(f"Token refreshed for user: {user_id}")
        
        return TokenResponse(
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
            expires_in=300,
            user={
                "uid": user_data['uid'],
                "email": user_data['email'],
                "role": user_data['role'],
                "profile": user_data.get('profile', {}),
                "status": user_data.get('status', 'active')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout")
async def secure_logout(
    request: Request,
    response: Response,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Secure logout - blacklist tokens
    """
    try:
        # Verify and get token info
        payload = security_service.verify_access_token(credentials.credentials)
        
        # Blacklist the access token
        token_id = payload.get("jti")
        if token_id:
            expires_at = datetime.fromtimestamp(payload.get("exp", 0))
            security_service.blacklist_token(token_id, expires_at)
        
        # Clear refresh token cookie
        response.delete_cookie(
            key="refresh_token",
            path="/api/v1/auth/refresh"
        )
        
        logger.info(f"Secure logout for user: {payload.get('sub')}")
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Return success even on error to prevent information leakage
        return {"message": "Successfully logged out"}

def get_current_user_secure(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Enhanced secure current user dependency
    """
    try:
        # Verify access token
        payload = security_service.verify_access_token(credentials.credentials)
        
        # Get user data
        user_id = payload.get("sub")
        user_data = user_service.get_user_by_id(user_id)
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check if user is still active
        if user_data.get('status') == 'suspended':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account suspended"
            )
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Current user verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def require_role_secure(required_role: str):
    """Enhanced role-based access control"""
    def role_dependency(current_user: dict = Depends(get_current_user_secure)) -> dict:
        user_role = current_user.get('role')
        
        # Admin has access to everything
        if user_role == 'admin':
            return current_user
        
        # Check specific role requirement
        if user_role != required_role:
            logger.warning(f"Access denied: {user_role} attempted {required_role} operation")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient privileges. {required_role} role required."
            )
        
        return current_user
    
    return role_dependency