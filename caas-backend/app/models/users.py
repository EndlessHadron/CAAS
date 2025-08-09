from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CLIENT = "client"
    CLEANER = "cleaner"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    SUPPORT_AGENT = "support_agent"
    OPERATIONS_MANAGER = "operations_manager"


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


class ClientProfile(BaseModel):
    """Extended profile for clients"""
    preferred_service_types: List[str] = Field(default_factory=list, description="Preferred cleaning services")
    preferred_times: List[str] = Field(default_factory=list, description="Preferred time slots")
    special_requirements: List[str] = Field(default_factory=list, description="Special cleaning requirements")
    property_type: Optional[str] = Field(None, description="Type of property (flat, house, office)")
    property_size: Optional[str] = Field(None, description="Property size (studio, 1-bed, 2-bed, etc)")
    pets: Optional[bool] = Field(default=False, description="Has pets")
    preferred_products: Optional[str] = Field(None, description="Preferred cleaning products")
    access_notes: Optional[str] = Field(None, description="Property access instructions")


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
    availability: Dict[str, List[str]] = Field(default_factory=dict, description="Weekly availability schedule")
    skills: List[str] = Field(default_factory=list, description="Special cleaning skills/certifications")
    equipment_owned: List[str] = Field(default_factory=list, description="Cleaning equipment owned")
    travel_cost_per_mile: Optional[float] = Field(None, description="Travel cost per mile in GBP")
    min_job_duration: Optional[int] = Field(default=2, description="Minimum job duration in hours")
    accepts_pets: Optional[bool] = Field(default=True, description="Accepts jobs with pets")
    eco_friendly: Optional[bool] = Field(default=False, description="Uses eco-friendly products only")


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


class ClientProfileUpdate(BaseModel):
    """Update model for client-specific profile fields"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Address] = None
    bio: Optional[str] = None
    preferred_service_types: Optional[List[str]] = None
    preferred_times: Optional[List[str]] = None
    special_requirements: Optional[List[str]] = None
    property_type: Optional[str] = None
    property_size: Optional[str] = None
    pets: Optional[bool] = None
    preferred_products: Optional[str] = None
    access_notes: Optional[str] = None


class CleanerProfileUpdate(BaseModel):
    """Update model for cleaner-specific profile fields"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Address] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    services_offered: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    radius_miles: Optional[int] = None
    availability: Optional[Dict[str, List[str]]] = None
    skills: Optional[List[str]] = None
    equipment_owned: Optional[List[str]] = None
    travel_cost_per_mile: Optional[float] = None
    min_job_duration: Optional[int] = None
    accepts_pets: Optional[bool] = None
    eco_friendly: Optional[bool] = None
    insurance_expiry: Optional[datetime] = None
    dbs_check_date: Optional[datetime] = None


class UserResponse(BaseModel):
    uid: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    profile: UserProfile
    verification: UserVerification
    created_at: datetime
    last_active: Optional[datetime] = None


class ClientResponse(BaseModel):
    """Complete response model for client users"""
    uid: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    profile: UserProfile
    client_profile: Optional[ClientProfile] = None
    verification: UserVerification
    created_at: datetime
    last_active: Optional[datetime] = None


class CleanerResponse(BaseModel):
    """Complete response model for cleaner users"""
    uid: str
    email: EmailStr
    role: UserRole
    status: UserStatus
    profile: UserProfile
    cleaner_profile: Optional[CleanerProfile] = None
    verification: UserVerification
    created_at: datetime
    last_active: Optional[datetime] = None