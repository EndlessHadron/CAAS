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
    
    def create_user(self, user_data: UserCreate, hashed_password: str) -> Optional[str]:
        """Create a new user account"""
        try:
            # Generate unique user ID
            user_id = str(uuid.uuid4())
            
            # Check if email already exists
            existing_user = self.get_by_email(user_data.email)
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
            
            success = self.create(user_id, user_doc)
            return user_id if success else None
            
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            return None
    
    def create_user_dict(self, user_data: Dict[str, Any], hashed_password: str) -> Optional[str]:
        """Create a new user account from dictionary data (for enhanced security)"""
        try:
            # Generate unique user ID
            user_id = str(uuid.uuid4())
            
            # Check if email already exists
            existing_user = self.get_by_email(user_data['email'])
            if existing_user:
                logger.warning(f"Attempted to create user with existing email: {user_data['email']}")
                return None
            
            # Merge with default structure
            user_doc = {
                'uid': user_id,
                'password_hash': hashed_password,
                **user_data  # Include all provided data
            }
            
            # Ensure required fields exist
            if 'created_at' not in user_doc:
                from datetime import datetime
                user_doc['created_at'] = datetime.utcnow()
            if 'updated_at' not in user_doc:
                from datetime import datetime
                user_doc['updated_at'] = datetime.utcnow()
            
            success = self.create(user_id, user_doc)
            return user_id if success else None
            
        except Exception as e:
            logger.error(f"Failed to create user from dict: {e}")
            return None
    
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address"""
        return self.get_by_field('email', email)
    
    def get_user_with_password(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user with password hash for authentication"""
        return self.get_by_email(email)
    
    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Update user profile information"""
        try:
            # Get current user data
            current_user = self.get_by_id(user_id)
            if not current_user:
                return False
            
            # Update profile fields
            updated_profile = current_user.get('profile', {})
            updated_profile.update(profile_data)
            
            return self.update(user_id, {'profile': updated_profile})
            
        except Exception as e:
            logger.error(f"Failed to update user profile {user_id}: {e}")
            return False
    
    def update_client_profile(self, user_id: str, client_data: Dict[str, Any]) -> bool:
        """Update client-specific profile data"""
        try:
            current_user = self.get_by_id(user_id)
            if not current_user:
                return False
            
            if current_user.get('role') != UserRole.CLIENT.value:
                logger.warning(f"Attempted to update client profile for non-client user: {user_id}")
                return False
            
            # Update client profile fields
            updated_client_profile = current_user.get('client_profile', {})
            updated_client_profile.update(client_data)
            
            return self.update(user_id, {'client_profile': updated_client_profile})
            
        except Exception as e:
            logger.error(f"Failed to update client profile {user_id}: {e}")
            return False
    
    def update_cleaner_profile(self, user_id: str, cleaner_data: Dict[str, Any]) -> bool:
        """Update cleaner-specific profile data"""
        try:
            current_user = self.get_by_id(user_id)
            if not current_user:
                return False
            
            if current_user.get('role') != UserRole.CLEANER.value:
                logger.warning(f"Attempted to update cleaner profile for non-cleaner user: {user_id}")
                return False
            
            # Update cleaner profile fields
            updated_cleaner_profile = current_user.get('cleaner_profile', {})
            updated_cleaner_profile.update(cleaner_data)
            
            return self.update(user_id, {'cleaner_profile': updated_cleaner_profile})
            
        except Exception as e:
            logger.error(f"Failed to update cleaner profile {user_id}: {e}")
            return False
    
    def get_user_with_role_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user with their role-specific profile data"""
        try:
            user = self.get_by_id(user_id)
            if not user:
                return None
            
            user_role = user.get('role')
            
            # Initialize role-specific profile if it doesn't exist
            if user_role == UserRole.CLIENT.value and 'client_profile' not in user:
                self.update(user_id, {'client_profile': {}})
                user['client_profile'] = {}
            elif user_role == UserRole.CLEANER.value and 'cleaner_profile' not in user:
                self.update(user_id, {'cleaner_profile': {}})
                user['cleaner_profile'] = {}
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to get user with role profile {user_id}: {e}")
            return None
    
    def update_verification_status(self, user_id: str, verification_type: str, status: bool) -> bool:
        """Update user verification status"""
        try:
            current_user = self.get_by_id(user_id)
            if not current_user:
                return False
            
            verification = current_user.get('verification', {})
            verification[verification_type] = status
            
            # If email is verified, update user status
            update_data = {'verification': verification}
            if verification_type == 'email' and status:
                update_data['status'] = UserStatus.ACTIVE.value
            
            return self.update(user_id, update_data)
            
        except Exception as e:
            logger.error(f"Failed to update verification for {user_id}: {e}")
            return False
    
    def update_last_active(self, user_id: str) -> bool:
        """Update user's last active timestamp"""
        from datetime import datetime
        return self.update(user_id, {'last_active': datetime.utcnow()})
    
    def get_users_by_role(self, role: UserRole, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by role"""
        return self.get_many_by_field('role', role.value, limit)
    
    def get_users_by_status(self, status: UserStatus, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by status"""
        return self.get_many_by_field('status', status.value, limit)
    
    def search_users_by_name(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search users by first name or last name"""
        try:
            # Firestore doesn't support full-text search, so we'll do a simple prefix match
            # In production, you might want to use Algolia or Elasticsearch
            
            results = []
            search_lower = search_term.lower()
            
            # Get all users (this is not efficient for large datasets)
            all_users = self.get_all()
            
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
    
    def update_user_status(self, user_id: str, status: UserStatus) -> bool:
        """Update user status (admin function)"""
        return self.update(user_id, {'status': status.value})
    
    def get_user_stats(self) -> Dict[str, int]:
        """Get user statistics"""
        try:
            all_users = self.get_all()
            
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