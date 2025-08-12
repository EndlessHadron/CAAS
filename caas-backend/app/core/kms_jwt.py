"""
Simplified KMS-based JWT implementation for production use
"""
import logging
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt

logger = logging.getLogger(__name__)

class KMSJWTService:
    """
    Production-ready JWT service using Cloud KMS for signing
    Falls back to symmetric keys if KMS is unavailable
    """
    
    def __init__(self):
        self.kms_enabled = False
        self.kms_client = None
        self.project_id = "caas-467918"
        self.location = "global"
        self.key_ring = "caas-auth-keys"
        self.signing_key = "jwt-signing-key"
        self.algorithm = "RS256"
        self._public_key_cache = None
        self._cache_time = None
        self._cache_ttl = 3600  # 1 hour cache for public key
        
        # Try to initialize KMS
        try:
            from google.cloud import kms
            self.kms_client = kms.KeyManagementServiceClient()
            self.kms_enabled = True
            logger.info("KMS client initialized for JWT signing")
        except Exception as e:
            logger.warning(f"KMS not available, falling back to symmetric keys: {e}")
    
    def _get_key_name(self) -> str:
        """Get the full resource name for the KMS key"""
        return (
            f"projects/{self.project_id}/locations/{self.location}/"
            f"keyRings/{self.key_ring}/cryptoKeys/{self.signing_key}"
        )
    
    def _get_public_key(self) -> str:
        """Get and cache the public key from KMS"""
        if not self.kms_enabled:
            return None
            
        # Check cache
        if self._public_key_cache and self._cache_time:
            if (datetime.utcnow() - self._cache_time).seconds < self._cache_ttl:
                return self._public_key_cache
        
        try:
            # Get the public key from KMS
            key_name = self._get_key_name() + "/cryptoKeyVersions/1"
            response = self.kms_client.get_public_key(request={"name": key_name})
            
            self._public_key_cache = response.pem
            self._cache_time = datetime.utcnow()
            
            logger.info("Public key retrieved from KMS and cached")
            return self._public_key_cache
        except Exception as e:
            logger.error(f"Failed to get public key from KMS: {e}")
            return None
    
    def create_token_with_kms(self, payload: Dict[str, Any]) -> str:
        """
        Create a JWT using Cloud KMS for signing
        The private key never leaves KMS
        """
        if not self.kms_enabled:
            # Fall back to symmetric key
            from app.core.secure_secrets import get_secure_secrets
            secret_service = get_secure_secrets()
            jwt_secret = secret_service.get_secret('jwt_secret_key')
            return jwt.encode(payload, jwt_secret, algorithm="HS256")
        
        try:
            import hashlib
            
            # Get the public key to include in header
            public_key = self._get_public_key()
            if not public_key:
                raise ValueError("Could not get public key from KMS")
            
            # Prepare the JWT header and payload
            header = {
                "alg": self.algorithm,
                "typ": "JWT",
                "kid": self._get_key_name() + "/cryptoKeyVersions/1"
            }
            
            # Encode header and payload
            header_encoded = base64.urlsafe_b64encode(
                json.dumps(header).encode()
            ).rstrip(b'=').decode()
            
            payload_encoded = base64.urlsafe_b64encode(
                json.dumps(payload).encode()
            ).rstrip(b'=').decode()
            
            # Create the message to sign
            message = f"{header_encoded}.{payload_encoded}"
            message_bytes = message.encode('utf-8')
            
            # Calculate digest for RSA signing
            digest = hashlib.sha256(message_bytes).digest()
            
            # Request signature from KMS
            key_name = self._get_key_name() + "/cryptoKeyVersions/1"
            sign_response = self.kms_client.asymmetric_sign(
                request={
                    "name": key_name,
                    "digest": {"sha256": digest}
                }
            )
            
            # Encode the signature
            signature = base64.urlsafe_b64encode(
                sign_response.signature
            ).rstrip(b'=').decode()
            
            # Combine to create the JWT
            jwt_token = f"{message}.{signature}"
            
            logger.debug("JWT created using KMS")
            return jwt_token
            
        except Exception as e:
            logger.error(f"Failed to create JWT with KMS: {e}")
            # Fall back to symmetric key
            from app.core.secure_secrets import get_secure_secrets
            secret_service = get_secure_secrets()
            jwt_secret = secret_service.get_secret('jwt_secret_key')
            return jwt.encode(payload, jwt_secret, algorithm="HS256")
    
    def verify_token_with_kms(self, token: str) -> Dict[str, Any]:
        """
        Verify a JWT using the public key from KMS
        Supports both KMS-signed and symmetric-signed tokens
        """
        # First, try to decode without verification to check the algorithm
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            header = jwt.get_unverified_header(token)
            
            # Check if this is a KMS-signed token
            if header.get('alg') == 'RS256' and 'kid' in header:
                # Verify with KMS public key
                if self.kms_enabled:
                    public_key = self._get_public_key()
                    if public_key:
                        return jwt.decode(
                            token,
                            public_key,
                            algorithms=[self.algorithm]
                        )
                
                # If KMS not available but token is RS256, we can't verify
                raise jwt.InvalidTokenError("KMS-signed token but KMS not available")
            
            # Otherwise, verify with symmetric key
            from app.core.secure_secrets import get_secure_secrets
            secret_service = get_secure_secrets()
            jwt_secret = secret_service.get_secret('jwt_secret_key')
            return jwt.decode(token, jwt_secret, algorithms=["HS256"])
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT has expired")
            raise
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to verify JWT: {e}")
            raise


# Global instance
kms_jwt_service = KMSJWTService()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token using Cloud KMS if available"""
    payload = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    payload.update({
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp()),
        "type": "access"
    })
    
    return kms_jwt_service.create_token_with_kms(payload)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create refresh token (uses symmetric key for now)"""
    from app.core.secure_secrets import get_secure_secrets
    
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    
    payload.update({
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp()),
        "type": "refresh"
    })
    
    # Refresh tokens use symmetric key for simplicity
    secret_service = get_secure_secrets()
    refresh_secret = secret_service.get_secret('refresh_secret_key')
    
    return jwt.encode(payload, refresh_secret, algorithm="HS256")


def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token using Cloud KMS if available"""
    return kms_jwt_service.verify_token_with_kms(token)


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """Verify refresh token (uses symmetric key)"""
    from app.core.secure_secrets import get_secure_secrets
    
    secret_service = get_secure_secrets()
    refresh_secret = secret_service.get_secret('refresh_secret_key')
    
    return jwt.decode(token, refresh_secret, algorithms=["HS256"])