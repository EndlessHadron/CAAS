from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from app.repositories.user_repository import user_repository
from app.models.users import UserCreate, UserUpdate, UserRole, UserStatus, User, UserResponse
from app.core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)


class UserService:
    """Service for user-related business logic"""
    
    def __init__(self):
        self.repository = user_repository
    
    async def create_user(self, user_data: UserCreate) -> Optional[str]:
        """Create a new user account"""
        try:
            # Hash the password
            hashed_password = get_password_hash(user_data.password)
            
            # Create user in database
            user_id = await self.repository.create_user(user_data, hashed_password)
            
            if user_id:
                logger.info(f"Created new user: {user_data.email} (ID: {user_id})")
                # TODO: Send welcome email
                # TODO: Send email verification
                return user_id
            else:
                logger.warning(f"Failed to create user: {user_data.email}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating user {user_data.email}: {e}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user login"""
        try:
            user = await self.repository.get_user_with_password(email)
            
            if not user:
                return None
            
            # Verify password
            if not verify_password(password, user['password_hash']):
                return None
            
            # Update last active
            await self.repository.update_last_active(user['uid'])
            
            # Remove password hash from response
            user_data = user.copy()
            del user_data['password_hash']
            
            return user_data
            
        except Exception as e:
            logger.error(f"Authentication error for {email}: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID (without password)"""
        try:
            user = await self.repository.get_by_id(user_id)
            
            if user and 'password_hash' in user:
                del user['password_hash']
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email (without password)"""
        try:
            user = await self.repository.get_by_email(email)
            
            if user and 'password_hash' in user:
                del user['password_hash']
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def update_user_profile(self, user_id: str, update_data: UserUpdate) -> bool:
        """Update user profile"""
        try:
            # Convert Pydantic model to dict, excluding None values
            profile_data = update_data.dict(exclude_none=True)
            
            if not profile_data:
                return True  # Nothing to update
            
            success = await self.repository.update_user_profile(user_id, profile_data)
            
            if success:
                logger.info(f"Updated profile for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating user profile {user_id}: {e}")
            return False
    
    async def verify_email(self, user_id: str) -> bool:
        """Mark user email as verified"""
        try:
            success = await self.repository.update_verification_status(user_id, 'email', True)
            
            if success:
                logger.info(f"Email verified for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error verifying email for user {user_id}: {e}")
            return False
    
    async def verify_phone(self, user_id: str, verification_code: str) -> bool:
        """Verify phone number with SMS code"""
        try:
            # TODO: Implement actual SMS verification logic
            # For now, accept any 6-digit code
            if len(verification_code) == 6 and verification_code.isdigit():
                success = await self.repository.update_verification_status(user_id, 'phone', True)
                
                if success:
                    logger.info(f"Phone verified for user {user_id}")
                
                return success
            
            return False
            
        except Exception as e:
            logger.error(f"Error verifying phone for user {user_id}: {e}")
            return False
    
    async def check_user_exists(self, email: str) -> bool:
        """Check if user with email exists"""
        try:
            user = await self.repository.get_by_email(email)
            return user is not None
            
        except Exception as e:
            logger.error(f"Error checking user existence {email}: {e}")
            return False
    
    async def get_users_by_role(self, role: UserRole, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by role (admin function)"""
        try:
            users = await self.repository.get_users_by_role(role, limit)
            
            # Remove password hashes
            for user in users:
                if 'password_hash' in user:
                    del user['password_hash']
            
            return users
            
        except Exception as e:
            logger.error(f"Error getting users by role {role}: {e}")
            return []
    
    async def search_users(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search users by name (admin function)"""
        try:
            users = await self.repository.search_users_by_name(search_term, limit)
            
            # Remove password hashes
            for user in users:
                if 'password_hash' in user:
                    del user['password_hash']
            
            return users
            
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            return []
    
    async def update_user_status(self, user_id: str, status: UserStatus) -> bool:
        """Update user status (admin function)"""
        try:
            success = await self.repository.update_user_status(user_id, status)
            
            if success:
                logger.info(f"Updated status for user {user_id} to {status.value}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating user status {user_id}: {e}")
            return False
    
    async def get_user_statistics(self) -> Dict[str, int]:
        """Get user statistics (admin function)"""
        try:
            return await self.repository.get_user_stats()
            
        except Exception as e:
            logger.error(f"Error getting user statistics: {e}")
            return {}
    
    def format_user_response(self, user_data: Dict[str, Any]) -> UserResponse:
        """Format user data as UserResponse model"""
        try:
            profile = user_data.get('profile', {})
            verification = user_data.get('verification', {})
            
            return UserResponse(
                uid=user_data['uid'],
                email=user_data['email'],
                role=UserRole(user_data['role']),
                status=UserStatus(user_data['status']),
                profile={
                    'first_name': profile.get('first_name', ''),
                    'last_name': profile.get('last_name', ''),
                    'phone': profile.get('phone'),
                    'address': profile.get('address'),
                    'avatar_url': profile.get('avatar_url'),
                    'bio': profile.get('bio')
                },
                verification={
                    'email': verification.get('email', False),
                    'phone': verification.get('phone', False),
                    'identity': verification.get('identity', False),
                    'background': verification.get('background', False)
                },
                created_at=user_data.get('created_at'),
                last_active=user_data.get('last_active')
            )
            
        except Exception as e:
            logger.error(f"Error formatting user response: {e}")
            raise


# Global service instance
user_service = UserService()