from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging

from app.repositories.base import BaseRepository
from app.core.database import FirestoreCollections
from app.models.notifications import NotificationStatus, NotificationType, NotificationChannel

logger = logging.getLogger(__name__)


class NotificationRepository(BaseRepository):
    """Repository for notification operations"""
    
    def __init__(self):
        super().__init__(FirestoreCollections.NOTIFICATIONS)
    
    async def create_notification(self, notification_data: Dict[str, Any]) -> Optional[str]:
        """Create a new notification"""
        notification_id = notification_data.get('notification_id')
        if not notification_id:
            return None
        
        success = await self.create(notification_id, notification_data)
        return notification_id if success else None
    
    async def get_user_notifications(self, user_id: str, status: Optional[NotificationStatus] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get notifications for a specific user"""
        try:
            query = self.collection.where('user_id', '==', user_id)
            
            if status:
                query = query.where('status', '==', status.value)
            
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
            logger.error(f"Failed to get notifications for user {user_id}: {e}")
            return []
    
    async def get_pending_notifications(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get notifications pending to be sent"""
        try:
            now = datetime.utcnow()
            
            query = self.collection.where('status', '==', NotificationStatus.PENDING.value)
            
            # Include notifications scheduled for now or past
            query = query.where('scheduled_for', '<=', now)
            
            if limit:
                query = query.limit(limit)
            
            # Order by scheduled time, oldest first
            query = query.order_by('scheduled_for', direction='ASCENDING')
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get pending notifications: {e}")
            return []
    
    async def get_failed_notifications_for_retry(self, max_retries: int = 3) -> List[Dict[str, Any]]:
        """Get failed notifications that can be retried"""
        try:
            query = self.collection.where('status', '==', NotificationStatus.FAILED.value)
            query = query.where('retry_count', '<', max_retries)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get failed notifications for retry: {e}")
            return []
    
    async def update_notification_status(self, notification_id: str, status: NotificationStatus, 
                                       sent_at: Optional[datetime] = None, 
                                       delivered_at: Optional[datetime] = None,
                                       read_at: Optional[datetime] = None,
                                       error_message: Optional[str] = None) -> bool:
        """Update notification status"""
        try:
            update_data = {
                'status': status.value,
                'updated_at': datetime.utcnow()
            }
            
            if sent_at:
                update_data['sent_at'] = sent_at
            if delivered_at:
                update_data['delivered_at'] = delivered_at
            if read_at:
                update_data['read_at'] = read_at
            if error_message:
                update_data['error_message'] = error_message
            
            return await self.update(notification_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to update notification {notification_id} status: {e}")
            return False
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read by user"""
        try:
            # Verify notification belongs to user
            notification = await self.get_by_id(notification_id)
            if not notification or notification.get('user_id') != user_id:
                return False
            
            return await self.update_notification_status(
                notification_id,
                NotificationStatus.READ,
                read_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Failed to mark notification {notification_id} as read: {e}")
            return False
    
    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user"""
        try:
            # Get all unread notifications for user
            unread_notifications = await self.get_user_notifications(
                user_id, 
                status=NotificationStatus.SENT
            )
            
            batch = self.batch_operation()
            read_time = datetime.utcnow()
            
            for notification in unread_notifications:
                doc_ref = self.collection.document(notification['notification_id'])
                batch.update(doc_ref, {
                    'status': NotificationStatus.READ.value,
                    'read_at': read_time,
                    'updated_at': read_time
                })
            
            batch.commit()
            logger.info(f"Marked {len(unread_notifications)} notifications as read for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to mark all notifications as read for user {user_id}: {e}")
            return False
    
    async def delete_old_notifications(self, days_old: int = 30) -> int:
        """Delete notifications older than specified days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            query = self.collection.where('created_at', '<', cutoff_date)
            docs = list(query.stream())
            
            if not docs:
                return 0
            
            batch = self.batch_operation()
            
            for doc in docs:
                batch.delete(doc.reference)
            
            batch.commit()
            
            logger.info(f"Deleted {len(docs)} old notifications")
            return len(docs)
            
        except Exception as e:
            logger.error(f"Failed to delete old notifications: {e}")
            return 0
    
    async def get_notification_stats(self, user_id: Optional[str] = None, 
                                   days: int = 30) -> Dict[str, Any]:
        """Get notification statistics"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            query = self.collection.where('created_at', '>=', cutoff_date)
            
            if user_id:
                query = query.where('user_id', '==', user_id)
            
            docs = list(query.stream())
            
            stats = {
                'total_notifications': len(docs),
                'pending': 0,
                'sent': 0,
                'delivered': 0,
                'failed': 0,
                'read': 0,
                'by_type': {},
                'by_channel': {},
                'delivery_rate': 0.0,
                'read_rate': 0.0
            }
            
            for doc in docs:
                data = doc.to_dict()
                status = data.get('status', '')
                notification_type = data.get('type', '')
                channel = data.get('channel', '')
                
                # Count by status
                if status in stats:
                    stats[status] += 1
                
                # Count by type
                if notification_type:
                    stats['by_type'][notification_type] = stats['by_type'].get(notification_type, 0) + 1
                
                # Count by channel
                if channel:
                    stats['by_channel'][channel] = stats['by_channel'].get(channel, 0) + 1
            
            # Calculate rates
            total_sent = stats['sent'] + stats['delivered'] + stats['read']
            if total_sent > 0:
                stats['delivery_rate'] = round((stats['delivered'] + stats['read']) / total_sent * 100, 2)
                stats['read_rate'] = round(stats['read'] / total_sent * 100, 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get notification stats: {e}")
            return {}
    
    async def get_notifications_by_type(self, notification_type: NotificationType, 
                                      status: Optional[NotificationStatus] = None,
                                      limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get notifications by type"""
        try:
            query = self.collection.where('type', '==', notification_type.value)
            
            if status:
                query = query.where('status', '==', status.value)
            
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
            logger.error(f"Failed to get notifications by type {notification_type}: {e}")
            return []
    
    async def increment_retry_count(self, notification_id: str) -> bool:
        """Increment retry count for a failed notification"""
        try:
            notification = await self.get_by_id(notification_id)
            if not notification:
                return False
            
            retry_count = notification.get('retry_count', 0) + 1
            
            return await self.update(notification_id, {
                'retry_count': retry_count,
                'updated_at': datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Failed to increment retry count for notification {notification_id}: {e}")
            return False


# Global repository instance
notification_repository = NotificationRepository()