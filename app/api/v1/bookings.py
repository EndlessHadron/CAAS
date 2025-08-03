from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging

from app.core.security import get_current_user_id, get_current_user_role

logger = logging.getLogger(__name__)

router = APIRouter()


class BookingRequest(BaseModel):
    service_type: str = Field(..., description="regular, deep, move_in")
    date: str = Field(..., description="YYYY-MM-DD")
    time: str = Field(..., description="HH:MM")
    duration: int = Field(..., description="Duration in hours")
    address: dict
    instructions: Optional[str] = None
    recurring: Optional[dict] = None


class BookingResponse(BaseModel):
    booking_id: str
    client_id: str
    cleaner_id: Optional[str] = None
    status: str
    service: dict
    schedule: dict
    location: dict
    payment: dict
    created_at: str
    updated_at: str


@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_request: BookingRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new booking request"""
    try:
        # TODO: Validate availability
        # TODO: Create booking in Firestore
        # TODO: Notify available cleaners
        
        # Mock response
        return BookingResponse(
            booking_id="booking_123",
            client_id=current_user_id,
            cleaner_id=None,
            status="pending",
            service={
                "type": booking_request.service_type,
                "duration": booking_request.duration,
                "price": booking_request.duration * 25  # £25/hour
            },
            schedule={
                "date": booking_request.date,
                "time": booking_request.time,
                "recurring": booking_request.recurring
            },
            location={
                "address": booking_request.address,
                "instructions": booking_request.instructions
            },
            payment={
                "status": "pending",
                "amount": booking_request.duration * 25
            },
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Failed to create booking: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create booking"
        )


@router.get("", response_model=List[BookingResponse])
async def get_user_bookings(
    current_user_id: str = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role)
):
    """Get user's bookings (client or cleaner)"""
    try:
        # TODO: Get bookings from Firestore based on user role
        
        # Mock response
        return [
            BookingResponse(
                booking_id="booking_123",
                client_id=current_user_id if current_user_role == "client" else "client_456",
                cleaner_id=current_user_id if current_user_role == "cleaner" else None,
                status="confirmed",
                service={
                    "type": "regular",
                    "duration": 3,
                    "price": 75
                },
                schedule={
                    "date": "2024-01-15",
                    "time": "10:00"
                },
                location={
                    "address": {
                        "line1": "123 Main St",
                        "city": "London",
                        "postcode": "SW1A 1AA"
                    },
                    "instructions": "Ring the bell twice"
                },
                payment={
                    "status": "pending",
                    "amount": 75
                },
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat()
            )
        ]
        
    except Exception as e:
        logger.error(f"Failed to get bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve bookings"
        )


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get specific booking details"""
    try:
        # TODO: Get booking from Firestore and verify access
        
        # Mock response
        return BookingResponse(
            booking_id=booking_id,
            client_id=current_user_id,
            cleaner_id="cleaner_789",
            status="confirmed",
            service={
                "type": "deep",
                "duration": 4,
                "price": 100
            },
            schedule={
                "date": "2024-01-15",
                "time": "14:00"
            },
            location={
                "address": {
                    "line1": "123 Main St",
                    "city": "London",
                    "postcode": "SW1A 1AA"
                }
            },
            payment={
                "status": "paid",
                "amount": 100
            },
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Failed to get booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Cancel a booking"""
    try:
        # TODO: Update booking status in Firestore
        # TODO: Notify cleaner if assigned
        # TODO: Handle refund logic
        
        return {"message": "Booking cancelled successfully"}
        
    except Exception as e:
        logger.error(f"Failed to cancel booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to cancel booking"
        )