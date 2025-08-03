from __future__ import annotations
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List
from datetime import datetime, date, time
from enum import Enum
import uuid


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    CANCELLED_BY_CLIENT = "cancelled_by_client"
    CANCELLED_BY_CLEANER = "cancelled_by_cleaner"


class ServiceType(str, Enum):
    REGULAR = "regular"
    DEEP = "deep"
    MOVE_IN = "move_in"
    MOVE_OUT = "move_out"
    ONE_TIME = "one_time"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    CASH = "cash"
    PAYPAL = "paypal"


class RecurringFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class Address(BaseModel):
    line1: str = Field(..., description="Address line 1")
    line2: Optional[str] = Field(None, description="Address line 2")
    city: str = Field(..., description="City")
    postcode: str = Field(..., description="UK postcode")
    country: str = Field(default="UK", description="Country")


class ServiceDetails(BaseModel):
    type: ServiceType = Field(..., description="Type of cleaning service")
    duration: int = Field(..., description="Duration in hours", ge=1, le=12)
    price: float = Field(..., description="Service price in GBP", ge=0)
    description: Optional[str] = Field(None, description="Additional service details")
    special_requirements: Optional[List[str]] = Field(default_factory=list, description="Special requirements")


class RecurringSchedule(BaseModel):
    enabled: bool = Field(default=False, description="Whether booking is recurring")
    frequency: Optional[RecurringFrequency] = Field(None, description="Frequency of recurring booking")
    end_date: Optional[date] = Field(None, description="End date for recurring bookings")
    next_booking_date: Optional[date] = Field(None, description="Next scheduled booking date")


class Schedule(BaseModel):
    date: date = Field(..., description="Booking date")
    time: time = Field(..., description="Booking time")
    timezone: str = Field(default="Europe/London", description="Timezone")
    recurring: Optional[Dict] = Field(default=None, description="Recurring schedule")


class Location(BaseModel):
    address: Address = Field(..., description="Service address")
    instructions: Optional[str] = Field(None, description="Access instructions")
    parking_info: Optional[str] = Field(None, description="Parking information")
    key_collection: Optional[str] = Field(None, description="Key collection instructions")


class Payment(BaseModel):
    status: PaymentStatus = Field(default=PaymentStatus.PENDING, description="Payment status")
    method: Optional[PaymentMethod] = Field(None, description="Payment method")
    amount: float = Field(..., description="Total amount in GBP", ge=0)
    transaction_id: Optional[str] = Field(None, description="Payment transaction ID")
    paid_at: Optional[datetime] = Field(None, description="Payment completion time")


class Booking(BaseModel):
    booking_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique booking identifier")
    client_id: str = Field(..., description="Client user ID")
    cleaner_id: Optional[str] = Field(None, description="Assigned cleaner user ID")
    status: BookingStatus = Field(default=BookingStatus.PENDING, description="Booking status")
    service: ServiceDetails = Field(..., description="Service details")
    schedule: Schedule = Field(..., description="Booking schedule")
    location: Location = Field(..., description="Service location")
    payment: Payment = Field(..., description="Payment information")
    notes: Optional[str] = Field(None, description="Additional notes")
    rating: Optional[int] = Field(None, description="Client rating (1-5)", ge=1, le=5)
    review: Optional[str] = Field(None, description="Client review")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")

    class Config:
        use_enum_values = True


# Request/Response models
class BookingCreate(BaseModel):
    service_type: ServiceType = Field(..., description="Type of cleaning service")
    date: date = Field(..., description="Booking date (YYYY-MM-DD)")
    time: time = Field(..., description="Booking time (HH:MM)")
    duration: int = Field(..., description="Duration in hours", ge=1, le=12)
    address: Address = Field(..., description="Service address")
    instructions: Optional[str] = Field(None, description="Access instructions")
    recurring: Optional[RecurringSchedule] = Field(None, description="Recurring schedule")
    special_requirements: Optional[List[str]] = Field(default_factory=list, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    @validator('date')
    def validate_date_not_past(cls, v):
        if v < date.today():
            raise ValueError('Booking date cannot be in the past')
        return v
    
    @validator('time')
    def validate_time_business_hours(cls, v):
        # Allow bookings between 7 AM and 8 PM
        if v.hour < 7 or v.hour > 20:
            raise ValueError('Booking time must be between 07:00 and 20:00')
        return v


class BookingUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[time] = None
    duration: Optional[int] = Field(None, ge=1, le=12)
    instructions: Optional[str] = None
    special_requirements: Optional[List[str]] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    booking_id: str
    client_id: str
    cleaner_id: Optional[str] = None
    status: BookingStatus
    service: ServiceDetails
    schedule: Schedule
    location: Location
    payment: Payment
    notes: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class BookingSummary(BaseModel):
    """Lightweight booking summary for lists"""
    booking_id: str
    status: BookingStatus
    service_type: ServiceType
    date: date
    time: time
    duration: int
    price: float
    client_name: Optional[str] = None
    cleaner_name: Optional[str] = None
    address_summary: str  # Just postcode and city


class AvailableSlot(BaseModel):
    """Available time slot for booking"""
    date: date
    time: time
    available: bool
    reason: Optional[str] = None  # If not available, why not