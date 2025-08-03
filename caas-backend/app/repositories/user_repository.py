from typing import Optional, List, Dict, Any
import uuid
import logging

from app.repositories.base import BaseRepository
from app.core.database import FirestoreCollections
from app.models.users import User, UserCreate, UserRole, UserStatus

logger = logging.getLogger(__name__)


class UserRepository(BaseRepository[User]):
    """Repository for user operations"""
    
    def __init__(self):
        super().__init__(FirestoreCollections.USERS)
    
    async def create_user(self, user_data: UserCreate, hashed_password: str) -> Optional[str]:
        """Create a new user account"""
        try:
            # Generate unique user ID
            user_id = str(uuid.uuid4())
            
            # Check if email already exists
            existing_user = await self.get_by_email(user_data.email)
            if existing_user:
                logger.warning(f"Attempted to create user with existing email: {user_data.email}")
                return None
            
            # Prepare user document
            user_doc = {
                'uid': user_id,
                'email': user_data.email,
                'password_hash': hashed_password,
                'role': user_data.role.value,
                'status': UserStatus.PENDING_VERIFICATION.value,
                'profile': {
                    'first_name': user_data.first_name,
                    'last_name': user_data.last_name,
                    'phone': user_data.phone,
                    'address': None,
                    'avatar_url': None,
                    'bio': None
                },
                'verification': {
                    'email': False,
                    'phone': False,
                    'identity': False,
                    'background': False
                },
                'preferences': {},
                'last_active': None
            }
            
            success = await self.create(user_id, user_doc)
            return user_id if success else None
            
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            return None
    
    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address"""
        return await self.get_by_field('email', email)
    
    async def get_user_with_password(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user with password hash for authentication"""
        return await self.get_by_email(email)
    
    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Update user profile information"""
        try:
            # Get current user data
            current_user = await self.get_by_id(user_id)
            if not current_user:
                return False
            
            # Update profile fields
            updated_profile = current_user.get('profile', {})
            updated_profile.update(profile_data)
            
            return await self.update(user_id, {'profile': updated_profile})
            
        except Exception as e:
            logger.error(f"Failed to update user profile {user_id}: {e}")
            return False
    
    async def update_verification_status(self, user_id: str, verification_type: str, status: bool) -> bool:
        """Update user verification status"""
        try:
            current_user = await self.get_by_id(user_id)
            if not current_user:
                return False
            
            verification = current_user.get('verification', {})
            verification[verification_type] = status
            
            # If email is verified, update user status
            update_data = {'verification': verification}
            if verification_type == 'email' and status:
                update_data['status'] = UserStatus.ACTIVE.value
            
            return await self.update(user_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to update verification for {user_id}: {e}")
            return False
    
    async def update_last_active(self, user_id: str) -> bool:
        """Update user's last active timestamp"""
        from datetime import datetime
        return await self.update(user_id, {'last_active': datetime.utcnow()})
    
    async def get_users_by_role(self, role: UserRole, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by role"""
        return await self.get_many_by_field('role', role.value, limit)
    
    async def get_users_by_status(self, status: UserStatus, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by status"""
        return await self.get_many_by_field('status', status.value, limit)
    
    async def search_users_by_name(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search users by first name or last name"""
        try:
            # Firestore doesn't support full-text search, so we'll do a simple prefix match
            # In production, you might want to use Algolia or Elasticsearch
            
            results = []
            search_lower = search_term.lower()
            
            # Get all users (this is not efficient for large datasets)
            all_users = await self.get_all()
            
            for user in all_users:
                profile = user.get('profile', {})
                first_name = (profile.get('first_name', '') or '').lower()
                last_name = (profile.get('last_name', '') or '').lower()
                
                if (search_lower in first_name or 
                    search_lower in last_name or 
                    first_name.startswith(search_lower) or 
                    last_name.startswith(search_lower)):
                    results.append(user)
                    
                    if len(results) >= limit:
                        break
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search users: {e}")
            return []
    
    async def update_user_status(self, user_id: str, status: UserStatus) -> bool:
        """Update user status (admin function)"""
        return await self.update(user_id, {'status': status.value})
    
    async def get_user_stats(self) -> Dict[str, int]:
        """Get user statistics"""
        try:
            all_users = await self.get_all()
            
            stats = {
                'total_users': len(all_users),
                'active_users': 0,
                'pending_users': 0,
                'clients': 0,
                'cleaners': 0,
                'admins': 0
            }
            
            for user in all_users:
                status = user.get('status')
                role = user.get('role')
                
                if status == UserStatus.ACTIVE.value:
                    stats['active_users'] += 1
                elif status == UserStatus.PENDING_VERIFICATION.value:
                    stats['pending_users'] += 1
                
                if role == UserRole.CLIENT.value:
                    stats['clients'] += 1
                elif role == UserRole.CLEANER.value:
                    stats['cleaners'] += 1
                elif role == UserRole.ADMIN.value:
                    stats['admins'] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {}


# Global repository instance
user_repository = UserRepository()