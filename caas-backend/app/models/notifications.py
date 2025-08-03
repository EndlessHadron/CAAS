from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid


class NotificationType(str, Enum):
    BOOKING = "booking"
    PAYMENT = "payment"
    SYSTEM = "system"
    MARKETING = "marketing"
    REMINDER = "reminder"
    EMERGENCY = "emergency"


class NotificationChannel(str, Enum):
    PUSH = "push"
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationContent(BaseModel):
    subject: str = Field(..., description="Notification subject/title")
    body: str = Field(..., description="Notification body/message")
    action_url: Optional[str] = Field(None, description="Deep link or URL for action")
    action_text: Optional[str] = Field(None, description="Text for action button")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional data")
    template_id: Optional[str] = Field(None, description="Template identifier")
    template_vars: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Template variables")


class Notification(BaseModel):
    notification_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique notification ID")
    user_id: str = Field(..., description="Target user ID")
    type: NotificationType = Field(..., description="Notification type")
    channel: NotificationChannel = Field(..., description="Delivery channel")
    priority: NotificationPriority = Field(default=NotificationPriority.NORMAL, description="Notification priority")
    status: NotificationStatus = Field(default=NotificationStatus.PENDING, description="Notification status")
    content: NotificationContent = Field(..., description="Notification content")
    scheduled_for: Optional[datetime] = Field(None, description="Scheduled delivery time")
    sent_at: Optional[datetime] = Field(None, description="Actual send time")
    delivered_at: Optional[datetime] = Field(None, description="Delivery confirmation time")
    read_at: Optional[datetime] = Field(None, description="Read time")
    expires_at: Optional[datetime] = Field(None, description="Expiration time")
    retry_count: int = Field(default=0, description="Number of retry attempts")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        use_enum_values = True


class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority = NotificationPriority.NORMAL
    subject: str
    body: str
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    scheduled_for: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    template_id: Optional[str] = None
    template_vars: Optional[Dict[str, Any]] = None


class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: Optional[int] = None


class NotificationResponse(BaseModel):
    notification_id: str
    type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority
    status: NotificationStatus
    content: NotificationContent
    scheduled_for: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime


class NotificationPreferences(BaseModel):
    user_id: str
    email_enabled: bool = Field(default=True, description="Enable email notifications")
    push_enabled: bool = Field(default=True, description="Enable push notifications")
    sms_enabled: bool = Field(default=False, description="Enable SMS notifications")
    marketing_enabled: bool = Field(default=True, description="Enable marketing notifications")
    booking_notifications: bool = Field(default=True, description="Booking-related notifications")
    payment_notifications: bool = Field(default=True, description="Payment-related notifications")
    reminder_notifications: bool = Field(default=True, description="Reminder notifications")
    quiet_hours_start: Optional[str] = Field(None, description="Quiet hours start time (HH:MM)")
    quiet_hours_end: Optional[str] = Field(None, description="Quiet hours end time (HH:MM)")
    timezone: str = Field(default="Europe/London", description="User timezone")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationBatch(BaseModel):
    """For sending bulk notifications"""
    batch_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_ids: List[str] = Field(..., description="List of target user IDs")
    type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority = NotificationPriority.NORMAL
    content: NotificationContent
    scheduled_for: Optional[datetime] = None
    filter_preferences: bool = Field(default=True, description="Respect user notification preferences")


class NotificationTemplate(BaseModel):
    """Email/notification templates"""
    template_id: str
    name: str
    type: NotificationType
    channel: NotificationChannel
    subject_template: str
    body_template: str
    variables: List[str] = Field(default_factory=list, description="Required template variables")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Predefined notification templates
class NotificationTemplates:
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_CANCELLED = "booking_cancelled"
    BOOKING_REMINDER = "booking_reminder"
    CLEANER_ASSIGNED = "cleaner_assigned"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    WELCOME_CLIENT = "welcome_client"
    WELCOME_CLEANER = "welcome_cleaner"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    JOB_OFFER = "job_offer"
    JOB_CANCELLED = "job_cancelled"
    RATING_REQUEST = "rating_request"


class NotificationStats(BaseModel):
    """Notification statistics"""
    total_sent: int = 0
    total_delivered: int = 0
    total_read: int = 0
    total_failed: int = 0
    by_channel: Dict[str, int] = Field(default_factory=dict)
    by_type: Dict[str, int] = Field(default_factory=dict)
    delivery_rate: float = 0.0
    read_rate: float = 0.0