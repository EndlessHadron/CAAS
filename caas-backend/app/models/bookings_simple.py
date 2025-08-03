from pydantic import BaseModel, Field
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


class Address(BaseModel):
    line1: str = Field(..., description="Address line 1")
    line2: Optional[str] = Field(None, description="Address line 2")
    city: str = Field(..., description="City")
    postcode: str = Field(..., description="UK postcode")
    country: str = Field(default="UK", description="Country")


class BookingCreate(BaseModel):
    service_type: ServiceType = Field(..., description="Type of cleaning service")
    date: date = Field(..., description="Booking date (YYYY-MM-DD)")
    time: time = Field(..., description="Booking time (HH:MM)")
    duration: int = Field(..., description="Duration in hours", ge=1, le=12)
    address: Address = Field(..., description="Service address")
    instructions: Optional[str] = Field(None, description="Access instructions")
    special_requirements: Optional[List[str]] = Field(default_factory=list, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")
    


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
    service: Dict
    schedule: Dict
    location: Dict
    payment: Dict
    notes: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None