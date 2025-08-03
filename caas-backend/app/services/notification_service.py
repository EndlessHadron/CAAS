from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging
import json

from app.repositories.notification_repository import notification_repository
from app.models.notifications import (
    NotificationCreate, NotificationUpdate, Notification, NotificationResponse,
    NotificationType, NotificationChannel, NotificationStatus, NotificationPriority,
    NotificationContent, NotificationTemplates
)

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for notification management and delivery"""
    
    def __init__(self):
        self.repository = notification_repository
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Dict[str, str]]:
        """Load notification templates"""
        return {
            NotificationTemplates.BOOKING_CONFIRMED: {
                "subject": "Booking Confirmed - {service_type} on {date}",
                "body": "Hi {client_name}, your {service_type} booking for {date} at {time} has been confirmed. Your cleaner is {cleaner_name}.",
                "action_text": "View Booking",
                "action_url": "/bookings/{booking_id}"
            },
            NotificationTemplates.BOOKING_CANCELLED: {
                "subject": "Booking Cancelled - {service_type} on {date}",
                "body": "Hi {client_name}, your {service_type} booking for {date} at {time} has been cancelled. {cancellation_reason}",
                "action_text": "Book Again",
                "action_url": "/book"
            },
            NotificationTemplates.CLEANER_ASSIGNED: {
                "subject": "New Job Assignment - {service_type}",
                "body": "Hi {cleaner_name}, you've been assigned a new {service_type} job for {date} at {time}. Location: {address}",
                "action_text": "View Job Details",
                "action_url": "/jobs/{booking_id}"
            },
            NotificationTemplates.JOB_OFFER: {
                "subject": "New Job Offer - {service_type}",
                "body": "Hi {cleaner_name}, there's a new {service_type} job available for {date} at {time}. Pay: £{amount}",
                "action_text": "Accept Job",
                "action_url": "/jobs/{booking_id}"
            },
            NotificationTemplates.PAYMENT_RECEIVED: {
                "subject": "Payment Received - £{amount}",
                "body": "Hi {client_name}, we've received your payment of £{amount} for booking {booking_id}. Thank you!",
                "action_text": "View Receipt",
                "action_url": "/bookings/{booking_id}/receipt"
            },
            NotificationTemplates.BOOKING_REMINDER: {
                "subject": "Reminder: Cleaning Service Tomorrow",
                "body": "Hi {client_name}, this is a reminder that your {service_type} service is scheduled for tomorrow at {time}.",
                "action_text": "View Booking",
                "action_url": "/bookings/{booking_id}"
            },
            NotificationTemplates.RATING_REQUEST: {
                "subject": "How was your cleaning service?",
                "body": "Hi {client_name}, we hope you're happy with your recent cleaning service. Please take a moment to rate your experience.",
                "action_text": "Rate Service",
                "action_url": "/bookings/{booking_id}/rate"
            },
            NotificationTemplates.WELCOME_CLIENT: {
                "subject": "Welcome to CAAS! Your account is ready",
                "body": "Hi {first_name}, welcome to CAAS! Your account has been created successfully. You can now book professional cleaning services.",
                "action_text": "Book Now",
                "action_url": "/book"
            },
            NotificationTemplates.WELCOME_CLEANER: {
                "subject": "Welcome to CAAS! Start earning today",
                "body": "Hi {first_name}, welcome to CAAS! Your cleaner account is ready. Complete your profile to start receiving job offers.",
                "action_text": "Complete Profile",
                "action_url": "/profile"
            },
            NotificationTemplates.EMAIL_VERIFICATION: {
                "subject": "Verify your email address",
                "body": "Hi {first_name}, please verify your email address to complete your CAAS account setup.",
                "action_text": "Verify Email",
                "action_url": "/verify-email/{token}"
            }
        }
    
    async def create_notification(self, notification_data: NotificationCreate) -> Optional[str]:
        """Create a new notification"""
        try:
            # Create notification object
            notification = Notification(
                user_id=notification_data.user_id,
                type=notification_data.type,
                channel=notification_data.channel,
                priority=notification_data.priority,
                content=NotificationContent(
                    subject=notification_data.subject,
                    body=notification_data.body,
                    action_url=notification_data.action_url,
                    action_text=notification_data.action_text,
                    data=notification_data.data or {},
                    template_id=notification_data.template_id,
                    template_vars=notification_data.template_vars or {}
                ),
                scheduled_for=notification_data.scheduled_for or datetime.utcnow(),
                expires_at=notification_data.expires_at
            )
            
            # Convert to dict for storage
            notification_dict = notification.dict()
            
            notification_id = await self.repository.create_notification(notification_dict)
            
            if notification_id:
                logger.info(f"Created notification {notification_id} for user {notification_data.user_id}")
            
            return notification_id
            
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None
    
    async def create_from_template(self, template_id: str, user_id: str, 
                                 channel: NotificationChannel, 
                                 template_vars: Dict[str, Any],
                                 priority: NotificationPriority = NotificationPriority.NORMAL,
                                 scheduled_for: Optional[datetime] = None) -> Optional[str]:
        """Create notification from template"""
        try:
            template = self.templates.get(template_id)
            if not template:
                logger.error(f"Template {template_id} not found")
                return None
            
            # Replace variables in template
            subject = template["subject"].format(**template_vars)
            body = template["body"].format(**template_vars)
            action_text = template.get("action_text", "").format(**template_vars) if template.get("action_text") else None
            action_url = template.get("action_url", "").format(**template_vars) if template.get("action_url") else None
            
            # Determine notification type based on template
            notification_type = self._get_type_from_template(template_id)
            
            notification_data = NotificationCreate(
                user_id=user_id,
                type=notification_type,
                channel=channel,
                priority=priority,
                subject=subject,
                body=body,
                action_url=action_url,
                action_text=action_text,
                scheduled_for=scheduled_for,
                template_id=template_id,
                template_vars=template_vars
            )
            
            return await self.create_notification(notification_data)
            
        except Exception as e:
            logger.error(f"Error creating notification from template {template_id}: {e}")
            return None
    
    def _get_type_from_template(self, template_id: str) -> NotificationType:
        """Determine notification type from template ID"""
        if "booking" in template_id or "job" in template_id:
            return NotificationType.BOOKING
        elif "payment" in template_id:
            return NotificationType.PAYMENT
        elif "welcome" in template_id or "verification" in template_id:
            return NotificationType.SYSTEM
        elif "reminder" in template_id:
            return NotificationType.REMINDER
        else:
            return NotificationType.SYSTEM
    
    async def send_booking_confirmation(self, user_id: str, booking_data: Dict[str, Any]) -> bool:
        """Send booking confirmation notification"""
        try:
            template_vars = {
                "client_name": booking_data.get("client_name", ""),
                "service_type": booking_data.get("service_type", ""),
                "date": booking_data.get("date", ""),
                "time": booking_data.get("time", ""),
                "cleaner_name": booking_data.get("cleaner_name", "TBD"),
                "booking_id": booking_data.get("booking_id", "")
            }
            
            # Send both push and email notifications
            push_id = await self.create_from_template(
                NotificationTemplates.BOOKING_CONFIRMED,
                user_id,
                NotificationChannel.PUSH,
                template_vars,
                NotificationPriority.HIGH
            )
            
            email_id = await self.create_from_template(
                NotificationTemplates.BOOKING_CONFIRMED,
                user_id,
                NotificationChannel.EMAIL,
                template_vars,
                NotificationPriority.HIGH
            )
            
            return push_id is not None or email_id is not None
            
        except Exception as e:
            logger.error(f"Error sending booking confirmation: {e}")
            return False
    
    async def send_job_offer(self, cleaner_id: str, booking_data: Dict[str, Any]) -> bool:
        """Send job offer notification to cleaner"""
        try:
            template_vars = {
                "cleaner_name": booking_data.get("cleaner_name", ""),
                "service_type": booking_data.get("service_type", ""),
                "date": booking_data.get("date", ""),
                "time": booking_data.get("time", ""),
                "amount": booking_data.get("amount", ""),
                "booking_id": booking_data.get("booking_id", "")
            }
            
            notification_id = await self.create_from_template(
                NotificationTemplates.JOB_OFFER,
                cleaner_id,
                NotificationChannel.PUSH,
                template_vars,
                NotificationPriority.HIGH
            )
            
            return notification_id is not None
            
        except Exception as e:
            logger.error(f"Error sending job offer: {e}")
            return False
    
    async def send_welcome_notification(self, user_id: str, user_role: str, user_name: str) -> bool:
        """Send welcome notification to new user"""
        try:
            template_id = (NotificationTemplates.WELCOME_CLEANER 
                          if user_role == "cleaner" 
                          else NotificationTemplates.WELCOME_CLIENT)
            
            template_vars = {
                "first_name": user_name
            }
            
            notification_id = await self.create_from_template(
                template_id,
                user_id,
                NotificationChannel.EMAIL,
                template_vars,
                NotificationPriority.NORMAL
            )
            
            return notification_id is not None
            
        except Exception as e:
            logger.error(f"Error sending welcome notification: {e}")
            return False
    
    async def send_booking_reminder(self, user_id: str, booking_data: Dict[str, Any]) -> bool:
        """Send booking reminder notification"""
        try:
            # Schedule reminder for 24 hours before booking
            reminder_time = datetime.fromisoformat(booking_data.get("booking_datetime")) - timedelta(hours=24)
            
            template_vars = {
                "client_name": booking_data.get("client_name", ""),
                "service_type": booking_data.get("service_type", ""),
                "time": booking_data.get("time", ""),
                "booking_id": booking_data.get("booking_id", "")
            }
            
            notification_id = await self.create_from_template(
                NotificationTemplates.BOOKING_REMINDER,
                user_id,
                NotificationChannel.PUSH,
                template_vars,
                NotificationPriority.NORMAL,
                scheduled_for=reminder_time
            )
            
            return notification_id is not None
            
        except Exception as e:
            logger.error(f"Error scheduling booking reminder: {e}")
            return False
    
    async def get_user_notifications(self, user_id: str, limit: Optional[int] = None) -> List[NotificationResponse]:
        """Get notifications for a user"""
        try:
            notifications = await self.repository.get_user_notifications(user_id, limit=limit)
            
            return [self._format_notification_response(notif) for notif in notifications]
            
        except Exception as e:
            logger.error(f"Error getting notifications for user {user_id}: {e}")
            return []
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            return await self.repository.mark_as_read(notification_id, user_id)
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False
    
    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read for user"""
        try:
            return await self.repository.mark_all_as_read(user_id)
            
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return False
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        try:
            unread_notifications = await self.repository.get_user_notifications(
                user_id, 
                status=NotificationStatus.SENT
            )
            return len(unread_notifications)
            
        except Exception as e:
            logger.error(f"Error getting unread count: {e}")
            return 0
    
    async def process_pending_notifications(self, limit: int = 100) -> int:
        """Process pending notifications for sending"""
        try:
            pending = await self.repository.get_pending_notifications(limit)
            processed = 0
            
            for notification in pending:
                success = await self._send_notification(notification)
                if success:
                    processed += 1
            
            logger.info(f"Processed {processed} notifications")
            return processed
            
        except Exception as e:
            logger.error(f"Error processing pending notifications: {e}")
            return 0
    
    async def _send_notification(self, notification: Dict[str, Any]) -> bool:
        """Send a single notification"""
        try:
            notification_id = notification.get('notification_id')
            channel = notification.get('channel')
            
            # Simulate sending based on channel
            if channel == NotificationChannel.EMAIL.value:
                success = await self._send_email_notification(notification)
            elif channel == NotificationChannel.PUSH.value:
                success = await self._send_push_notification(notification)
            elif channel == NotificationChannel.SMS.value:
                success = await self._send_sms_notification(notification)
            else:
                success = False
            
            # Update notification status
            if success:
                await self.repository.update_notification_status(
                    notification_id,
                    NotificationStatus.SENT,
                    sent_at=datetime.utcnow()
                )
            else:
                await self.repository.update_notification_status(
                    notification_id,
                    NotificationStatus.FAILED,
                    error_message="Failed to send notification"
                )
                await self.repository.increment_retry_count(notification_id)
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return False
    
    async def _send_email_notification(self, notification: Dict[str, Any]) -> bool:
        """Send email notification (placeholder)"""
        # TODO: Implement actual email sending with Gmail API or SendGrid
        logger.info(f"Sending email notification {notification.get('notification_id')}")
        return True
    
    async def _send_push_notification(self, notification: Dict[str, Any]) -> bool:
        """Send push notification (placeholder)"""
        # TODO: Implement actual push notification with Firebase Cloud Messaging
        logger.info(f"Sending push notification {notification.get('notification_id')}")
        return True
    
    async def _send_sms_notification(self, notification: Dict[str, Any]) -> bool:
        """Send SMS notification (placeholder)"""
        # TODO: Implement actual SMS sending with Twilio
        logger.info(f"Sending SMS notification {notification.get('notification_id')}")
        return True
    
    def _format_notification_response(self, notification_data: Dict[str, Any]) -> NotificationResponse:
        """Format notification data as response model"""
        try:
            content = notification_data.get('content', {})
            
            return NotificationResponse(
                notification_id=notification_data['notification_id'],
                type=NotificationType(notification_data['type']),
                channel=NotificationChannel(notification_data['channel']),
                priority=NotificationPriority(notification_data.get('priority', 'normal')),
                status=NotificationStatus(notification_data['status']),
                content=NotificationContent(**content),
                scheduled_for=notification_data.get('scheduled_for'),
                sent_at=notification_data.get('sent_at'),
                read_at=notification_data.get('read_at'),
                created_at=notification_data['created_at']
            )
            
        except Exception as e:
            logger.error(f"Error formatting notification response: {e}")
            raise


# Global service instance
notification_service = NotificationService()