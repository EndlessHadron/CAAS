from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.core.security import get_current_user_id, require_role

logger = logging.getLogger(__name__)

router = APIRouter()


class JobOffer(BaseModel):
    booking_id: str
    client_name: str
    service_type: str
    date: str
    time: str
    duration: int
    address: dict
    payment: float
    instructions: Optional[str] = None


class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0-6 (Monday=0)
    start_time: str   # HH:MM
    end_time: str     # HH:MM


class UpdateAvailability(BaseModel):
    availability: List[AvailabilitySlot]
    blocked_dates: Optional[List[str]] = []  # YYYY-MM-DD format
    max_bookings_per_day: Optional[int] = 3


@router.get("/jobs", response_model=List[JobOffer])
async def get_available_jobs(current_user_id: str = Depends(require_role("cleaner"))):
    """Get available job offers for cleaner"""
    try:
        # TODO: Get pending bookings from Firestore
        # TODO: Filter by location/preferences
        
        # Mock response
        return [
            JobOffer(
                booking_id="booking_123",
                client_name="John D.",
                service_type="regular",
                date="2024-01-15",
                time="10:00",
                duration=3,
                address={
                    "line1": "123 Main St",
                    "city": "London",
                    "postcode": "SW1A 1AA"
                },
                payment=75.0,
                instructions="Ring the bell twice"
            ),
            JobOffer(
                booking_id="booking_124",
                client_name="Sarah M.",
                service_type="deep",
                date="2024-01-16",
                time="14:00",
                duration=4,
                address={
                    "line1": "456 Oak Ave",
                    "city": "London",
                    "postcode": "SW2B 2BB"
                },
                payment=100.0
            )
        ]
        
    except Exception as e:
        logger.error(f"Failed to get available jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job offers"
        )


@router.post("/jobs/{booking_id}/accept")
async def accept_job(
    booking_id: str,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Accept a job offer"""
    try:
        # TODO: Update booking in Firestore
        # TODO: Notify client
        # TODO: Block time slot in availability
        
        return {"message": "Job accepted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to accept job {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to accept job offer"
        )


@router.post("/jobs/{booking_id}/reject")
async def reject_job(
    booking_id: str,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Reject a job offer"""
    try:
        # TODO: Log rejection in Firestore
        # TODO: Remove from cleaner's available jobs
        
        return {"message": "Job rejected"}
        
    except Exception as e:
        logger.error(f"Failed to reject job {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reject job offer"
        )


@router.put("/availability")
async def update_availability(
    availability_data: UpdateAvailability,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Update cleaner availability"""
    try:
        # TODO: Update availability in Firestore
        
        return {"message": "Availability updated successfully"}
        
    except Exception as e:
        logger.error(f"Failed to update availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update availability"
        )


@router.get("/earnings")
async def get_earnings(
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Get cleaner earnings summary"""
    try:
        # TODO: Calculate earnings from completed bookings
        
        # Mock response
        return {
            "total_earnings": 1250.0,
            "this_month": 450.0,
            "last_month": 380.0,
            "pending_payments": 125.0,
            "completed_jobs": 18,
            "average_rating": 4.8
        }
        
    except Exception as e:
        logger.error(f"Failed to get earnings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve earnings"
        )