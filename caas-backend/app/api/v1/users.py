from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.security import get_current_user_id
from app.services.user_service import user_service
from app.models.users import UserUpdate, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()


class PhoneVerificationRequest(BaseModel):
    verification_code: str


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_current_user_id)):
    """Get current user profile"""
    try:
        user = await user_service.get_user_by_id(current_user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user_service.format_user_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update current user profile"""
    try:
        success = await user_service.update_user_profile(current_user_id, user_update)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )
        
        # Get updated user
        user = await user_service.get_user_by_id(current_user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
        
        return user_service.format_user_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/verify-phone")
async def verify_phone(
    request: PhoneVerificationRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Verify phone number with SMS code"""
    try:
        success = await user_service.verify_phone(current_user_id, request.verification_code)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        return {"message": "Phone verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Phone verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Phone verification failed"
        )