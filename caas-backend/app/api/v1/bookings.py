from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
import logging

from app.core.security import get_current_user_id, get_current_user_role
from app.services.booking_service import booking_service
from app.services.notification_service import notification_service
from app.models.bookings_simple import BookingCreate, BookingUpdate, BookingResponse, ServiceType, Address
from app.models.users import UserRole

logger = logging.getLogger(__name__)

router = APIRouter()


class BookingCreateRequest(BaseModel):
    service_type: ServiceType = Field(..., description="Type of cleaning service")
    date: str = Field(..., description="Booking date (YYYY-MM-DD)")
    time: str = Field(..., description="Booking time (HH:MM)")
    duration: int = Field(..., description="Duration in hours", ge=1, le=12)
    address: Address = Field(..., description="Service address")
    instructions: Optional[str] = Field(None, description="Access instructions")
    special_requirements: Optional[List[str]] = Field(default_factory=list, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")


class RatingRequest(BaseModel):
    rating: int = Field(..., description="Rating (1-5)", ge=1, le=5)
    review: Optional[str] = Field(None, description="Review text")


@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_request: BookingCreateRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new booking request"""
    try:
        # Parse date and time
        booking_date = date.fromisoformat(booking_request.date)
        booking_time = time.fromisoformat(booking_request.time)
        
        # Create booking data
        booking_create = BookingCreate(
            service_type=booking_request.service_type,
            date=booking_date,
            time=booking_time,
            duration=booking_request.duration,
            address=booking_request.address,
            instructions=booking_request.instructions,
            special_requirements=booking_request.special_requirements,
            notes=booking_request.notes
        )
        
        # Create booking
        booking_id = await booking_service.create_booking(current_user_id, booking_create)
        
        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create booking"
            )
        
        # Get the created booking
        booking = await booking_service.get_booking_by_id(booking_id, current_user_id, UserRole.CLIENT.value)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created booking"
            )
        
        # Send confirmation notification
        await notification_service.send_booking_confirmation(
            current_user_id,
            {
                "client_name": "Client",  # TODO: Get from user service
                "service_type": booking_request.service_type.value,
                "date": booking_request.date,
                "time": booking_request.time,
                "booking_id": booking_id
            }
        )
        
        return booking_service.format_booking_response(booking)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date or time format: {e}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create booking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create booking"
        )


@router.get("", response_model=List[BookingResponse])
async def get_user_bookings(
    current_user_id: str = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role)
):
    """Get user's bookings (client or cleaner)"""
    try:
        bookings = await booking_service.get_user_bookings(current_user_id, current_user_role)
        
        return [booking_service.format_booking_response(booking) for booking in bookings]
        
    except Exception as e:
        logger.error(f"Failed to get bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve bookings"
        )


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user_id: str = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role)
):
    """Get specific booking details"""
    try:
        booking = await booking_service.get_booking_by_id(booking_id, current_user_id, current_user_role)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        return booking_service.format_booking_response(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booking"
        )


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user_id: str = Depends(get_current_user_id),
    current_user_role: str = Depends(get_current_user_role)
):
    """Cancel a booking"""
    try:
        success = await booking_service.cancel_booking(booking_id, current_user_id, current_user_role)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to cancel booking"
            )
        
        return {"message": "Booking cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel booking"
        )


@router.post("/{booking_id}/rate")
async def rate_booking(
    booking_id: str,
    rating_request: RatingRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Add rating and review to completed booking"""
    try:
        success = await booking_service.add_rating_and_review(
            booking_id,
            current_user_id,
            rating_request.rating,
            rating_request.review
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to rate booking"
            )
        
        return {"message": "Rating added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to rate booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add rating"
        )