#!/usr/bin/env python3
"""Admin utilities for user management"""

import logging
from typing import Optional, Dict, Any
from app.core.database import get_firestore_client
from app.models.users import UserRole

logger = logging.getLogger(__name__)


class AdminUtils:
    """Utilities for admin operations"""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    def force_update_user_role(self, user_id: str, new_role: UserRole) -> bool:
        """Force update user role in Firestore and clear any caches"""
        try:
            # Update the user document directly
            user_ref = self.db.collection("users").document(user_id)
            
            # Update role and force cache invalidation by updating timestamp
            update_data = {
                "role": new_role.value,
                "updated_at": self.db.SERVER_TIMESTAMP,
                "role_updated_at": self.db.SERVER_TIMESTAMP  # Add explicit role update timestamp
            }
            
            user_ref.update(update_data)
            
            logger.info(f"Force updated user {user_id} role to {new_role.value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to force update user role: {e}")
            return False
    
    def refresh_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Force refresh user data from Firestore"""
        try:
            user_doc = self.db.collection("users").document(user_id).get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                user_data["uid"] = user_doc.id
                logger.info(f"Refreshed user data for {user_id}, role: {user_data.get('role')}")
                return user_data
            else:
                logger.warning(f"User {user_id} not found in Firestore")
                return None
                
        except Exception as e:
            logger.error(f"Failed to refresh user data: {e}")
            return None
    
    def get_user_by_email_fresh(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email with fresh data from Firestore"""
        try:
            # Query Firestore directly
            users_ref = self.db.collection("users")
            query = users_ref.where("email", "==", email).limit(1)
            docs = list(query.stream())
            
            if docs:
                user_doc = docs[0]
                user_data = user_doc.to_dict()
                user_data["uid"] = user_doc.id
                logger.info(f"Fresh user data for {email}, role: {user_data.get('role')}")
                return user_data
            else:
                logger.warning(f"User {email} not found in Firestore")
                return None
                
        except Exception as e:
            logger.error(f"Failed to get fresh user data: {e}")
            return None


# Global instance
admin_utils = AdminUtils()