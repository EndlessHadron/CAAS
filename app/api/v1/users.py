from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.core.security import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter()


class UserProfile(BaseModel):
    uid: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str
    address: Optional[dict] = None
    verification: dict = {}
    created_at: Optional[str] = None


class UpdateUserProfile(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[dict] = None


@router.get("/me", response_model=UserProfile)
async def get_current_user(current_user_id: str = Depends(get_current_user_id)):
    """Get current user profile"""
    try:
        # TODO: Get user from Firestore using current_user_id
        
        # Mock response for now
        return UserProfile(
            uid=current_user_id,
            email="user@example.com",
            first_name="John",
            last_name="Doe",
            phone="+44123456789",
            role="client",
            address={
                "line1": "123 Main St",
                "city": "London",
                "postcode": "SW1A 1AA"
            },
            verification={
                "email": True,
                "phone": False,
                "identity": False
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


@router.put("/me", response_model=UserProfile)
async def update_current_user(
    user_update: UpdateUserProfile,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update current user profile"""
    try:
        # TODO: Update user in Firestore
        
        # Mock response for now
        return UserProfile(
            uid=current_user_id,
            email="user@example.com",
            first_name=user_update.first_name or "John",
            last_name=user_update.last_name or "Doe",
            phone=user_update.phone,
            role="client",
            address=user_update.address,
            verification={
                "email": True,
                "phone": False,
                "identity": False
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile"
        )


@router.post("/verify-phone")
async def verify_phone(
    verification_code: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Verify phone number with SMS code"""
    try:
        # TODO: Implement phone verification logic
        return {"message": "Phone verified successfully"}
        
    except Exception as e:
        logger.error(f"Phone verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )