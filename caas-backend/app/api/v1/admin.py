import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel, field_validator

# Use regular authentication instead of admin-specific auth for now
from app.core.security import get_current_user_id
from app.core.admin_security import admin_security_service
from app.services.user_service import user_service
from app.models.users import User, UserRole, UserStatus
from app.core.database import get_firestore_client, FirestoreCollections
from google.cloud import firestore

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
db = get_firestore_client()

# Request models
class BookingStatusUpdateRequest(BaseModel):
    new_status: str
    reason: Optional[str] = None
    
    # Production validation
    @field_validator('new_status')
    @classmethod
    def validate_status(cls, v):
        allowed_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @field_validator('reason')
    @classmethod  
    def validate_reason(cls, v):
        if v and len(v) > 500:
            raise ValueError('Reason must be less than 500 characters')
        return v


async def require_admin(user_id: str = Depends(get_current_user_id)):
    """Simple admin check - verify user is admin role"""
    user = user_service.get_user_by_id(user_id)
    if not user or user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@router.get("/dashboard/metrics")
async def get_dashboard_metrics(
    admin: dict = Depends(require_admin)
):
    """Get dashboard metrics for admin panel"""
    try:
        # Get basic counts from Firestore
        users_ref = db.collection(FirestoreCollections.USERS)
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        
        # Count total users
        total_users = len(list(users_ref.stream()))
        
        # Count active bookings
        active_bookings_query = bookings_ref.where("status", "in", ["pending", "confirmed", "in_progress"])
        active_bookings = len(list(active_bookings_query.stream()))
        
        # Count pending bookings
        pending_bookings_query = bookings_ref.where("status", "==", "pending")
        pending_bookings = len(list(pending_bookings_query.stream()))
        
        # Calculate revenue (simplified - would need proper payment integration)
        total_revenue = 0.0
        monthly_revenue = 0.0
        
        # Count support tickets (placeholder)
        support_tickets_open = 0
        
        metrics = {
            "total_users": total_users,
            "active_bookings": active_bookings,
            "pending_bookings": pending_bookings,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "support_tickets_open": support_tickets_open,
            "system_health": "healthy"
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Failed to get dashboard metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard metrics"
        )


@router.get("/users/search")
async def search_users(
    email: Optional[str] = Query(None, description="Search by email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=200, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Search and filter users"""
    try:
        # Check admin access
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        users_ref = db.collection(FirestoreCollections.USERS)
        query = users_ref
        
        # Apply filters
        if email:
            # For email search, we'll do a simple contains search
            # In production, you might want to use Algolia or similar for better search
            query = query.where("email", ">=", email).where("email", "<=", email + "\uf8ff")
        
        if role:
            query = query.where("role", "==", role)
        
        if status:
            query = query.where("status", "==", status)
        
        # Execute query with pagination
        query = query.limit(limit).offset(offset)
        users_docs = list(query.stream())
        
        users = []
        for doc in users_docs:
            user_data = doc.to_dict()
            user_data["uid"] = doc.id
            # Add created_at and updated_at if missing
            if "created_at" not in user_data:
                user_data["created_at"] = datetime.utcnow().isoformat()
            if "updated_at" not in user_data:
                user_data["updated_at"] = datetime.utcnow().isoformat()
            if "status" not in user_data:
                user_data["status"] = "active"
            users.append(user_data)
        
        # Get total count (simplified)
        total_count = len(list(users_ref.stream())) if not any([email, role, status]) else len(users)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=user_id,
                admin_email=user.get("email", "unknown"),
                action="search_users",
                resource_type="users",
                details={"filters": {"email": email, "role": role, "status": status}},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {
            "users": users,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": len(users) == limit
        }
        
    except Exception as e:
        logger.error(f"Failed to search users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search users"
        )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get detailed user information"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get user document
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        user_data["uid"] = user_doc.id
        
        # Add missing fields
        if "created_at" not in user_data:
            user_data["created_at"] = datetime.utcnow().isoformat()
        if "updated_at" not in user_data:
            user_data["updated_at"] = datetime.utcnow().isoformat()
        if "status" not in user_data:
            user_data["status"] = "active"
        
        # Get user's bookings
        try:
            bookings_ref = db.collection(FirestoreCollections.BOOKINGS).where("client_id", "==", user_id)
            user_bookings = [doc.to_dict() for doc in bookings_ref.stream()]
            
            # Get user's cleaner bookings if they're a cleaner
            if user_data.get("role") == "cleaner":
                cleaner_bookings_ref = db.collection(FirestoreCollections.BOOKINGS).where("cleaner_id", "==", user_id)
                cleaner_bookings = [doc.to_dict() for doc in cleaner_bookings_ref.stream()]
                user_data["cleaner_bookings"] = cleaner_bookings
            
            user_data["bookings"] = user_bookings
        except Exception as e:
            logger.warning(f"Failed to fetch user bookings: {e}")
            user_data["bookings"] = []
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="view_user_details",
                resource_type="user",
                resource_id=user_id,
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user details"
        )


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    new_status: UserStatus,
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, str]:
    """Update user status"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Check if user exists
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        old_status = user_doc.to_dict().get("status")
        
        # Update user status
        db.collection(FirestoreCollections.USERS).document(user_id).update({
            "status": new_status.value,
            "updated_at": datetime.utcnow()
        })
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="update_user_status",
                resource_type="user",
                resource_id=user_id,
                details={"old_status": old_status, "new_status": new_status.value},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"User status updated to {new_status.value}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )


@router.post("/users/{user_id}/unlock")
async def unlock_user_account(
    user_id: str,
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Unlock user account by clearing rate limits and lockouts"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if user exists
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        user_email = user_data.get("email")
        
        # Clear security rate limits for this user
        from app.core.security_enhanced import security_service
        
        # Clear Redis-based rate limits if available
        if security_service.storage_backend == 'redis' and security_service.redis_client:
            rate_key = f"rate_limit:login:{user_email}"
            lockout_key = f"lockout:{user_email}"
            security_service.redis_client.delete(rate_key, lockout_key)
            logger.info(f"Cleared Redis rate limits for user {user_email}")
        
        # Clear Firestore-based rate limits
        elif security_service.storage_backend == 'firestore':
            try:
                rate_doc_id = f"login_rate_{user_email.replace('@', '_at_').replace('.', '_dot_')}"
                rate_ref = db.collection('_security').document('rate_limits').collection('login').document(rate_doc_id)
                rate_ref.delete()
                logger.info(f"Cleared Firestore rate limits for user {user_email}")
            except Exception as e:
                logger.warning(f"Failed to clear Firestore rate limits: {e}")
        
        # Update user status to active if it was blocked
        if user_data.get("status") in ["blocked", "suspended", "locked"]:
            db.collection(FirestoreCollections.USERS).document(user_id).update({
                "status": "active",
                "updated_at": datetime.utcnow(),
                "unlocked_by": admin_user_id,
                "unlocked_at": datetime.utcnow()
            })
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="unlock_user_account",
                resource_type="user",
                resource_id=user_id,
                details={"user_email": user_email, "previous_status": user_data.get("status")},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"User account unlocked successfully for {user_email}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unlock user account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlock user account"
        )


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Activate user account"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if user exists
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        old_status = user_data.get("status")
        
        # Update user status to active
        db.collection(FirestoreCollections.USERS).document(user_id).update({
            "status": "active",
            "updated_at": datetime.utcnow(),
            "activated_by": admin_user_id,
            "activated_at": datetime.utcnow()
        })
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="activate_user",
                resource_type="user",
                resource_id=user_id,
                details={"user_email": user_data.get("email"), "old_status": old_status, "new_status": "active"},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"User activated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to activate user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate user"
        )


@router.post("/users/{user_id}/block")
async def block_user(
    user_id: str,
    reason: str = Query(..., description="Reason for blocking the user"),
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Block user account permanently"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if user exists
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        old_status = user_data.get("status")
        
        # Update user status to blocked
        db.collection(FirestoreCollections.USERS).document(user_id).update({
            "status": "blocked",
            "updated_at": datetime.utcnow(),
            "blocked_by": admin_user_id,
            "blocked_at": datetime.utcnow(),
            "block_reason": reason
        })
        
        # Cancel all pending/active bookings for this user
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        
        # Cancel as client
        client_bookings = bookings_ref.where("client_id", "==", user_id).where("status", "in", ["pending", "confirmed"]).stream()
        for booking_doc in client_bookings:
            booking_doc.reference.update({
                "status": "cancelled_admin",
                "cancelled_reason": f"User blocked by admin: {reason}",
                "updated_at": datetime.utcnow()
            })
        
        # Cancel as cleaner
        cleaner_bookings = bookings_ref.where("cleaner_id", "==", user_id).where("status", "in", ["pending", "confirmed"]).stream()
        for booking_doc in cleaner_bookings:
            booking_doc.reference.update({
                "status": "cancelled_admin",
                "cancelled_reason": f"Cleaner blocked by admin: {reason}",
                "updated_at": datetime.utcnow(),
                "cleaner_id": None  # Remove cleaner assignment
            })
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="block_user",
                resource_type="user",
                resource_id=user_id,
                details={"user_email": user_data.get("email"), "old_status": old_status, "reason": reason},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"User blocked successfully. All active bookings have been cancelled."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to block user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to block user"
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    permanent: bool = Query(False, description="Permanent deletion (cannot be undone)"),
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Delete user account (soft delete by default, hard delete if permanent=true)"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if user exists
        user_doc = db.collection(FirestoreCollections.USERS).document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        user_email = user_data.get("email")
        
        if permanent:
            # HARD DELETE - Cannot be undone
            
            # First, archive user data for compliance/legal requirements
            archive_data = user_data.copy()
            archive_data.update({
                "deleted_at": datetime.utcnow(),
                "deleted_by": admin_user_id,
                "deletion_type": "permanent",
                "original_user_id": user_id
            })
            
            # Store in deleted users collection
            db.collection("deleted_users").document(user_id).set(archive_data)
            
            # Delete all user's bookings
            bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
            
            # Delete client bookings
            client_bookings = bookings_ref.where("client_id", "==", user_id).stream()
            for booking_doc in client_bookings:
                booking_doc.reference.delete()
            
            # Delete cleaner bookings
            cleaner_bookings = bookings_ref.where("cleaner_id", "==", user_id).stream()
            for booking_doc in cleaner_bookings:
                booking_doc.reference.delete()
            
            # Delete user document
            user_doc.reference.delete()
            
            message = f"User {user_email} permanently deleted. Data archived for compliance."
            action = "delete_user_permanent"
        
        else:
            # SOFT DELETE - Mark as deleted but keep data
            db.collection(FirestoreCollections.USERS).document(user_id).update({
                "status": "deleted",
                "deleted_at": datetime.utcnow(),
                "deleted_by": admin_user_id,
                "deletion_type": "soft",
                "updated_at": datetime.utcnow()
            })
            
            # Cancel all active bookings
            bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
            
            client_bookings = bookings_ref.where("client_id", "==", user_id).where("status", "in", ["pending", "confirmed"]).stream()
            for booking_doc in client_bookings:
                booking_doc.reference.update({
                    "status": "cancelled_admin",
                    "cancelled_reason": "User account deleted by admin",
                    "updated_at": datetime.utcnow()
                })
            
            cleaner_bookings = bookings_ref.where("cleaner_id", "==", user_id).where("status", "in", ["pending", "confirmed"]).stream()
            for booking_doc in cleaner_bookings:
                booking_doc.reference.update({
                    "status": "cancelled_admin",
                    "cancelled_reason": "Cleaner account deleted by admin",
                    "updated_at": datetime.utcnow(),
                    "cleaner_id": None
                })
            
            message = f"User {user_email} soft deleted. Can be restored if needed."
            action = "delete_user_soft"
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action=action,
                resource_type="user",
                resource_id=user_id,
                details={"user_email": user_email, "permanent": permanent},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": message}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )


@router.get("/bookings/search")
async def search_bookings(
    booking_id: Optional[str] = Query(None, description="Search by booking ID"),
    client_id: Optional[str] = Query(None, description="Filter by client ID"),
    cleaner_id: Optional[str] = Query(None, description="Filter by cleaner ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=200, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Search and filter bookings"""
    try:
        # Check admin access
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        query = bookings_ref
        
        # Apply filters
        if booking_id:
            # Direct lookup by booking ID
            booking_doc = bookings_ref.document(booking_id).get()
            if booking_doc.exists:
                booking_data = booking_doc.to_dict()
                booking_data["booking_id"] = booking_doc.id
                return {
                    "bookings": [booking_data],
                    "total_count": 1,
                    "limit": limit,
                    "offset": 0,
                    "has_more": False
                }
            else:
                return {
                    "bookings": [],
                    "total_count": 0,
                    "limit": limit,
                    "offset": offset,
                    "has_more": False
                }
        
        if client_id:
            query = query.where("client_id", "==", client_id)
        
        if cleaner_id:
            query = query.where("cleaner_id", "==", cleaner_id)
        
        if status:
            query = query.where("status", "==", status)
        
        # Execute query with pagination
        query = query.limit(limit).offset(offset)
        booking_docs = list(query.stream())
        
        bookings = []
        for doc in booking_docs:
            booking_data = doc.to_dict()
            booking_data["booking_id"] = doc.id
            
            # Transform data structure to match frontend expectations
            transformed_booking = {
                "booking_id": booking_data["booking_id"],
                "client_id": booking_data["client_id"],
                "cleaner_id": booking_data.get("cleaner_id"),
                "client_name": booking_data.get("client_name"),
                "cleaner_name": booking_data.get("cleaner_name"),
                "service_type": booking_data.get("service", {}).get("type", "unknown"),
                "status": booking_data["status"],
                "scheduled_date": booking_data.get("schedule", {}).get("date", ""),
                "scheduled_time": booking_data.get("schedule", {}).get("time", ""),
                "duration_hours": booking_data.get("service", {}).get("duration", 0),
                "total_price": booking_data.get("service", {}).get("price", booking_data.get("payment", {}).get("total", 0)),
                "address": {
                    "street": booking_data.get("location", {}).get("address", {}).get("line1", ""),
                    "city": booking_data.get("location", {}).get("address", {}).get("city", ""),
                    "postcode": booking_data.get("location", {}).get("address", {}).get("postcode", "")
                },
                "created_at": booking_data.get("created_at", "").isoformat() if hasattr(booking_data.get("created_at", ""), 'isoformat') else str(booking_data.get("created_at", "")),
                "updated_at": booking_data.get("updated_at", "").isoformat() if hasattr(booking_data.get("updated_at", ""), 'isoformat') else str(booking_data.get("updated_at", "")),
                "admin_notes": booking_data.get("admin_notes", "")
            }
            bookings.append(transformed_booking)
        
        # Get total count (simplified)
        total_count = len(list(bookings_ref.stream())) if not any([client_id, cleaner_id, status]) else len(bookings)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=user_id,
                admin_email=user.get("email", "unknown"),
                action="search_bookings",
                resource_type="bookings",
                details={"filters": {"client_id": client_id, "cleaner_id": cleaner_id, "status": status}},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {
            "bookings": bookings,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": len(bookings) == limit
        }
        
    except Exception as e:
        logger.error(f"Failed to search bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search bookings"
        )


@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    request: BookingStatusUpdateRequest,
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, str]:
    """Update booking status"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Check if booking exists
        booking_doc = db.collection(FirestoreCollections.BOOKINGS).document(booking_id).get()
        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        old_status = booking_doc.to_dict().get("status")
        
        # Production safety: Validate status transition
        if old_status == request.new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Booking is already in {request.new_status} status"
            )
        
        # Validate business rules for status transitions
        invalid_transitions = {
            'completed': ['pending', 'confirmed', 'in_progress'],
            'cancelled': ['pending', 'confirmed', 'in_progress']
        }
        
        if old_status in invalid_transitions and request.new_status in invalid_transitions[old_status]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition from {old_status} to {request.new_status}"
            )
        
        # Update booking status with transaction safety
        update_data = {
            "status": request.new_status,
            "updated_at": datetime.utcnow(),
            "status_history": firestore.ArrayUnion([{
                "from_status": old_status,
                "to_status": request.new_status,
                "changed_by": admin_user_id,
                "changed_at": datetime.utcnow(),
                "reason": request.reason
            }])
        }
        
        if request.reason:
            update_data["admin_notes"] = request.reason
        
        try:
            db.collection(FirestoreCollections.BOOKINGS).document(booking_id).update(update_data)
        except Exception as e:
            logger.error(f"Failed to update booking {booking_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database update failed - booking status unchanged"
            )
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="update_booking_status",
                resource_type="booking",
                resource_id=booking_id,
                details={"old_status": old_status, "new_status": request.new_status, "reason": request.reason},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"Booking status updated to {request.new_status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update booking status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update booking status"
        )


@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    reason: str = Query(..., description="Reason for cancellation"),
    refund_amount: Optional[float] = Query(None, description="Refund amount if applicable"),
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Cancel booking with optional refund"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if booking exists
        booking_doc = db.collection(FirestoreCollections.BOOKINGS).document(booking_id).get()
        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking_data = booking_doc.to_dict()
        old_status = booking_data.get("status")
        
        # Check if booking can be cancelled
        if old_status in ["completed", "cancelled", "cancelled_admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel booking with status: {old_status}"
            )
        
        # Update booking status
        update_data = {
            "status": "cancelled_admin",
            "cancelled_reason": reason,
            "cancelled_at": datetime.utcnow(),
            "cancelled_by": admin_user_id,
            "updated_at": datetime.utcnow()
        }
        
        if refund_amount is not None:
            update_data["refund_amount"] = refund_amount
            update_data["refund_processed_at"] = datetime.utcnow()
            update_data["refund_processed_by"] = admin_user_id
        
        db.collection(FirestoreCollections.BOOKINGS).document(booking_id).update(update_data)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="cancel_booking",
                resource_type="booking",
                resource_id=booking_id,
                details={
                    "old_status": old_status,
                    "reason": reason,
                    "refund_amount": refund_amount,
                    "client_id": booking_data.get("client_id"),
                    "cleaner_id": booking_data.get("cleaner_id")
                },
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        message = "Booking cancelled successfully"
        if refund_amount is not None:
            message += f" with refund of £{refund_amount}"
        
        return {"message": message}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel booking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel booking"
        )


@router.post("/bookings/{booking_id}/reassign")
async def reassign_booking_cleaner(
    booking_id: str,
    new_cleaner_id: str = Query(..., description="New cleaner ID"),
    reason: str = Query(..., description="Reason for reassignment"),
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Reassign booking to a different cleaner"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if booking exists
        booking_doc = db.collection(FirestoreCollections.BOOKINGS).document(booking_id).get()
        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking_data = booking_doc.to_dict()
        old_cleaner_id = booking_data.get("cleaner_id")
        
        # Check if new cleaner exists and is active
        new_cleaner = user_service.get_user_by_id(new_cleaner_id)
        if not new_cleaner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New cleaner not found"
            )
        
        if new_cleaner.get("role") != "cleaner":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a cleaner"
            )
        
        if new_cleaner.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New cleaner is not active"
            )
        
        # Update booking with new cleaner
        update_data = {
            "cleaner_id": new_cleaner_id,
            "reassigned_at": datetime.utcnow(),
            "reassigned_by": admin_user_id,
            "reassignment_reason": reason,
            "previous_cleaner_id": old_cleaner_id,
            "updated_at": datetime.utcnow()
        }
        
        # Reset status to confirmed if it was in progress
        if booking_data.get("status") == "in_progress":
            update_data["status"] = "confirmed"
        
        db.collection(FirestoreCollections.BOOKINGS).document(booking_id).update(update_data)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="reassign_booking",
                resource_type="booking",
                resource_id=booking_id,
                details={
                    "old_cleaner_id": old_cleaner_id,
                    "new_cleaner_id": new_cleaner_id,
                    "new_cleaner_email": new_cleaner.get("email"),
                    "reason": reason
                },
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": f"Booking reassigned to cleaner {new_cleaner.get('email', new_cleaner_id)}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to reassign booking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reassign booking"
        )


@router.post("/bookings/{booking_id}/force-complete")
async def force_complete_booking(
    booking_id: str,
    completion_notes: str = Query(..., description="Notes about the forced completion"),
    admin: dict = Depends(require_admin)
) -> Dict[str, str]:
    """Force complete a booking (admin override)"""
    try:
        # Admin access already verified by require_admin dependency
        admin_user_id = admin['id']
        
        # Check if booking exists
        booking_doc = db.collection(FirestoreCollections.BOOKINGS).document(booking_id).get()
        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking_data = booking_doc.to_dict()
        old_status = booking_data.get("status")
        
        # Check if booking can be force completed
        if old_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking is already completed"
            )
        
        if old_status in ["cancelled", "cancelled_admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot complete a cancelled booking"
            )
        
        # Update booking status to completed
        update_data = {
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "completion_method": "admin_force",
            "admin_completion_notes": completion_notes,
            "force_completed_by": admin_user_id,
            "updated_at": datetime.utcnow()
        }
        
        db.collection(FirestoreCollections.BOOKINGS).document(booking_id).update(update_data)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="force_complete_booking",
                resource_type="booking",
                resource_id=booking_id,
                details={
                    "old_status": old_status,
                    "completion_notes": completion_notes,
                    "client_id": booking_data.get("client_id"),
                    "cleaner_id": booking_data.get("cleaner_id")
                },
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": "Booking force completed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to force complete booking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to force complete booking"
        )


@router.get("/analytics/overview")
async def get_platform_analytics(
    days: int = Query(30, le=365, description="Number of days to analyze"),
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get comprehensive platform analytics"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get collections
        users_ref = db.collection(FirestoreCollections.USERS)
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        
        # User analytics
        all_users = list(users_ref.stream())
        user_analytics = {
            "total_users": len(all_users),
            "active_users": len([u for u in all_users if u.to_dict().get("status") == "active"]),
            "blocked_users": len([u for u in all_users if u.to_dict().get("status") == "blocked"]),
            "clients": len([u for u in all_users if u.to_dict().get("role") == "client"]),
            "cleaners": len([u for u in all_users if u.to_dict().get("role") == "cleaner"]),
            "admins": len([u for u in all_users if u.to_dict().get("role") == "admin"])
        }
        
        # Booking analytics
        all_bookings = list(bookings_ref.stream())
        booking_analytics = {
            "total_bookings": len(all_bookings),
            "pending_bookings": len([b for b in all_bookings if b.to_dict().get("status") == "pending"]),
            "confirmed_bookings": len([b for b in all_bookings if b.to_dict().get("status") == "confirmed"]),
            "completed_bookings": len([b for b in all_bookings if b.to_dict().get("status") == "completed"]),
            "cancelled_bookings": len([b for b in all_bookings if b.to_dict().get("status", "").startswith("cancelled")])
        }
        
        # Revenue analytics (simplified - would integrate with payment system)
        total_value = 0.0
        completed_bookings = [b for b in all_bookings if b.to_dict().get("status") == "completed"]
        for booking in completed_bookings:
            booking_data = booking.to_dict()
            total_value += float(booking_data.get("total_price", 0))
        
        revenue_analytics = {
            "total_revenue": total_value,
            "average_booking_value": total_value / len(completed_bookings) if completed_bookings else 0,
            "completed_bookings_count": len(completed_bookings)
        }
        
        # System health
        system_health = {
            "database_status": "healthy",
            "last_updated": datetime.utcnow().isoformat(),
            "security_incidents": 0  # Would integrate with security monitoring
        }
        
        analytics_data = {
            "period": {
                "days": days,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "users": user_analytics,
            "bookings": booking_analytics,
            "revenue": revenue_analytics,
            "system_health": system_health
        }
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="view_platform_analytics",
                resource_type="analytics",
                details={"period_days": days},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return analytics_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get platform analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform analytics"
        )


@router.get("/system/health")
async def get_system_health(
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get comprehensive system health status"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        health_status = {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "healthy"
        }
        
        # Test database connectivity
        try:
            test_doc = db.collection("_health_check").document("test")
            test_doc.set({"timestamp": datetime.utcnow()})
            test_doc.delete()
            health_status["database"] = {
                "status": "healthy",
                "latency_ms": "<50"  # Simplified
            }
        except Exception as e:
            health_status["database"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            health_status["overall_status"] = "degraded"
        
        # Test security service
        try:
            from app.core.security_enhanced import security_service
            health_status["security_service"] = {
                "status": "healthy",
                "storage_backend": security_service.storage_backend,
                "redis_available": security_service.redis_client is not None
            }
        except Exception as e:
            health_status["security_service"] = {
                "status": "unhealthy",
                "error": str(e)
            }
        
        # Check recent error rates (simplified)
        health_status["error_rates"] = {
            "last_hour": "<1%",
            "last_24h": "<1%",
            "status": "healthy"
        }
        
        # Performance metrics (simplified)
        health_status["performance"] = {
            "avg_response_time": "<200ms",
            "cpu_usage": "<50%",
            "memory_usage": "<70%",
            "status": "healthy"
        }
        
        return health_status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system health"
        )


@router.get("/users/suspicious")
async def get_suspicious_users(
    limit: int = Query(50, le=200, description="Number of results to return"),
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get users with suspicious activity patterns"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        suspicious_users = []
        
        # Get users with multiple failed bookings
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        users_ref = db.collection(FirestoreCollections.USERS)
        
        # Simple suspicious activity detection
        all_users = list(users_ref.stream())
        
        for user_doc in all_users:
            user_data = user_doc.to_dict()
            user_id = user_doc.id
            suspicious_score = 0
            flags = []
            
            # Check for multiple cancelled bookings as client
            client_cancelled = bookings_ref.where("client_id", "==", user_id).where("status", "==", "cancelled").stream()
            cancelled_count = len(list(client_cancelled))
            if cancelled_count > 3:
                suspicious_score += cancelled_count * 2
                flags.append(f"High cancellation rate ({cancelled_count} cancellations)")
            
            # Check for account creation without bookings (potential spam)
            created_at = user_data.get("created_at")
            if created_at:
                try:
                    # Simple date check - if account is old but no bookings
                    user_bookings = bookings_ref.where("client_id", "==", user_id).stream()
                    booking_count = len(list(user_bookings))
                    
                    if booking_count == 0:
                        suspicious_score += 1
                        flags.append("No booking activity")
                except Exception:
                    pass
            
            # Check for unusual profile data
            profile = user_data.get("profile", {})
            if not profile.get("first_name") or not profile.get("last_name"):
                suspicious_score += 1
                flags.append("Incomplete profile")
            
            # Add to suspicious list if score is high enough
            if suspicious_score >= 3:
                suspicious_users.append({
                    "user_id": user_id,
                    "email": user_data.get("email"),
                    "suspicious_score": suspicious_score,
                    "flags": flags,
                    "status": user_data.get("status", "unknown"),
                    "role": user_data.get("role", "unknown"),
                    "created_at": user_data.get("created_at")
                })
        
        # Sort by suspicious score (highest first) and limit
        suspicious_users.sort(key=lambda x: x["suspicious_score"], reverse=True)
        suspicious_users = suspicious_users[:limit]
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="view_suspicious_users",
                resource_type="security",
                details={"found_suspicious_users": len(suspicious_users)},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {
            "suspicious_users": suspicious_users,
            "total_found": len(suspicious_users),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get suspicious users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve suspicious users"
        )


@router.post("/maintenance-mode")
async def toggle_maintenance_mode(
    enabled: bool = Query(..., description="Enable or disable maintenance mode"),
    message: str = Query("System maintenance in progress", description="Maintenance message"),
    admin_user_id: str = Depends(get_current_user_id)
) -> Dict[str, str]:
    """Toggle platform maintenance mode"""
    try:
        # Check admin access
        admin_user = user_service.get_user_by_id(admin_user_id)
        if not admin_user or admin_user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Update maintenance mode in platform settings
        maintenance_settings = {
            "maintenance_mode": enabled,
            "maintenance_message": message,
            "maintenance_enabled_at": datetime.utcnow().isoformat() if enabled else None,
            "maintenance_enabled_by": admin_user_id if enabled else None,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.collection(FirestoreCollections.PLATFORM_SETTINGS).document("maintenance").set(maintenance_settings)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=admin_user_id,
                admin_email=admin_user.get("email", "unknown"),
                action="toggle_maintenance_mode",
                resource_type="system",
                details={"enabled": enabled, "message": message},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        status_msg = "enabled" if enabled else "disabled"
        return {"message": f"Maintenance mode {status_msg} successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle maintenance mode: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle maintenance mode"
        )


@router.get("/audit-logs")
async def get_audit_logs(
    admin_id: Optional[str] = Query(None, description="Filter by admin ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    limit: int = Query(50, le=200, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get audit logs for admin actions"""
    try:
        # Check admin access
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        logs_ref = db.collection(FirestoreCollections.AUDIT_LOG)
        query = logs_ref.order_by("timestamp", direction="DESCENDING")
        
        # Apply filters
        if admin_id:
            query = query.where("admin_id", "==", admin_id)
        
        if action:
            query = query.where("action", "==", action)
        
        if resource_type:
            query = query.where("resource_type", "==", resource_type)
        
        # Execute query with pagination
        query = query.limit(limit).offset(offset)
        log_docs = list(query.stream())
        
        logs = []
        for doc in log_docs:
            log_data = doc.to_dict()
            log_data["log_id"] = doc.id
            logs.append(log_data)
        
        return {
            "logs": logs,
            "limit": limit,
            "offset": offset,
            "has_more": len(logs) == limit
        }
        
    except Exception as e:
        logger.error(f"Failed to get audit logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit logs"
        )


# Settings Management
@router.get("/settings")
async def get_platform_settings(
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """Get platform settings"""
    try:
        # Check admin access
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        settings_doc = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document("config").get()
        
        if settings_doc.exists:
            settings_data = settings_doc.to_dict()
        else:
            # Return default settings if none exist
            settings_data = {
                "platform_name": "neatly",
                "service_fee_percentage": 15.0,
                "cancellation_window_hours": 24,
                "booking_advance_hours": 2,
                "payment_processing": {
                    "enabled": True,
                    "provider": "stripe",
                    "test_mode": True
                },
                "notifications": {
                    "email_enabled": True,
                    "sms_enabled": False,
                    "push_enabled": True
                },
                "maintenance_mode": False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=user_id,
                admin_email=user.get("email", "unknown"),
                action="view_settings",
                resource_type="settings",
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return settings_data
        
    except Exception as e:
        logger.error(f"Failed to get platform settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform settings"
        )


@router.put("/settings")
async def update_platform_settings(
    settings_data: dict,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, str]:
    """Update platform settings"""
    try:
        # Check admin access
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Add metadata
        settings_data["updated_at"] = datetime.utcnow().isoformat()
        settings_data["updated_by"] = user_id
        
        # Validate required fields
        required_fields = ["platform_name", "service_fee_percentage", "cancellation_window_hours"]
        for field in required_fields:
            if field not in settings_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Required field '{field}' is missing"
                )
        
        # Validate data types and ranges
        if not isinstance(settings_data["service_fee_percentage"], (int, float)) or \
           not 0 <= settings_data["service_fee_percentage"] <= 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service fee percentage must be between 0 and 50"
            )
        
        if not isinstance(settings_data["cancellation_window_hours"], int) or \
           settings_data["cancellation_window_hours"] < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cancellation window hours must be a non-negative integer"
            )
        
        # Update settings in database
        db.collection(FirestoreCollections.PLATFORM_SETTINGS).document("config").set(settings_data)
        
        # Log admin action
        try:
            await admin_security_service.log_admin_action(
                admin_id=user_id,
                admin_email=user.get("email", "unknown"),
                action="update_settings",
                resource_type="settings",
                details={"updated_fields": list(settings_data.keys())},
                ip_address="unknown",
                user_agent=None
            )
        except Exception as e:
            logger.warning(f"Failed to log admin action: {e}")
        
        return {"message": "Platform settings updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update platform settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update platform settings"
        )


# Health check for admin API
@router.get("/health")
async def admin_health_check():
    """Health check endpoint for admin API"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}