"""
Centralized secure secrets management service
CRITICAL: This is the ONLY place where secrets should be loaded
No environment variables, no hardcoded values, only secure storage
"""

import logging
from typing import Optional, Dict, Any
from functools import lru_cache
from datetime import datetime

logger = logging.getLogger(__name__)


class SecureSecretsService:
    """
    Centralized service for loading secrets from secure storage.
    Uses Firestore as primary source with Secret Manager as fallback.
    """
    
    def __init__(self):
        self._secrets_cache: Dict[str, Any] = {}
        self._cache_timestamp: Optional[datetime] = None
        self._cache_ttl_seconds = 300  # 5 minutes cache
        self._audit_log = []
        
    def _log_access(self, secret_name: str, source: str, success: bool):
        """Audit log for secret access"""
        entry = {
            "timestamp": datetime.utcnow(),
            "secret_name": secret_name,
            "source": source,
            "success": success
        }
        self._audit_log.append(entry)
        
        if success:
            logger.info(f"Secret '{secret_name}' loaded from {source}")
        else:
            logger.warning(f"Failed to load secret '{secret_name}' from {source}")
    
    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid"""
        if not self._cache_timestamp:
            return False
        
        age = (datetime.utcnow() - self._cache_timestamp).total_seconds()
        return age < self._cache_ttl_seconds
    
    def _load_from_firestore(self) -> Dict[str, Any]:
        """Load all secrets from Firestore with proper error handling"""
        try:
            from app.core.database import get_firestore_client, FirestoreCollections
            db = get_firestore_client()
            
            # Log the exact collection path being used
            collection_path = FirestoreCollections.PLATFORM_SETTINGS
            logger.info(f"Loading secrets from Firestore: {collection_path}/secrets")
            
            secrets_doc = db.collection(collection_path).document('secrets').get()
            
            if secrets_doc.exists:
                secrets_data = secrets_doc.to_dict()
                logger.info(f"Successfully loaded {len(secrets_data)} secrets from Firestore")
                self._log_access("all_secrets", "Firestore", True)
                return secrets_data
            else:
                logger.warning(f"Secrets document not found at {collection_path}/secrets")
                self._log_access("all_secrets", "Firestore", False)
                # Don't return empty dict - let it fall through to Secret Manager
                return None
                
        except Exception as e:
            logger.error(f"Failed to load secrets from Firestore: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            self._log_access("all_secrets", "Firestore", False)
            # Return None to trigger Secret Manager fallback
            return None
    
    def _get_from_secret_manager(self, secret_name: str) -> Optional[str]:
        """Get a specific secret from Google Secret Manager"""
        try:
            from app.core.secrets_manager import SecretManagerService
            secret_manager = SecretManagerService()
            
            value = secret_manager.get_secret(secret_name)
            self._log_access(secret_name, "SecretManager", True)
            return value
            
        except Exception as e:
            logger.error(f"Failed to load '{secret_name}' from Secret Manager: {e}")
            self._log_access(secret_name, "SecretManager", False)
            return None
    
    def get_secret(self, secret_name: str, required: bool = True) -> Optional[str]:
        """
        Get a secret value by name.
        
        Args:
            secret_name: Name of the secret to retrieve
            required: If True, raises RuntimeError if secret not found
            
        Returns:
            Secret value or None if not found and not required
            
        Raises:
            RuntimeError: If required=True and secret not found
        """
        # Refresh cache if needed
        if not self._is_cache_valid():
            firestore_secrets = self._load_from_firestore()
            if firestore_secrets is not None:
                self._secrets_cache = firestore_secrets
                self._cache_timestamp = datetime.utcnow()
            else:
                # Firestore failed, keep cache empty to force Secret Manager lookup
                self._secrets_cache = {}
                self._cache_timestamp = None  # Don't cache failures
        
        # Try to get from cache (Firestore)
        value = self._secrets_cache.get(secret_name)
        
        # If not in Firestore, try Secret Manager
        if not value:
            # Map common secret names to Secret Manager names
            secret_manager_map = {
                'jwt_secret_key': 'jwt-signing-key',
                'jwt_signing_key': 'jwt-signing-key',
                'refresh_secret_key': 'refresh-token-key',
                'refresh_token_key': 'refresh-token-key',
                'stripe_secret_key': 'STRIPE_SECRET_KEY',
                'stripe_publishable_key': 'STRIPE_PUBLISHABLE_KEY',
                'stripe_webhook_secret': 'STRIPE_WEBHOOK_SECRET',
            }
            
            sm_name = secret_manager_map.get(secret_name, secret_name)
            value = self._get_from_secret_manager(sm_name)
        
        # Handle required secrets
        if not value and required:
            logger.critical(f"CRITICAL: Required secret '{secret_name}' not found in any secure storage")
            raise RuntimeError(f"Required secret '{secret_name}' not configured - application cannot start securely")
        
        return value
    
    def get_jwt_secret(self) -> str:
        """Get JWT signing secret"""
        return self.get_secret('jwt_secret_key', required=True)
    
    def get_refresh_secret(self) -> str:
        """Get refresh token secret"""
        return self.get_secret('refresh_secret_key', required=True)
    
    def get_stripe_secret(self) -> Optional[str]:
        """Get Stripe API secret key"""
        # Try multiple possible field names
        for key_name in ['stripe_secret_key', 'stripe_api_key', 'stripe_key']:
            value = self.get_secret(key_name, required=False)
            if value:
                return value
        
        logger.error("Stripe secret key not found in secure storage")
        return None
    
    def get_stripe_webhook_secret(self) -> Optional[str]:
        """Get Stripe webhook signing secret"""
        return self.get_secret('stripe_webhook_secret', required=False)
    
    def get_audit_log(self) -> list:
        """Get audit log of secret access attempts"""
        return self._audit_log.copy()
    
    def clear_cache(self):
        """Clear the secrets cache - useful after rotation"""
        self._secrets_cache.clear()
        self._cache_timestamp = None
        logger.info("Secrets cache cleared")


# Global instance - use this everywhere
_secure_secrets = SecureSecretsService()


def get_secure_secrets() -> SecureSecretsService:
    """Get the global secure secrets service instance"""
    return _secure_secrets


# Convenience functions for common secrets
def get_jwt_secret() -> str:
    """Get JWT signing secret from secure storage"""
    return _secure_secrets.get_jwt_secret()


def get_refresh_secret() -> str:
    """Get refresh token secret from secure storage"""
    return _secure_secrets.get_refresh_secret()


def get_stripe_secret() -> Optional[str]:
    """Get Stripe API secret from secure storage"""
    return _secure_secrets.get_stripe_secret()


def get_stripe_webhook_secret() -> Optional[str]:
    """Get Stripe webhook secret from secure storage"""
    return _secure_secrets.get_stripe_webhook_secret()


def get_secret(name: str, required: bool = True) -> Optional[str]:
    """Get any secret by name from secure storage"""
    return _secure_secrets.get_secret(name, required)