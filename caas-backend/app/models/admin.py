from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from .users import UserRole


class AdminPermission(str, Enum):
    # User management
    VIEW_USERS = "view_users"
    EDIT_USERS = "edit_users"
    DELETE_USERS = "delete_users"
    MANAGE_USER_STATUS = "manage_user_status"
    
    # Booking management
    VIEW_BOOKINGS = "view_bookings"
    EDIT_BOOKINGS = "edit_bookings"
    CANCEL_BOOKINGS = "cancel_bookings"
    REASSIGN_CLEANERS = "reassign_cleaners"
    
    # Financial operations
    VIEW_PAYMENTS = "view_payments"
    PROCESS_REFUNDS = "process_refunds"
    VIEW_PAYOUTS = "view_payouts"
    MANAGE_TRANSACTIONS = "manage_transactions"
    
    # Support operations
    VIEW_SUPPORT_TICKETS = "view_support_tickets"
    MANAGE_SUPPORT_TICKETS = "manage_support_tickets"
    SEND_MESSAGES = "send_messages"
    
    # System administration
    VIEW_AUDIT_LOGS = "view_audit_logs"
    MANAGE_ADMIN_USERS = "manage_admin_users"
    SYSTEM_SETTINGS = "system_settings"
    VIEW_ANALYTICS = "view_analytics"


class AdminRolePermissions:
    """Define permissions for each admin role"""
    
    ROLE_PERMISSIONS = {
        UserRole.SUPER_ADMIN: [
            # Full system access
            AdminPermission.VIEW_USERS,
            AdminPermission.EDIT_USERS,
            AdminPermission.DELETE_USERS,
            AdminPermission.MANAGE_USER_STATUS,
            AdminPermission.VIEW_BOOKINGS,
            AdminPermission.EDIT_BOOKINGS,
            AdminPermission.CANCEL_BOOKINGS,
            AdminPermission.REASSIGN_CLEANERS,
            AdminPermission.VIEW_PAYMENTS,
            AdminPermission.PROCESS_REFUNDS,
            AdminPermission.VIEW_PAYOUTS,
            AdminPermission.MANAGE_TRANSACTIONS,
            AdminPermission.VIEW_SUPPORT_TICKETS,
            AdminPermission.MANAGE_SUPPORT_TICKETS,
            AdminPermission.SEND_MESSAGES,
            AdminPermission.VIEW_AUDIT_LOGS,
            AdminPermission.MANAGE_ADMIN_USERS,
            AdminPermission.SYSTEM_SETTINGS,
            AdminPermission.VIEW_ANALYTICS,
        ],
        
        UserRole.OPERATIONS_MANAGER: [
            # Operations and booking management
            AdminPermission.VIEW_USERS,
            AdminPermission.EDIT_USERS,
            AdminPermission.MANAGE_USER_STATUS,
            AdminPermission.VIEW_BOOKINGS,
            AdminPermission.EDIT_BOOKINGS,
            AdminPermission.CANCEL_BOOKINGS,
            AdminPermission.REASSIGN_CLEANERS,
            AdminPermission.VIEW_PAYMENTS,
            AdminPermission.PROCESS_REFUNDS,
            AdminPermission.VIEW_SUPPORT_TICKETS,
            AdminPermission.MANAGE_SUPPORT_TICKETS,
            AdminPermission.SEND_MESSAGES,
            AdminPermission.VIEW_ANALYTICS,
        ],
        
        UserRole.SUPPORT_AGENT: [
            # Customer support focused
            AdminPermission.VIEW_USERS,
            AdminPermission.EDIT_USERS,
            AdminPermission.VIEW_BOOKINGS,
            AdminPermission.EDIT_BOOKINGS,
            AdminPermission.CANCEL_BOOKINGS,
            AdminPermission.VIEW_SUPPORT_TICKETS,
            AdminPermission.MANAGE_SUPPORT_TICKETS,
            AdminPermission.SEND_MESSAGES,
        ],
        
        UserRole.ADMIN: [
            # Basic admin functions
            AdminPermission.VIEW_USERS,
            AdminPermission.VIEW_BOOKINGS,
            AdminPermission.VIEW_SUPPORT_TICKETS,
            AdminPermission.VIEW_ANALYTICS,
            AdminPermission.SEND_MESSAGES,
        ]
    }
    
    @classmethod
    def get_permissions(cls, role: UserRole) -> List[AdminPermission]:
        """Get permissions for a given role"""
        return cls.ROLE_PERMISSIONS.get(role, [])
    
    @classmethod
    def has_permission(cls, role: UserRole, permission: AdminPermission) -> bool:
        """Check if a role has a specific permission"""
        return permission in cls.get_permissions(role)


class AdminUser(BaseModel):
    """Extended user model for admin users"""
    uid: str
    email: str
    role: UserRole
    permissions: List[AdminPermission] = Field(default_factory=list)
    ip_whitelist: List[str] = Field(default_factory=list)
    mfa_enabled: bool = Field(default=False)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # Admin who created this account
    
    def __init__(self, **data):
        super().__init__(**data)
        # Auto-assign permissions based on role
        if not self.permissions:
            self.permissions = AdminRolePermissions.get_permissions(self.role)


class AuditLog(BaseModel):
    """Audit log for admin actions"""
    log_id: str = Field(..., description="Unique log identifier")
    admin_id: str = Field(..., description="Admin user ID who performed action")
    admin_email: str = Field(..., description="Admin email for readability")
    action: str = Field(..., description="Action performed")
    resource_type: str = Field(..., description="Type of resource affected")
    resource_id: Optional[str] = Field(None, description="ID of affected resource")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional action details")
    ip_address: str = Field(..., description="IP address of admin")
    user_agent: Optional[str] = Field(None, description="User agent string")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        # For Firestore compatibility
        arbitrary_types_allowed = True


class AdminSession(BaseModel):
    """Admin session tracking"""
    session_id: str
    admin_id: str
    ip_address: str
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    active: bool = Field(default=True)


class AdminMetrics(BaseModel):
    """Dashboard metrics for admin panel"""
    total_users: int = 0
    active_bookings: int = 0
    pending_bookings: int = 0
    total_revenue: float = 0.0
    monthly_revenue: float = 0.0
    support_tickets_open: int = 0
    system_health: str = "healthy"  # healthy, warning, critical
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class UserSearchFilters(BaseModel):
    """Filters for user search"""
    email: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    has_bookings: Optional[bool] = None
    limit: int = Field(default=50, le=200)
    offset: int = Field(default=0, ge=0)


class BookingSearchFilters(BaseModel):
    """Filters for booking search"""
    booking_id: Optional[str] = None
    client_id: Optional[str] = None
    cleaner_id: Optional[str] = None
    status: Optional[str] = None
    service_type: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    limit: int = Field(default=50, le=200)
    offset: int = Field(default=0, ge=0)