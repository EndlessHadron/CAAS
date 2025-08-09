from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.core.security import get_current_user_id
from app.core.database import FirestoreCollections
import uuid
from datetime import datetime

router = APIRouter()

class SimpleBookingRequest(BaseModel):
    service_type: str
    date: str
    time: str  
    duration: int
    address: dict
    instructions: Optional[str] = None
    special_requirements: Optional[List[str]] = None
    notes: Optional[str] = None
    preferred_cleaner_id: Optional[str] = None

@router.post("")
async def create_simple_booking(
    booking_request: SimpleBookingRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a simple booking (production implementation)"""
    try:
        from app.core.database import get_firestore_client
        
        booking_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        # Calculate price (simple calculation)
        base_rates = {
            "regular": 25.0,
            "deep": 35.0,
            "move_in": 40.0,
            "move_out": 40.0,
            "one_time": 30.0
        }
        rate = base_rates.get(booking_request.service_type.lower(), 25.0)
        total_price = rate * booking_request.duration
        
        # Create booking document
        booking_data = {
            "booking_id": booking_id,
            "client_id": current_user_id,
            "cleaner_id": None,
            "status": "pending",
            "service": {
                "type": booking_request.service_type,
                "duration": booking_request.duration,
                "price": total_price,
                "currency": "GBP"
            },
            "schedule": {
                "date": booking_request.date,
                "time": booking_request.time,
                "timezone": "Europe/London"
            },
            "location": {
                "address": booking_request.address,
                "instructions": booking_request.instructions or "",
                "special_requirements": booking_request.special_requirements or []
            },
            "payment": {
                "status": "pending",
                "total": total_price,
                "currency": "GBP",
                "method": None
            },
            "notes": booking_request.notes or "",
            "preferred_cleaner_id": booking_request.preferred_cleaner_id,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Save to Firestore
        db = get_firestore_client()
        booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(booking_id)
        booking_ref.set(booking_data)
        
        return {
            "booking_id": booking_id,
            "status": "pending",
            "service_type": booking_request.service_type,
            "date": booking_request.date,
            "time": booking_request.time,
            "duration": booking_request.duration,
            "total_price": total_price,
            "address": booking_request.address,
            "client_id": current_user_id,
            "created_at": current_time.isoformat(),
            "message": "Booking created successfully! We'll find a cleaner for you."
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to create booking")

@router.get("")
async def get_user_bookings(current_user_id: str = Depends(get_current_user_id)):
    """Get user bookings"""
    try:
        from app.core.database import get_firestore_client
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Getting bookings for user: {current_user_id}")
        
        db = get_firestore_client()
        
        # Query bookings for this user
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        query = bookings_ref.where('client_id', '==', current_user_id)
        docs = query.stream()
        
        bookings = []
        doc_count = 0
        for doc in docs:
            doc_count += 1
            booking_data = doc.to_dict()
            logger.info(f"Found booking document {doc.id}: {booking_data}")
            if booking_data:
                # Format booking for response - keep nested structure for frontend compatibility
                formatted_booking = {
                    "booking_id": booking_data.get("booking_id"),
                    "status": booking_data.get("status"),
                    "service": booking_data.get("service", {
                        "type": "Regular Cleaning",
                        "duration": 2,
                        "price": 50.0
                    }),
                    "schedule": booking_data.get("schedule", {
                        "date": datetime.utcnow().isoformat(),
                        "time": "10:00",
                        "timezone": "Europe/London"
                    }),
                    "location": booking_data.get("location", {
                        "address": {
                            "line1": "Address not specified",
                            "city": "London",
                            "postcode": "SW1"
                        }
                    }),
                    "cleaner": {
                        "name": "Cleaner TBD",
                        "rating": None
                    } if booking_data.get("cleaner_id") else None,
                    "created_at": booking_data.get("created_at").isoformat() if booking_data.get("created_at") else None,
                    "notes": booking_data.get("notes")
                }
                bookings.append(formatted_booking)
        
        logger.info(f"Found {doc_count} documents, returning {len(bookings)} formatted bookings")
        return bookings
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get bookings for user {current_user_id}: {e}")
        return []

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Cancel a booking"""
    try:
        from app.core.database import get_firestore_client
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Cancelling booking {booking_id} for user {current_user_id}")
        
        db = get_firestore_client()
        
        # Find the booking by booking_id and verify ownership
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        query = bookings_ref.where('booking_id', '==', booking_id).where('client_id', '==', current_user_id)
        docs = list(query.stream())
        
        if not docs:
            logger.warning(f"Booking {booking_id} not found for user {current_user_id}")
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking_doc = docs[0]
        booking_data = booking_doc.to_dict()
        
        # Check if booking can be cancelled
        current_status = booking_data.get("status")
        if current_status in ["cancelled", "completed"]:
            logger.warning(f"Cannot cancel booking {booking_id} with status {current_status}")
            raise HTTPException(status_code=400, detail=f"Cannot cancel booking with status: {current_status}")
        
        # Update booking status to cancelled
        current_time = datetime.utcnow()
        booking_doc.reference.update({
            "status": "cancelled",
            "updated_at": current_time,
            "cancelled_at": current_time
        })
        
        logger.info(f"Successfully cancelled booking {booking_id}")
        
        return {"message": "Booking cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to cancel booking {booking_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel booking")