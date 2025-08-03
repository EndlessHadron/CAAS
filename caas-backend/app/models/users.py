from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CLIENT = "client"
    CLEANER = "cleaner"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class Address(BaseModel):
    line1: str = Field(..., description="Address line 1")
    line2: Optional[str] = Field(None, description="Address line 2")
    city: str = Field(..., description="City")
    postcode: str = Field(..., description="UK postcode")
    country: str = Field(default="UK", description="Country")


class UserVerification(BaseModel):
    email: bool = Field(default=False, description="Email verified")
    phone: bool = Field(default=False, description="Phone verified")
    identity: bool = Field(default=False, description="Identity document verified")
    background: bool = Field(default=False, description="Background check completed")


class UserProfile(BaseModel):
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    phone: Optional[str] = Field(None, description="Phone number")
    address: Optional[Address] = Field(None, description="User address")
    avatar_url: Optional[str] = Field(None, description="Profile picture URL")
    bio: Optional[str] = Field(None, description="User bio/description")


class User(BaseModel):
    uid: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    status: UserStatus = Field(default=UserStatus.PENDING_VERIFICATION, description="User status")
    profile: UserProfile = Field(..., description="User profile information")
    verification: UserVerification = Field(default_factory=UserVerification, description="Verification status")
    preferences: Dict = Field(default_factory=dict, description="User preferences")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Account creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    last_active: Optional[datetime] = Field(None, description="Last activity time")

    class Config:
        use_enum_values = True


class CleanerProfile(BaseModel):
    """Extended profile for cleaners"""
    experience_years: Optional[int] = Field(None, description="Years of cleaning experience")
    services_offered: List[str] = Field(default_factory=list, description="Types of services offered")
    hourly_rate: Optional[float] = Field(None, description="Hourly rate in GBP")
    radius_miles: Optional[int] = Field(default=5, description="Service radius in miles")
    rating: Optional[float] = Field(None, description="Average customer rating")
    total_jobs: int = Field(default=0, description="Total jobs completed")
    insurance_expiry: Optional[datetime] = Field(None, description="Insurance expiry date")
    dbs_check_date: Optional[datetime] = Field(None, description="DBS check date")


# Request/Response models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    role: UserRole
    first_name: str
    last_name: str
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Address] = None
    bio: Optional[str] = None


class UserResponse(BaseModel):
    uid: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    profile: UserProfile
    verification: UserVerification
    created_at: datetime
    last_active: Optional[datetime] = None