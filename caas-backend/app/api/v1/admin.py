from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.core.security import require_role

logger = logging.getLogger(__name__)

router = APIRouter()


class UserSummary(BaseModel):
    uid: str
    email: str
    role: str
    status: str
    created_at: str
    last_active: Optional[str] = None


class BookingSummary(BaseModel):
    booking_id: str
    client_email: str
    cleaner_email: Optional[str] = None
    status: str
    service_type: str
    date: str
    amount: float
    created_at: str


class Analytics(BaseModel):
    total_users: int
    active_clients: int
    active_cleaners: int
    total_bookings: int
    completed_bookings: int
    revenue_this_month: float
    revenue_last_month: float


@router.get("/users", response_model=List[UserSummary])
async def get_all_users(current_user_id: str = Depends(require_role("admin"))):
    """Get all users for admin panel"""
    try:
        # TODO: Get all users from Firestore
        
        # Mock response
        return [
            UserSummary(
                uid="user_1",
                email="client@example.com",
                role="client",
                status="active",
                created_at="2024-01-01T00:00:00Z"
            ),
            UserSummary(
                uid="user_2",
                email="cleaner@example.com",
                role="cleaner",
                status="active",
                created_at="2024-01-02T00:00:00Z"
            )
        ]
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )


@router.put("/users/{user_id}")
async def update_user_status(
    user_id: str,
    status: str,
    current_user_id: str = Depends(require_role("admin"))
):
    """Update user status (active, suspended, etc.)"""
    try:
        # TODO: Update user status in Firestore
        
        return {"message": f"User {user_id} status updated to {status}"}
        
    except Exception as e:
        logger.error(f"Failed to update user status: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user status"
        )


@router.get("/bookings", response_model=List[BookingSummary])
async def get_all_bookings(current_user_id: str = Depends(require_role("admin"))):
    """Get all bookings for admin panel"""
    try:
        # TODO: Get all bookings from Firestore
        
        # Mock response
        return [
            BookingSummary(
                booking_id="booking_1",
                client_email="client@example.com",
                cleaner_email="cleaner@example.com",
                status="completed",
                service_type="regular",
                date="2024-01-10",
                amount=75.0,
                created_at="2024-01-08T00:00:00Z"
            )
        ]
        
    except Exception as e:
        logger.error(f"Failed to get bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve bookings"
        )


@router.get("/analytics", response_model=Analytics)
async def get_analytics(current_user_id: str = Depends(require_role("admin"))):
    """Get platform analytics"""
    try:
        # TODO: Calculate analytics from Firestore data
        
        # Mock response
        return Analytics(
            total_users=150,
            active_clients=85,
            active_cleaners=25,
            total_bookings=340,
            completed_bookings=298,
            revenue_this_month=7250.0,
            revenue_last_month=6800.0
        )
        
    except Exception as e:
        logger.error(f"Failed to get analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics"
        )


@router.get("/ai-decisions")
async def get_ai_decisions(current_user_id: str = Depends(require_role("admin"))):
    """Get AI agent decisions requiring approval"""
    try:
        # TODO: Get pending AI decisions from Firestore
        
        # Mock response
        return {
            "pending_decisions": [
                {
                    "decision_id": "ai_decision_1",
                    "type": "refund",
                    "description": "Customer requests refund for cancelled booking",
                    "recommendation": "Approve partial refund (80%)",
                    "confidence": 0.85,
                    "created_at": "2024-01-15T10:30:00Z"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get AI decisions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI decisions"
        )