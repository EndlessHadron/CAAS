from typing import Optional, List, Dict, Any
from datetime import datetime, date
import logging

from app.repositories.base import BaseRepository
from app.core.database import FirestoreCollections
from app.models.bookings_simple import BookingStatus, ServiceType

logger = logging.getLogger(__name__)


class BookingRepository(BaseRepository):
    """Repository for booking operations"""
    
    def __init__(self):
        super().__init__(FirestoreCollections.BOOKINGS)
    
    async def create_booking(self, booking_data: Dict[str, Any]) -> Optional[str]:
        """Create a new booking"""
        booking_id = booking_data.get('booking_id')
        if not booking_id:
            return None
        
        success = await self.create(booking_id, booking_data)
        return booking_id if success else None
    
    async def get_bookings_by_client(self, client_id: str, status: Optional[BookingStatus] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get bookings for a specific client"""
        try:
            if status:
                # Get bookings with specific status
                query = self.collection.where('client_id', '==', client_id).where('status', '==', status.value)
            else:
                # Get all bookings for client
                query = self.collection.where('client_id', '==', client_id)
            
            if limit:
                query = query.limit(limit)
            
            # Order by creation date, newest first
            query = query.order_by('created_at', direction='DESCENDING')
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get bookings for client {client_id}: {e}")
            return []
    
    async def get_bookings_by_cleaner(self, cleaner_id: str, status: Optional[BookingStatus] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get bookings assigned to a specific cleaner"""
        try:
            if status:
                query = self.collection.where('cleaner_id', '==', cleaner_id).where('status', '==', status.value)
            else:
                query = self.collection.where('cleaner_id', '==', cleaner_id)
            
            if limit:
                query = query.limit(limit)
            
            query = query.order_by('created_at', direction='DESCENDING')
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get bookings for cleaner {cleaner_id}: {e}")
            return []
    
    async def get_pending_bookings(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all pending bookings (for cleaner assignment)"""
        try:
            query = self.collection.where('status', '==', BookingStatus.PENDING.value)
            
            if limit:
                query = query.limit(limit)
            
            query = query.order_by('created_at', direction='ASCENDING')
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get pending bookings: {e}")
            return []
    
    async def get_bookings_by_date_range(self, start_date: date, end_date: date, cleaner_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get bookings within a date range"""
        try:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())
            
            query = self.collection.where('schedule.date', '>=', start_datetime).where('schedule.date', '<=', end_datetime)
            
            if cleaner_id:
                query = query.where('cleaner_id', '==', cleaner_id)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get bookings by date range: {e}")
            return []
    
    async def assign_cleaner(self, booking_id: str, cleaner_id: str) -> bool:
        """Assign a cleaner to a booking"""
        try:
            update_data = {
                'cleaner_id': cleaner_id,
                'status': BookingStatus.CONFIRMED.value,
                'updated_at': datetime.utcnow()
            }
            
            return await self.update(booking_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to assign cleaner {cleaner_id} to booking {booking_id}: {e}")
            return False
    
    async def update_booking_status(self, booking_id: str, status: BookingStatus, completed_at: Optional[datetime] = None) -> bool:
        """Update booking status"""
        try:
            update_data = {
                'status': status.value,
                'updated_at': datetime.utcnow()
            }
            
            if status == BookingStatus.COMPLETED and completed_at:
                update_data['completed_at'] = completed_at
            
            return await self.update(booking_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to update booking {booking_id} status to {status}: {e}")
            return False
    
    async def update_payment_status(self, booking_id: str, payment_data: Dict[str, Any]) -> bool:
        """Update payment information"""
        try:
            current_booking = await self.get_by_id(booking_id)
            if not current_booking:
                return False
            
            payment = current_booking.get('payment', {})
            payment.update(payment_data)
            payment['updated_at'] = datetime.utcnow()
            
            return await self.update(booking_id, {'payment': payment})
            
        except Exception as e:
            logger.error(f"Failed to update payment for booking {booking_id}: {e}")
            return False
    
    async def add_rating_review(self, booking_id: str, rating: int, review: Optional[str] = None) -> bool:
        """Add client rating and review"""
        try:
            update_data = {
                'rating': rating,
                'updated_at': datetime.utcnow()
            }
            
            if review:
                update_data['review'] = review
            
            return await self.update(booking_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to add rating/review for booking {booking_id}: {e}")
            return False
    
    async def get_booking_stats(self, client_id: Optional[str] = None, cleaner_id: Optional[str] = None) -> Dict[str, Any]:
        """Get booking statistics"""
        try:
            query = self.collection
            
            if client_id:
                query = query.where('client_id', '==', client_id)
            elif cleaner_id:
                query = query.where('cleaner_id', '==', cleaner_id)
            
            docs = list(query.stream())
            
            stats = {
                'total_bookings': len(docs),
                'pending': 0,
                'confirmed': 0,
                'in_progress': 0,
                'completed': 0,
                'cancelled': 0,
                'total_revenue': 0.0,
                'average_rating': 0.0
            }
            
            total_rating = 0
            rating_count = 0
            
            for doc in docs:
                data = doc.to_dict()
                status = data.get('status', '')
                
                if status in stats:
                    stats[status] += 1
                
                # Calculate revenue (only for completed bookings)
                if status == BookingStatus.COMPLETED.value:
                    payment = data.get('payment', {})
                    amount = payment.get('amount', 0)
                    stats['total_revenue'] += amount
                
                # Calculate average rating
                rating = data.get('rating')
                if rating:
                    total_rating += rating
                    rating_count += 1
            
            if rating_count > 0:
                stats['average_rating'] = round(total_rating / rating_count, 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get booking stats: {e}")
            return {}
    
    async def search_bookings(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search bookings with multiple criteria"""
        try:
            query = self.collection
            
            # Add filters based on search parameters
            if 'client_id' in search_params:
                query = query.where('client_id', '==', search_params['client_id'])
            
            if 'cleaner_id' in search_params:
                query = query.where('cleaner_id', '==', search_params['cleaner_id'])
            
            if 'status' in search_params:
                query = query.where('status', '==', search_params['status'])
            
            if 'service_type' in search_params:
                query = query.where('service.type', '==', search_params['service_type'])
            
            # Add date range if specified
            if 'start_date' in search_params and 'end_date' in search_params:
                start_datetime = datetime.combine(search_params['start_date'], datetime.min.time())
                end_datetime = datetime.combine(search_params['end_date'], datetime.max.time())
                query = query.where('schedule.date', '>=', start_datetime).where('schedule.date', '<=', end_datetime)
            
            # Limit results
            limit = search_params.get('limit', 50)
            query = query.limit(limit)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search bookings: {e}")
            return []


# Global repository instance
booking_repository = BookingRepository()