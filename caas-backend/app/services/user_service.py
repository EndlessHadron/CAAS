from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from app.repositories.user_repository import user_repository
from app.models.users import UserCreate, UserUpdate, UserRole, UserStatus, User, UserResponse, ClientProfileUpdate, CleanerProfileUpdate, ClientResponse, CleanerResponse, ClientProfile, CleanerProfile
from app.core.security import get_password_hash, verify_password
from app.core.security_enhanced import security_service

logger = logging.getLogger(__name__)


class UserService:
    """Service for user-related business logic"""
    
    def __init__(self):
        self.repository = user_repository
    
    def create_user(self, user_data) -> Optional[str]:
        """Create a new user account with enhanced security support"""
        try:
            # Support both UserCreate objects and dictionary data
            if isinstance(user_data, dict) and 'password_hash' in user_data:
                # Pre-hashed password from secure registration
                hashed_password = user_data['password_hash']
                # Remove from data to avoid duplication
                user_data_dict = dict(user_data)
                del user_data_dict['password_hash']
                
                # Create user in database with enhanced data
                user_id = self.repository.create_user_dict(user_data_dict, hashed_password)
            else:
                # Legacy flow with basic password hashing
                if hasattr(user_data, 'password'):
                    hashed_password = get_password_hash(user_data.password)
                    user_id = self.repository.create_user(user_data, hashed_password)
                else:
                    logger.error("No password provided for user creation")
                    return None
            
            if user_id:
                email = user_data['email'] if isinstance(user_data, dict) else user_data.email
                logger.info(f"Created new user: {email} (ID: {user_id})")
                # TODO: Send welcome email
                # TODO: Send email verification
                return user_id
            else:
                email = user_data['email'] if isinstance(user_data, dict) else user_data.email
                logger.warning(f"Failed to create user: {email}")
                return None
                
        except Exception as e:
            email = user_data['email'] if isinstance(user_data, dict) else getattr(user_data, 'email', 'unknown')
            logger.error(f"Error creating user {email}: {e}")
            return None
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user login with enhanced security"""
        try:
            user = self.repository.get_user_with_password(email)
            
            if not user:
                return None
            
            # Use enhanced password verification if available
            password_valid = False
            try:
                # Try enhanced security service first
                password_valid = security_service.verify_password(password, user['password_hash'])
            except Exception as e:
                logger.debug(f"Enhanced verification failed, falling back to basic: {e}")
                # Fallback to basic verification
                password_valid = verify_password(password, user['password_hash'])
            
            if not password_valid:
                return None
            
            # Update last active
            self.update_last_active(user['uid'])
            
            # Remove password hash from response
            user_data = user.copy()
            del user_data['password_hash']
            
            return user_data
            
        except Exception as e:
            logger.error(f"Authentication error for {email}: {e}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID (without password)"""
        try:
            user = self.repository.get_by_id(user_id)
            
            if user and 'password_hash' in user:
                del user['password_hash']
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email (without password)"""
        try:
            user = self.repository.get_by_email(email)
            
            if user and 'password_hash' in user:
                del user['password_hash']
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    def update_user_profile(self, user_id: str, update_data: UserUpdate) -> bool:
        """Update user profile"""
        try:
            # Convert Pydantic model to dict, excluding None values
            profile_data = update_data.dict(exclude_none=True)
            
            if not profile_data:
                return True  # Nothing to update
            
            success = self.repository.update_user_profile(user_id, profile_data)
            
            if success:
                logger.info(f"Updated profile for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating user profile {user_id}: {e}")
            return False
    
    def verify_email(self, user_id: str) -> bool:
        """Mark user email as verified"""
        try:
            success = self.repository.update_verification_status(user_id, 'email', True)
            
            if success:
                logger.info(f"Email verified for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error verifying email for user {user_id}: {e}")
            return False
    
    def verify_phone(self, user_id: str, verification_code: str) -> bool:
        """Verify phone number with SMS code"""
        try:
            # TODO: Implement actual SMS verification logic
            # For now, accept any 6-digit code
            if len(verification_code) == 6 and verification_code.isdigit():
                success = self.repository.update_verification_status(user_id, 'phone', True)
                
                if success:
                    logger.info(f"Phone verified for user {user_id}")
                
                return success
            
            return False
            
        except Exception as e:
            logger.error(f"Error verifying phone for user {user_id}: {e}")
            return False
    
    def check_user_exists(self, email: str) -> bool:
        """Check if user with email exists"""
        try:
            user = self.repository.get_by_email(email)
            return user is not None
            
        except Exception as e:
            logger.error(f"Error checking user existence {email}: {e}")
            return False
    
    def get_users_by_role(self, role: UserRole, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get users by role (admin function)"""
        try:
            users = self.repository.get_users_by_role(role, limit)
            
            # Remove password hashes
            for user in users:
                if 'password_hash' in user:
                    del user['password_hash']
            
            return users
            
        except Exception as e:
            logger.error(f"Error getting users by role {role}: {e}")
            return []
    
    def search_users(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search users by name (admin function)"""
        try:
            users = self.repository.search_users_by_name(search_term, limit)
            
            # Remove password hashes
            for user in users:
                if 'password_hash' in user:
                    del user['password_hash']
            
            return users
            
        except Exception as e:
            logger.error(f"Error searching users: {e}")
            return []
    
    def update_user_status(self, user_id: str, status: UserStatus) -> bool:
        """Update user status (admin function)"""
        try:
            success = self.repository.update_user_status(user_id, status)
            
            if success:
                logger.info(f"Updated status for user {user_id} to {status.value}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating user status {user_id}: {e}")
            return False
    
    def get_user_statistics(self) -> Dict[str, int]:
        """Get user statistics (admin function)"""
        try:
            return self.repository.get_user_stats()
            
        except Exception as e:
            logger.error(f"Error getting user statistics: {e}")
            return {}
    
    def update_client_profile(self, user_id: str, update_data: ClientProfileUpdate) -> bool:
        """Update client-specific profile"""
        try:
            # Convert Pydantic model to dict, excluding None values
            profile_data = update_data.dict(exclude_none=True)
            
            if not profile_data:
                return True  # Nothing to update
            
            # Separate basic profile data from client-specific data
            basic_fields = {'first_name', 'last_name', 'phone', 'address', 'bio'}
            basic_profile_data = {k: v for k, v in profile_data.items() if k in basic_fields}
            client_profile_data = {k: v for k, v in profile_data.items() if k not in basic_fields}
            
            success = True
            
            # Update basic profile if needed
            if basic_profile_data:
                success = self.repository.update_user_profile(user_id, basic_profile_data)
            
            # Update client-specific profile if needed
            if client_profile_data and success:
                success = self.repository.update_client_profile(user_id, client_profile_data)
            
            if success:
                logger.info(f"Updated client profile for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating client profile {user_id}: {e}")
            return False
    
    def update_cleaner_profile(self, user_id: str, update_data: CleanerProfileUpdate) -> bool:
        """Update cleaner-specific profile"""
        try:
            # Convert Pydantic model to dict, excluding None values
            profile_data = update_data.dict(exclude_none=True)
            
            if not profile_data:
                return True  # Nothing to update
            
            # Separate basic profile data from cleaner-specific data
            basic_fields = {'first_name', 'last_name', 'phone', 'address', 'bio'}
            basic_profile_data = {k: v for k, v in profile_data.items() if k in basic_fields}
            cleaner_profile_data = {k: v for k, v in profile_data.items() if k not in basic_fields}
            
            success = True
            
            # Update basic profile if needed
            if basic_profile_data:
                success = self.repository.update_user_profile(user_id, basic_profile_data)
            
            # Update cleaner-specific profile if needed
            if cleaner_profile_data and success:
                success = self.repository.update_cleaner_profile(user_id, cleaner_profile_data)
            
            if success:
                logger.info(f"Updated cleaner profile for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error updating cleaner profile {user_id}: {e}")
            return False
    
    def get_user_with_role_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user with role-specific profile data"""
        try:
            user = self.repository.get_user_with_role_profile(user_id)
            
            if user and 'password_hash' in user:
                del user['password_hash']
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting user with role profile {user_id}: {e}")
            return None
    
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
    
    def format_client_response(self, user_data: Dict[str, Any]) -> ClientResponse:
        """Format user data as ClientResponse model"""
        try:
            profile = user_data.get('profile', {})
            client_profile = user_data.get('client_profile', {})
            verification = user_data.get('verification', {})
            
            return ClientResponse(
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
                client_profile=ClientProfile(**client_profile) if client_profile else None,
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
            logger.error(f"Error formatting client response: {e}")
            raise
    
    def format_cleaner_response(self, user_data: Dict[str, Any]) -> CleanerResponse:
        """Format user data as CleanerResponse model"""
        try:
            profile = user_data.get('profile', {})
            cleaner_profile = user_data.get('cleaner_profile', {})
            verification = user_data.get('verification', {})
            
            return CleanerResponse(
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
                cleaner_profile=CleanerProfile(**cleaner_profile) if cleaner_profile else None,
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
            logger.error(f"Error formatting cleaner response: {e}")
            raise


    def update_last_active(self, user_id: str) -> bool:
        """Update user's last active timestamp"""
        try:
            return self.repository.update_last_active(user_id)
        except Exception as e:
            logger.error(f"Error updating last active for user {user_id}: {e}")
            return False

# Global service instance
user_service = UserService()