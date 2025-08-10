"""
Enterprise-grade security using Cloud KMS for JWT signing
This implements asymmetric signing (RS256/ES256) where the private key never leaves KMS
"""
import logging
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from functools import lru_cache
import hashlib

logger = logging.getLogger(__name__)

class KMSSecurityService:
    """
    Cloud KMS-based JWT signing service
    Private keys never leave KMS - we only request signatures
    """
    
    def __init__(self):
        self.project_id = "caas-467918"
        self.location = "global"  # or "us-central1" for regional
        self.key_ring = "caas-auth-keys"
        self.signing_key = "jwt-signing-key"
        self.algorithm = "RS256"  # RSA with SHA-256
        
        # Key versioning for rotation
        self.current_version = None
        self.previous_version = None  # Keep for verification during rotation
        
        # Cache KMS client
        self._kms_client = None
        
    def _get_kms_client(self):
        """Lazy load KMS client"""
        if not self._kms_client:
            try:
                from google.cloud import kms
                self._kms_client = kms.KeyManagementServiceClient()
                logger.info("KMS client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize KMS client: {e}")
                raise
        return self._kms_client
    
    def _get_key_name(self, version: Optional[int] = None) -> str:
        """Get the full resource name for the KMS key"""
        key_name = (
            f"projects/{self.project_id}/locations/{self.location}/"
            f"keyRings/{self.key_ring}/cryptoKeys/{self.signing_key}"
        )
        
        if version:
            key_name += f"/cryptoKeyVersions/{version}"
        else:
            # Use primary version
            key_name += "/cryptoKeyVersions/1"
            
        return key_name
    
    def create_jwt_with_kms(self, payload: Dict[str, Any]) -> str:
        """
        Create a JWT using Cloud KMS for signing
        The private key never leaves KMS
        """
        try:
            import jwt
            from google.cloud import kms
            
            # Prepare the JWT header and payload
            header = {
                "alg": self.algorithm,
                "typ": "JWT",
                "kid": self._get_key_name()  # Key ID for verification
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
            
            # Calculate digest based on algorithm
            if self.algorithm == "RS256":
                digest = hashlib.sha256(message_bytes).digest()
                digest_obj = {"sha256": digest}
            elif self.algorithm == "ES256":
                digest = hashlib.sha256(message_bytes).digest()
                digest_obj = {"sha256": digest}
            else:
                raise ValueError(f"Unsupported algorithm: {self.algorithm}")
            
            # Request signature from KMS
            client = self._get_kms_client()
            key_name = self._get_key_name(self.current_version)
            
            sign_response = client.asymmetric_sign(
                request={
                    "name": key_name,
                    "digest": digest_obj
                }
            )
            
            # Encode the signature
            signature = base64.urlsafe_b64encode(
                sign_response.signature
            ).rstrip(b'=').decode()
            
            # Combine to create the JWT
            jwt_token = f"{message}.{signature}"
            
            logger.info(f"JWT created using KMS key: {key_name}")
            return jwt_token
            
        except Exception as e:
            logger.error(f"Failed to create JWT with KMS: {e}")
            raise
    
    def verify_jwt_with_kms(self, token: str) -> Dict[str, Any]:
        """
        Verify a JWT using the public key from KMS
        Supports multiple key versions for rotation
        """
        try:
            import jwt
            from google.cloud import kms
            
            # Parse the token to get the header
            parts = token.split('.')
            if len(parts) != 3:
                raise ValueError("Invalid JWT format")
            
            header = json.loads(
                base64.urlsafe_b64decode(parts[0] + '==')
            )
            
            # Get the key ID from the header
            kid = header.get('kid')
            if not kid:
                raise ValueError("No key ID in JWT header")
            
            # Get the public key from KMS
            client = self._get_kms_client()
            public_key_response = client.get_public_key(
                request={"name": kid}
            )
            
            # Verify the signature using the public key
            public_key = public_key_response.pem
            
            # Use PyJWT for verification with the public key
            decoded = jwt.decode(
                token,
                public_key,
                algorithms=[self.algorithm],
                options={"verify_signature": True}
            )
            
            logger.info(f"JWT verified successfully with key: {kid}")
            return decoded
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT has expired")
            raise
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to verify JWT with KMS: {e}")
            raise
    
    def rotate_signing_key(self) -> Tuple[str, str]:
        """
        Rotate to a new key version
        Returns (new_version, old_version) for coordinated rotation
        """
        try:
            client = self._get_kms_client()
            
            # Create a new key version
            parent = (
                f"projects/{self.project_id}/locations/{self.location}/"
                f"keyRings/{self.key_ring}/cryptoKeys/{self.signing_key}"
            )
            
            # Create new version
            version_response = client.create_crypto_key_version(
                request={
                    "parent": parent,
                    "crypto_key_version": {
                        "state": "ENABLED"
                    }
                }
            )
            
            new_version = version_response.name.split('/')[-1]
            old_version = self.current_version or "1"
            
            # Update version tracking
            self.previous_version = old_version
            self.current_version = new_version
            
            logger.warning(f"Key rotation: {old_version} -> {new_version}")
            logger.info("Keep both versions active during transition period")
            
            return new_version, old_version
            
        except Exception as e:
            logger.error(f"Failed to rotate key: {e}")
            raise


class SecretManagerSecurityService:
    """
    Secure secret loading with least-privilege access
    Implements runtime loading with proper IAM controls
    """
    
    def __init__(self):
        self.project_id = "caas-467918"
        self._client = None
        self._secret_cache = {}
        self._cache_ttl = 300  # 5 minutes
        self._cache_timestamps = {}
        
        # Define which service account can access which secrets
        self.secret_permissions = {
            "jwt-signing-key": ["caas-backend@caas-467918.iam.gserviceaccount.com"],
            "refresh-token-key": ["caas-backend@caas-467918.iam.gserviceaccount.com"],
            "STRIPE_SECRET_KEY": ["caas-backend@caas-467918.iam.gserviceaccount.com"],
            "STRIPE_WEBHOOK_SECRET": ["caas-backend@caas-467918.iam.gserviceaccount.com"],
        }
    
    def _get_client(self):
        """Lazy load Secret Manager client"""
        if not self._client:
            try:
                from google.cloud import secretmanager
                self._client = secretmanager.SecretManagerServiceClient()
                logger.info("Secret Manager client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Secret Manager: {e}")
                raise
        return self._client
    
    def mount_secret_as_file(self, secret_name: str, mount_path: str = "/secrets"):
        """
        Mount secret as a file for Cloud Run
        This is more secure than environment variables
        """
        import os
        
        secret_path = os.path.join(mount_path, secret_name)
        
        # In Cloud Run, secrets can be mounted as files
        if os.path.exists(secret_path):
            with open(secret_path, 'r') as f:
                secret_value = f.read().strip()
                logger.info(f"Loaded secret from mounted file: {secret_path}")
                return secret_value
        else:
            # Fallback to Secret Manager API
            return self.get_secret_at_runtime(secret_name)
    
    def get_secret_at_runtime(self, secret_name: str) -> str:
        """
        Fetch secret at runtime with caching
        Only the runtime service account should have access
        """
        try:
            # Check cache
            if secret_name in self._secret_cache:
                cached_time = self._cache_timestamps.get(secret_name, 0)
                if (datetime.now().timestamp() - cached_time) < self._cache_ttl:
                    logger.debug(f"Secret {secret_name} loaded from cache")
                    return self._secret_cache[secret_name]
            
            # Load from Secret Manager
            client = self._get_client()
            name = f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"
            
            response = client.access_secret_version(request={"name": name})
            secret_value = response.payload.data.decode("UTF-8")
            
            # Cache the secret
            self._secret_cache[secret_name] = secret_value
            self._cache_timestamps[secret_name] = datetime.now().timestamp()
            
            # Log access for audit
            logger.info(f"Secret {secret_name} loaded from Secret Manager")
            
            return secret_value
            
        except Exception as e:
            logger.error(f"Failed to load secret {secret_name}: {e}")
            # Log potential permission issue
            if "403" in str(e) or "PERMISSION_DENIED" in str(e):
                logger.error(f"Permission denied. Ensure service account has secretmanager.secretAccessor on {secret_name}")
            raise
    
    def setup_iam_policies(self):
        """
        Configure least-privilege IAM policies for secrets
        This should be run once during initial setup
        """
        try:
            from google.cloud import secretmanager
            from google.iam.v1 import iam_policy_pb2, policy_pb2
            
            client = self._get_client()
            
            for secret_name, allowed_accounts in self.secret_permissions.items():
                resource_name = f"projects/{self.project_id}/secrets/{secret_name}"
                
                # Get current policy
                policy = client.get_iam_policy(
                    request={"resource": resource_name}
                )
                
                # Add secretAccessor role for specific service accounts
                for account in allowed_accounts:
                    member = f"serviceAccount:{account}"
                    role = "roles/secretmanager.secretAccessor"
                    
                    # Find or create binding
                    binding = None
                    for b in policy.bindings:
                        if b.role == role:
                            binding = b
                            break
                    
                    if not binding:
                        binding = policy_pb2.Binding()
                        binding.role = role
                        policy.bindings.append(binding)
                    
                    if member not in binding.members:
                        binding.members.append(member)
                        logger.info(f"Granted {role} on {secret_name} to {account}")
                
                # Update policy
                client.set_iam_policy(
                    request={
                        "resource": resource_name,
                        "policy": policy
                    }
                )
                
            logger.info("IAM policies configured for least-privilege access")
            
        except Exception as e:
            logger.error(f"Failed to setup IAM policies: {e}")
            raise


# Global instances
kms_service = KMSSecurityService()
secret_service = SecretManagerSecurityService()


def create_access_token_kms(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token using Cloud KMS"""
    payload = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    payload.update({
        "exp": expire.timestamp(),
        "iat": datetime.utcnow().timestamp(),
        "type": "access"
    })
    
    return kms_service.create_jwt_with_kms(payload)


def verify_token_kms(token: str) -> Dict[str, Any]:
    """Verify JWT token using Cloud KMS public key"""
    return kms_service.verify_jwt_with_kms(token)