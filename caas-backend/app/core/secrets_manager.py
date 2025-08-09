"""
Secure secrets management using Google Cloud Secret Manager
Production-grade implementation for CAAS authentication system
"""

import logging
from typing import Optional, Dict
from google.cloud import secretmanager
from google.auth import default
import os
from functools import lru_cache

logger = logging.getLogger(__name__)

class SecretManagerService:
    """Secure secret management service using Google Cloud Secret Manager"""
    
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or os.getenv('GOOGLE_CLOUD_PROJECT', 'caas-467918')
        try:
            self.client = secretmanager.SecretManagerServiceClient()
            logger.info(f"SecretManager client initialized for project: {self.project_id}")
        except Exception as e:
            logger.error(f"Failed to initialize SecretManager client: {e}")
            raise
    
    @lru_cache(maxsize=10)  # Cache secrets for performance
    def get_secret(self, secret_name: str, version: str = "latest") -> str:
        """
        Retrieve secret from Google Cloud Secret Manager
        
        Args:
            secret_name: Name of the secret
            version: Version of the secret (default: latest)
            
        Returns:
            Secret value as string
            
        Raises:
            Exception: If secret retrieval fails
        """
        try:
            name = f"projects/{self.project_id}/secrets/{secret_name}/versions/{version}"
            response = self.client.access_secret_version(request={"name": name})
            secret_value = response.payload.data.decode("UTF-8")
            
            logger.info(f"Successfully retrieved secret: {secret_name}")
            return secret_value
            
        except Exception as e:
            logger.error(f"Failed to retrieve secret '{secret_name}': {e}")
            # In production, we want to fail fast for missing secrets
            raise Exception(f"Critical: Unable to retrieve secret '{secret_name}'")
    
    def get_jwt_signing_key(self) -> str:
        """Get JWT signing key from Secret Manager"""
        return self.get_secret("jwt-signing-key")
    
    def get_refresh_token_key(self) -> str:
        """Get refresh token signing key from Secret Manager"""
        return self.get_secret("refresh-token-key")
    
    def rotate_secret(self, secret_name: str, new_value: str) -> str:
        """
        Rotate a secret (create new version)
        
        Args:
            secret_name: Name of the secret to rotate
            new_value: New secret value
            
        Returns:
            Version ID of the new secret
        """
        try:
            parent = f"projects/{self.project_id}/secrets/{secret_name}"
            response = self.client.add_secret_version(
                request={
                    "parent": parent, 
                    "payload": {"data": new_value.encode("UTF-8")}
                }
            )
            
            logger.warning(f"Secret rotated: {secret_name} -> version {response.name}")
            # Clear cache after rotation
            self.get_secret.cache_clear()
            
            return response.name.split('/')[-1]
            
        except Exception as e:
            logger.error(f"Failed to rotate secret '{secret_name}': {e}")
            raise

# Global instance for the application
secret_manager = SecretManagerService()

def get_secret_manager() -> SecretManagerService:
    """Get global SecretManager instance"""
    return secret_manager

# Convenience functions for common secrets
def get_jwt_secret() -> str:
    """Get JWT signing secret from Secret Manager"""
    return secret_manager.get_jwt_signing_key()

def get_refresh_secret() -> str:
    """Get refresh token secret from Secret Manager"""
    return secret_manager.get_refresh_token_key()