import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from google.cloud import firestore

from app.config import settings
from app.models.users import UserRole
from app.models.admin import AdminPermission, AdminRolePermissions, AuditLog, AdminSession
from app.core.database import get_firestore_client, FirestoreCollections

logger = logging.getLogger(__name__)

# Admin session timeout (15 minutes)
ADMIN_SESSION_TIMEOUT = timedelta(minutes=15)

# Security scheme
admin_security = HTTPBearer()


class AdminAuthenticationError(HTTPException):
    def __init__(self, detail: str = "Admin authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class AdminPermissionError(HTTPException):
    def __init__(self, detail: str = "Insufficient admin permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class AdminSecurityService:
    def __init__(self):
        self.db = get_firestore_client()
    
    async def verify_admin_token(self, token: str) -> dict:
        """Verify admin JWT token and return admin data"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            admin_id: str = payload.get("sub")
            role: str = payload.get("role")
            
            if not admin_id or not role:
                raise AdminAuthenticationError("Invalid token payload")
            
            # Verify this is an admin role
            if not self.is_admin_role(role):
                raise AdminAuthenticationError("Not an admin account")
            
            # Get admin user from database
            admin_doc = self.db.collection(FirestoreCollections.USERS).document(admin_id).get()
            if not admin_doc.exists:
                raise AdminAuthenticationError("Admin user not found")
            
            admin_data = admin_doc.to_dict()
            
            # Verify admin is active or pending verification (admins can be active while pending verification)
            admin_status = admin_data.get("status")
            if admin_status not in ["active", "pending_verification"]:
                raise AdminAuthenticationError(f"Admin account is not active (status: {admin_status})")
            
            return {
                "admin_id": admin_id,
                "email": admin_data.get("email"),
                "role": UserRole(role),
                "permissions": AdminRolePermissions.get_permissions(UserRole(role))
            }
            
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid admin token: {e}")
            raise AdminAuthenticationError("Invalid or expired token")
    
    def is_admin_role(self, role: str) -> bool:
        """Check if role is an admin role"""
        admin_roles = {
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.SUPPORT_AGENT,
            UserRole.OPERATIONS_MANAGER
        }
        return UserRole(role) in admin_roles
    
    async def check_permission(self, admin_role: UserRole, permission: AdminPermission) -> bool:
        """Check if admin role has specific permission"""
        return AdminRolePermissions.has_permission(admin_role, permission)
    
    async def log_admin_action(
        self,
        admin_id: str,
        admin_email: str,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: dict = None,
        ip_address: str = "unknown",
        user_agent: Optional[str] = None
    ):
        """Log admin action to audit trail"""
        try:
            log_entry = AuditLog(
                log_id=str(uuid.uuid4()),
                admin_id=admin_id,
                admin_email=admin_email,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Store in Firestore
            self.db.collection(FirestoreCollections.AUDIT_LOG).document(log_entry.log_id).set(
                log_entry.model_dump()
            )
            
            logger.info(f"Admin action logged: {admin_email} performed {action} on {resource_type}")
            
        except Exception as e:
            logger.error(f"Failed to log admin action: {e}")
            # Don't fail the request if logging fails
    
    async def create_admin_session(
        self,
        admin_id: str,
        ip_address: str,
        user_agent: Optional[str] = None
    ) -> str:
        """Create admin session and return session ID"""
        session_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + ADMIN_SESSION_TIMEOUT
        
        session = AdminSession(
            session_id=session_id,
            admin_id=admin_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
        
        # Store session in Firestore
        self.db.collection(FirestoreCollections.ADMIN_SESSIONS).document(session_id).set(
            session.model_dump()
        )
        
        return session_id
    
    async def validate_admin_session(self, session_id: str, ip_address: str) -> bool:
        """Validate admin session"""
        try:
            session_doc = self.db.collection(FirestoreCollections.ADMIN_SESSIONS).document(session_id).get()
            if not session_doc.exists:
                return False
            
            session_data = session_doc.to_dict()
            session = AdminSession(**session_data)
            
            # Check if session is active and not expired
            if not session.active or datetime.utcnow() > session.expires_at:
                return False
            
            # Check IP address (optional security measure)
            if session.ip_address != ip_address:
                logger.warning(f"IP mismatch for admin session {session_id}")
                return False
            
            # Update last activity
            self.db.collection(FirestoreCollections.ADMIN_SESSIONS).document(session_id).update({
                "last_activity": datetime.utcnow(),
                "expires_at": datetime.utcnow() + ADMIN_SESSION_TIMEOUT
            })
            
            return True
            
        except Exception as e:
            logger.error(f"Session validation error: {e}")
            return False
    
    async def invalidate_admin_session(self, session_id: str):
        """Invalidate admin session (logout)"""
        try:
            self.db.collection(FirestoreCollections.ADMIN_SESSIONS).document(session_id).update({
                "active": False
            })
        except Exception as e:
            logger.error(f"Failed to invalidate session: {e}")


# Global service instance
admin_security_service = AdminSecurityService()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(admin_security),
    request: Request = None
) -> dict:
    """Dependency to get current admin user"""
    try:
        admin_data = await admin_security_service.verify_admin_token(credentials.credentials)
        
        # Get client IP
        ip_address = "unknown"
        if request:
            ip_address = request.client.host if request.client else "unknown"
            if "x-forwarded-for" in request.headers:
                ip_address = request.headers["x-forwarded-for"].split(",")[0].strip()
        
        # Add IP to admin data for logging
        admin_data["ip_address"] = ip_address
        admin_data["user_agent"] = request.headers.get("user-agent") if request else None
        
        return admin_data
        
    except AdminAuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Admin authentication error: {e}")
        raise AdminAuthenticationError("Authentication failed")


def require_admin_permission(permission: AdminPermission):
    """Decorator factory for requiring specific admin permissions"""
    def permission_dependency(admin: dict = Depends(get_current_admin)):
        if not AdminRolePermissions.has_permission(admin["role"], permission):
            raise AdminPermissionError(
                f"Permission '{permission.value}' required for this operation"
            )
        return admin
    
    return permission_dependency


async def log_admin_action_decorator(
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: dict = None
):
    """Decorator for automatic admin action logging"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract admin from kwargs (should be injected by dependency)
            admin = kwargs.get("admin") or kwargs.get("current_admin")
            if admin:
                await admin_security_service.log_admin_action(
                    admin_id=admin["admin_id"],
                    admin_email=admin["email"],
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details=details,
                    ip_address=admin.get("ip_address", "unknown"),
                    user_agent=admin.get("user_agent")
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# IP Whitelist checking (for high-security environments)
async def check_admin_ip_whitelist(request: Request, admin: dict = Depends(get_current_admin)):
    """Check if admin IP is whitelisted (optional security layer)"""
    ip_address = request.client.host if request.client else "unknown"
    if "x-forwarded-for" in request.headers:
        ip_address = request.headers["x-forwarded-for"].split(",")[0].strip()
    
    # Get admin's IP whitelist from database
    try:
        admin_doc = admin_security_service.db.collection(FirestoreCollections.USERS).document(admin["admin_id"]).get()
        if admin_doc.exists:
            admin_data = admin_doc.to_dict()
            ip_whitelist = admin_data.get("ip_whitelist", [])
            
            # If whitelist is configured and IP not in whitelist, deny access
            if ip_whitelist and ip_address not in ip_whitelist:
                logger.warning(f"Admin {admin['email']} attempted access from non-whitelisted IP: {ip_address}")
                raise AdminPermissionError("IP address not whitelisted for admin access")
    
    except Exception as e:
        logger.error(f"IP whitelist check failed: {e}")
        # Continue without blocking if whitelist check fails (fail open)
    
    return admin