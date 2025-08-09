from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Union
import logging

from app.core.security import verify_token
from app.services.user_service import user_service
from app.models.users import (
    UserRole, 
    ClientProfileUpdate, 
    CleanerProfileUpdate,
    ClientResponse,
    CleanerResponse,
    UserResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = verify_token(token, "access")
        user_id = payload.get("sub")
        user_role = payload.get("role")
        
        if not user_id or not user_role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        user = user_service.get_user_with_role_profile(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.get("/me", response_model=Union[ClientResponse, CleanerResponse, UserResponse])
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile with role-specific data"""
    try:
        user_role = current_user.get('role')
        
        if user_role == UserRole.CLIENT.value:
            return user_service.format_client_response(current_user)
        elif user_role == UserRole.CLEANER.value:
            return user_service.format_cleaner_response(current_user)
        else:
            return user_service.format_user_response(current_user)
        
    except Exception as e:
        logger.error(f"Failed to get profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )


@router.put("/me/client", response_model=ClientResponse)
async def update_client_profile(
    profile_data: ClientProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update client-specific profile"""
    try:
        # Check if user is a client
        if current_user.get('role') != UserRole.CLIENT.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only clients can update client profile"
            )
        
        user_id = current_user['uid']
        success = user_service.update_client_profile(user_id, profile_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update client profile"
            )
        
        # Get updated user data
        updated_user = user_service.get_user_with_role_profile(user_id)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve updated profile"
            )
        
        return user_service.format_client_response(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update client profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/me/cleaner", response_model=CleanerResponse)
async def update_cleaner_profile(
    profile_data: CleanerProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update cleaner-specific profile"""
    try:
        # Check if user is a cleaner
        if current_user.get('role') != UserRole.CLEANER.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only cleaners can update cleaner profile"
            )
        
        user_id = current_user['uid']
        success = user_service.update_cleaner_profile(user_id, profile_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update cleaner profile"
            )
        
        # Get updated user data
        updated_user = user_service.get_user_with_role_profile(user_id)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve updated profile"
            )
        
        return user_service.format_cleaner_response(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update cleaner profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/client/{user_id}", response_model=ClientResponse)
async def get_client_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a client's public profile (for cleaners to view)"""
    try:
        # Only allow cleaners and admins to view client profiles
        current_role = current_user.get('role')
        if current_role not in [UserRole.CLEANER.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        user = user_service.get_user_with_role_profile(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
        
        if user.get('role') != UserRole.CLIENT.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a client"
            )
        
        return user_service.format_client_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get client profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/cleaner/{user_id}", response_model=CleanerResponse)
async def get_cleaner_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a cleaner's public profile (for clients to view)"""
    try:
        # Allow clients and admins to view cleaner profiles
        current_role = current_user.get('role')
        if current_role not in [UserRole.CLIENT.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        user = user_service.get_user_with_role_profile(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cleaner not found"
            )
        
        if user.get('role') != UserRole.CLEANER.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a cleaner"
            )
        
        return user_service.format_cleaner_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get cleaner profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/cleaners/search")
async def search_cleaners(
    postcode: str = None,
    service_type: str = None,
    radius_miles: int = 10,
    min_rating: float = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Search for cleaners by location and criteria (for clients)"""
    try:
        # Only allow clients to search for cleaners
        if current_user.get('role') != UserRole.CLIENT.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only clients can search for cleaners"
            )
        
        # TODO: Implement proper location-based search with postcode and radius
        # For now, return all cleaners with basic filtering
        
        cleaners = user_service.get_users_by_role(UserRole.CLEANER, limit)
        
        # Filter by rating if specified
        if min_rating is not None:
            cleaners = [
                cleaner for cleaner in cleaners 
                if cleaner.get('cleaner_profile', {}).get('rating', 0) >= min_rating
            ]
        
        # Filter by service type if specified
        if service_type:
            cleaners = [
                cleaner for cleaner in cleaners
                if service_type.lower() in [
                    service.lower() for service in 
                    cleaner.get('cleaner_profile', {}).get('services_offered', [])
                ]
            ]
        
        # Format response
        formatted_cleaners = [
            user_service.format_cleaner_response(cleaner)
            for cleaner in cleaners
        ]
        
        return {
            "cleaners": formatted_cleaners,
            "total": len(formatted_cleaners),
            "filters": {
                "postcode": postcode,
                "service_type": service_type,
                "radius_miles": radius_miles,
                "min_rating": min_rating
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to search cleaners: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )