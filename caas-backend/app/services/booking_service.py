from typing import Optional, List, Dict, Any
from datetime import datetime, date, time, timedelta
import logging
import uuid

from app.repositories.booking_repository import booking_repository
from app.repositories.user_repository import user_repository
from app.models.bookings_simple import (
    BookingCreate, BookingUpdate, BookingResponse,
    BookingStatus, ServiceType, PaymentStatus, PaymentMethod
)
from app.models.users import UserRole

logger = logging.getLogger(__name__)


class BookingService:
    """Service for booking-related business logic"""
    
    def __init__(self):
        self.repository = booking_repository
        self.user_repository = user_repository
    
    def _calculate_price(self, service_type: ServiceType, duration: int) -> float:
        """Calculate service price based on type and duration"""
        # Base hourly rates (in GBP)
        rates = {
            ServiceType.REGULAR: 25.0,
            ServiceType.DEEP: 35.0,
            ServiceType.MOVE_IN: 40.0,
            ServiceType.MOVE_OUT: 40.0,
            ServiceType.ONE_TIME: 30.0
        }
        
        base_rate = rates.get(service_type, 25.0)
        
        # Apply duration discounts for longer bookings
        if duration >= 6:
            base_rate *= 0.9  # 10% discount for 6+ hours
        elif duration >= 4:
            base_rate *= 0.95  # 5% discount for 4+ hours
        
        return round(base_rate * duration, 2)
    
    async def create_booking(self, client_id: str, booking_data: BookingCreate) -> Optional[str]:
        """Create a new booking"""
        try:
            # Validate client exists
            client = await self.user_repository.get_by_id(client_id)
            if not client or client.get('role') != UserRole.CLIENT.value:
                logger.warning(f"Invalid client ID for booking: {client_id}")
                return None
            
            # Calculate service price
            price = self._calculate_price(booking_data.service_type, booking_data.duration)
            
            # Create booking document as dictionary
            booking_dict = {
                "booking_id": str(uuid.uuid4()),
                "client_id": client_id,
                "cleaner_id": None,
                "status": BookingStatus.PENDING.value,
                "service": {
                    "type": booking_data.service_type.value,
                    "duration": booking_data.duration,
                    "price": price,
                    "special_requirements": booking_data.special_requirements or []
                },
                "schedule": {
                    "date": booking_data.date.isoformat(),
                    "time": booking_data.time.isoformat(),
                    "timezone": "Europe/London"
                },
                "location": {
                    "address": booking_data.address.dict(),
                    "instructions": booking_data.instructions
                },
                "payment": {
                    "status": PaymentStatus.PENDING.value,
                    "amount": price
                },
                "notes": booking_data.notes,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            booking_id = booking_dict["booking_id"]
            success = await self.repository.create_booking(booking_dict)
            
            if success:
                logger.info(f"Created booking {booking_id} for client {client_id}")
                # TODO: Notify available cleaners
                # TODO: Send confirmation email to client
                return booking_id
            else:
                return None
            
        except Exception as e:
            logger.error(f"Error creating booking for client {client_id}: {e}")
            return None
    
    async def get_booking_by_id(self, booking_id: str, user_id: str, user_role: str) -> Optional[Dict[str, Any]]:
        """Get booking by ID with access control"""
        try:
            booking = await self.repository.get_by_id(booking_id)
            
            if not booking:
                return None
            
            # Check access permissions
            if user_role == UserRole.CLIENT.value and booking.get('client_id') != user_id:
                logger.warning(f"Client {user_id} attempted to access booking {booking_id} not owned by them")
                return None
            elif user_role == UserRole.CLEANER.value and booking.get('cleaner_id') != user_id:
                logger.warning(f"Cleaner {user_id} attempted to access booking {booking_id} not assigned to them")
                return None
            # Admin can access all bookings
            
            return booking
            
        except Exception as e:
            logger.error(f"Error getting booking {booking_id}: {e}")
            return None
    
    async def get_user_bookings(self, user_id: str, user_role: str, status: Optional[BookingStatus] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get bookings for a user (client or cleaner)"""
        try:
            if user_role == UserRole.CLIENT.value:
                bookings = await self.repository.get_bookings_by_client(user_id, status, limit)
            elif user_role == UserRole.CLEANER.value:
                bookings = await self.repository.get_bookings_by_cleaner(user_id, status, limit)
            else:
                # Admin gets all bookings
                search_params = {'limit': limit or 50}
                if status:
                    search_params['status'] = status.value
                bookings = await self.repository.search_bookings(search_params)
            
            return bookings
            
        except Exception as e:
            logger.error(f"Error getting bookings for user {user_id}: {e}")
            return []
    
    async def update_booking(self, booking_id: str, user_id: str, user_role: str, update_data: BookingUpdate) -> bool:
        """Update booking details"""
        try:
            # Get current booking and verify access
            booking = await self.get_booking_by_id(booking_id, user_id, user_role)
            if not booking:
                return False
            
            # Only allow updates for pending bookings
            if booking.get('status') != BookingStatus.PENDING.value:
                logger.warning(f"Attempted to update non-pending booking {booking_id}")
                return False
            
            # Prepare update data
            update_dict = update_data.dict(exclude_none=True)
            
            # Handle date/time updates
            if 'date' in update_dict or 'time' in update_dict:
                current_schedule = booking.get('schedule', {})
                if 'date' in update_dict:
                    current_schedule['date'] = update_dict['date'].isoformat()
                if 'time' in update_dict:
                    current_schedule['time'] = update_dict['time'].isoformat()
                update_dict['schedule'] = current_schedule
                
                # Remove individual date/time fields
                update_dict.pop('date', None)
                update_dict.pop('time', None)
            
            # Handle duration update (recalculate price)
            if 'duration' in update_dict:
                current_service = booking.get('service', {})
                service_type = ServiceType(current_service.get('type'))
                new_price = self._calculate_price(service_type, update_dict['duration'])
                
                current_service['duration'] = update_dict['duration']
                current_service['price'] = new_price
                update_dict['service'] = current_service
                
                # Update payment amount
                current_payment = booking.get('payment', {})
                current_payment['amount'] = new_price
                update_dict['payment'] = current_payment
                
                # Remove duration from top-level
                update_dict.pop('duration', None)
            
            success = await self.repository.update(booking_id, update_dict)
            
            if success:
                logger.info(f"Updated booking {booking_id}")
                # TODO: Notify cleaner if assigned
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating booking {booking_id}: {e}")
            return False
    
    async def cancel_booking(self, booking_id: str, user_id: str, user_role: str, reason: Optional[str] = None) -> bool:
        """Cancel a booking"""
        try:
            booking = await self.get_booking_by_id(booking_id, user_id, user_role)
            if not booking:
                return False
            
            current_status = BookingStatus(booking.get('status'))
            
            # Can't cancel already completed or cancelled bookings
            if current_status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
                return False
            
            # Determine cancellation status based on who's cancelling
            if user_role == UserRole.CLIENT.value:
                new_status = BookingStatus.CANCELLED_BY_CLIENT
            elif user_role == UserRole.CLEANER.value:
                new_status = BookingStatus.CANCELLED_BY_CLEANER
            else:
                new_status = BookingStatus.CANCELLED
            
            success = await self.repository.update_booking_status(booking_id, new_status)
            
            if success:
                logger.info(f"Cancelled booking {booking_id} by {user_role} {user_id}")
                # TODO: Send cancellation notifications
                # TODO: Handle refund logic
            
            return success
            
        except Exception as e:
            logger.error(f"Error cancelling booking {booking_id}: {e}")
            return False
    
    async def assign_cleaner_to_booking(self, booking_id: str, cleaner_id: str) -> bool:
        """Assign a cleaner to a pending booking"""
        try:
            # Validate cleaner exists and has correct role
            cleaner = await self.user_repository.get_by_id(cleaner_id)
            if not cleaner or cleaner.get('role') != UserRole.CLEANER.value:
                logger.warning(f"Invalid cleaner ID for assignment: {cleaner_id}")
                return False
            
            # Get booking and validate it's pending
            booking = await self.repository.get_by_id(booking_id)
            if not booking or booking.get('status') != BookingStatus.PENDING.value:
                logger.warning(f"Cannot assign cleaner to non-pending booking {booking_id}")
                return False
            
            success = await self.repository.assign_cleaner(booking_id, cleaner_id)
            
            if success:
                logger.info(f"Assigned cleaner {cleaner_id} to booking {booking_id}")
                # TODO: Send confirmation to client and cleaner
            
            return success
            
        except Exception as e:
            logger.error(f"Error assigning cleaner {cleaner_id} to booking {booking_id}: {e}")
            return False
    
    async def get_available_jobs(self, cleaner_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get available job offers for a cleaner"""
        try:
            # Get pending bookings
            pending_bookings = await self.repository.get_pending_bookings(limit)
            
            # TODO: Filter by cleaner location/preferences
            # TODO: Add distance calculations
            # For now, return all pending bookings
            
            return pending_bookings
            
        except Exception as e:
            logger.error(f"Error getting available jobs for cleaner {cleaner_id}: {e}")
            return []
    
    async def accept_job_offer(self, booking_id: str, cleaner_id: str) -> bool:
        """Accept a job offer (cleaner accepts booking)"""
        return await self.assign_cleaner_to_booking(booking_id, cleaner_id)
    
    async def complete_booking(self, booking_id: str, cleaner_id: str) -> bool:
        """Mark booking as completed"""
        try:
            booking = await self.repository.get_by_id(booking_id)
            if not booking:
                return False
            
            # Verify cleaner is assigned to this booking
            if booking.get('cleaner_id') != cleaner_id:
                logger.warning(f"Cleaner {cleaner_id} attempted to complete booking {booking_id} not assigned to them")
                return False
            
            # Only in-progress bookings can be completed
            if booking.get('status') != BookingStatus.IN_PROGRESS.value:
                logger.warning(f"Cannot complete booking {booking_id} with status {booking.get('status')}")
                return False
            
            success = await self.repository.update_booking_status(
                booking_id, 
                BookingStatus.COMPLETED, 
                datetime.utcnow()
            )
            
            if success:
                logger.info(f"Completed booking {booking_id}")
                # TODO: Send completion notification to client
                # TODO: Request rating/review
            
            return success
            
        except Exception as e:
            logger.error(f"Error completing booking {booking_id}: {e}")
            return False
    
    async def add_rating_and_review(self, booking_id: str, client_id: str, rating: int, review: Optional[str] = None) -> bool:
        """Add client rating and review"""
        try:
            booking = await self.repository.get_by_id(booking_id)
            if not booking:
                return False
            
            # Verify client owns this booking
            if booking.get('client_id') != client_id:
                return False
            
            # Only completed bookings can be rated
            if booking.get('status') != BookingStatus.COMPLETED.value:
                return False
            
            success = await self.repository.add_rating_review(booking_id, rating, review)
            
            if success:
                logger.info(f"Added rating {rating} to booking {booking_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error adding rating to booking {booking_id}: {e}")
            return False
    
    async def get_booking_statistics(self, user_id: Optional[str] = None, user_role: Optional[str] = None) -> Dict[str, Any]:
        """Get booking statistics"""
        try:
            if user_role == UserRole.CLIENT.value:
                return await self.repository.get_booking_stats(client_id=user_id)
            elif user_role == UserRole.CLEANER.value:
                return await self.repository.get_booking_stats(cleaner_id=user_id)
            else:
                # Admin gets overall stats
                return await self.repository.get_booking_stats()
                
        except Exception as e:
            logger.error(f"Error getting booking statistics: {e}")
            return {}
    
    def format_booking_response(self, booking_data: Dict[str, Any]) -> BookingResponse:
        """Format booking data as BookingResponse model"""
        try:
            # Convert string dates back to date/time objects if needed
            schedule = booking_data.get('schedule', {})
            if isinstance(schedule.get('date'), str):
                schedule['date'] = datetime.fromisoformat(schedule['date']).date()
            if isinstance(schedule.get('time'), str):
                schedule['time'] = datetime.fromisoformat(schedule['time']).time()
            
            return BookingResponse(**booking_data)
            
        except Exception as e:
            logger.error(f"Error formatting booking response: {e}")
            raise


# Global service instance
booking_service = BookingService()