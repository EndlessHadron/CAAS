"""
Enhanced security module for production-grade authentication
Includes rate limiting, account lockout, and secure session management
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Request
import redis
import asyncio
from dataclasses import dataclass

# Temporarily use environment fallback while testing
# from app.core.secrets_manager import get_jwt_secret, get_refresh_secret
import os

def get_jwt_secret() -> str:
    """Get JWT secret with fallback to environment"""
    try:
        from app.core.secrets_manager import get_jwt_secret as get_secret_manager_jwt
        return get_secret_manager_jwt()
    except Exception as e:
        logger.warning(f"Secret Manager failed, using fallback: {e}")
        return os.getenv('JWT_SECRET_KEY', 'fallback-jwt-secret-key-change-in-production')

def get_refresh_secret() -> str:
    """Get refresh secret with fallback to environment"""
    try:
        from app.core.secrets_manager import get_refresh_secret as get_secret_manager_refresh
        return get_secret_manager_refresh()
    except Exception as e:
        logger.warning(f"Secret Manager failed, using fallback: {e}")
        return os.getenv('REFRESH_SECRET_KEY', 'fallback-refresh-secret-key-change-in-production')
from app.config import settings

logger = logging.getLogger(__name__)

# Enhanced password hashing with Argon2 (more secure than bcrypt)
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__memory_cost=102400,  # 100MB memory cost
    argon2__time_cost=2,         # 2 iterations
    argon2__parallelism=8,       # 8 parallel threads
    bcrypt__rounds=12            # Fallback bcrypt rounds
)

@dataclass
class TokenPair:
    """Secure token pair for authentication"""
    access_token: str
    refresh_token: str
    token_id: str
    expires_at: datetime

class SecurityService:
    """Enhanced security service with rate limiting and session management"""
    
    def __init__(self):
        # Initialize Redis for rate limiting and session storage
        self.redis_client = None
        self._init_redis()
        
        # Rate limiting thresholds
        self.LOGIN_RATE_LIMIT = 5      # Max attempts per window
        self.RATE_WINDOW = 900         # 15 minutes
        self.LOCKOUT_DURATION = 1800   # 30 minutes lockout
        
        # Token settings
        self.ACCESS_TOKEN_EXPIRE = timedelta(minutes=30)  # Reasonable for admin work
        self.REFRESH_TOKEN_EXPIRE = timedelta(days=7)     # Longer refresh tokens
        
    def _init_redis(self):
        """Initialize storage backend for rate limiting and session storage"""
        try:
            # Try Redis first (Google Cloud Memorystore)
            redis_host = getattr(settings, 'redis_host', 'localhost')
            redis_port = getattr(settings, 'redis_port', 6379)
            redis_timeout = getattr(settings, 'redis_timeout', 5)
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=0,
                decode_responses=True,
                socket_timeout=redis_timeout,
                socket_connect_timeout=redis_timeout,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test connection
            self.redis_client.ping()
            logger.info(f"Redis connected: {redis_host}:{redis_port}")
            self.storage_backend = 'redis'
            
        except Exception as e:
            logger.warning(f"Redis unavailable: {e}. Using Firestore for rate limiting.")
            # Production fallback: Use Firestore for rate limiting
            try:
                from app.core.database import get_firestore_client
                self.firestore_client = get_firestore_client()
                # Test Firestore connection
                test_ref = self.firestore_client.collection('_security_test').document('test')
                test_ref.set({'test': True})
                test_ref.delete()
                self.redis_client = None
                self.storage_backend = 'firestore'
                logger.info("Using Firestore for production-grade rate limiting")
            except Exception as fs_e:
                logger.error(f"Both Redis and Firestore failed: {fs_e}")
                self.redis_client = None
                self.firestore_client = None
                self.storage_backend = 'memory'
                logger.error("CRITICAL: Falling back to in-memory storage - NOT production-grade")
    
    async def check_rate_limit(self, identifier: str, request: Request) -> bool:
        """
        Production-grade rate limiting with multiple backend support
        
        Args:
            identifier: Email or IP address for rate limiting
            request: FastAPI request object
            
        Returns:
            True if within rate limit, False if exceeded
        """
        try:
            if self.storage_backend == 'redis':
                return await self._check_rate_limit_redis(identifier, request)
            elif self.storage_backend == 'firestore':
                return await self._check_rate_limit_firestore(identifier, request)
            else:
                # In-memory fallback with limited effectiveness
                return await self._check_rate_limit_memory(identifier, request)
                
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True  # Fail open for availability
    
    async def _check_rate_limit_redis(self, identifier: str, request: Request) -> bool:
        """Redis-based rate limiting"""
        try:
            rate_key = f"rate_limit:login:{identifier}"
            current_attempts = self.redis_client.get(rate_key)
            current_attempts = int(current_attempts) if current_attempts else 0
            
            if current_attempts >= self.LOGIN_RATE_LIMIT:
                await self._log_security_event("RATE_LIMIT_EXCEEDED", identifier, 
                                              {"attempts": current_attempts, "ip": request.client.host})
                return False
            return True
        except Exception as e:
            logger.error(f"Redis rate limiting failed: {e}")
            return True
    
    async def _check_rate_limit_firestore(self, identifier: str, request: Request) -> bool:
        """Firestore-based production rate limiting"""
        try:
            from datetime import datetime, timedelta
            import asyncio
            
            # Use Firestore for distributed rate limiting
            rate_doc_id = f"login_rate_{identifier.replace('@', '_at_').replace('.', '_dot_')}"
            rate_ref = self.firestore_client.collection('_security').document('rate_limits').collection('login').document(rate_doc_id)
            
            # Run in thread pool since Firestore client is sync
            def check_firestore_rate():
                doc = rate_ref.get()
                now = datetime.utcnow()
                window_start = now - timedelta(minutes=15)  # 15 minute window
                
                if doc.exists:
                    data = doc.to_dict()
                    last_reset = data.get('last_reset', datetime.min)
                    attempts = data.get('attempts', 0)
                    
                    # Reset if window expired
                    if last_reset < window_start:
                        attempts = 0
                    
                    if attempts >= self.LOGIN_RATE_LIMIT:
                        return False, attempts
                    
                    # Increment attempts
                    rate_ref.set({
                        'attempts': attempts + 1,
                        'last_reset': now,
                        'identifier': identifier,
                        'last_attempt': now
                    })
                    return True, attempts + 1
                else:
                    # First attempt
                    rate_ref.set({
                        'attempts': 1,
                        'last_reset': now,
                        'identifier': identifier,
                        'last_attempt': now
                    })
                    return True, 1
            
            # Execute in thread pool
            loop = asyncio.get_event_loop()
            allowed, attempts = await loop.run_in_executor(None, check_firestore_rate)
            
            if not allowed:
                await self._log_security_event("RATE_LIMIT_EXCEEDED", identifier, 
                                              {"attempts": attempts, "ip": request.client.host})
            
            return allowed
            
        except Exception as e:
            logger.error(f"Firestore rate limiting failed: {e}")
            return True
    
    async def _check_rate_limit_memory(self, identifier: str, request: Request) -> bool:
        """In-memory rate limiting (not production-grade but better than nothing)"""
        try:
            import time
            current_time = int(time.time())
            
            if not hasattr(self, '_rate_limit_cache'):
                self._rate_limit_cache = {}
            
            # Clean old entries
            cutoff_time = current_time - self.RATE_WINDOW
            self._rate_limit_cache = {k: v for k, v in self._rate_limit_cache.items() 
                                    if v.get('timestamp', 0) > cutoff_time}
            
            # Check current rate limit
            if identifier in self._rate_limit_cache:
                entry = self._rate_limit_cache[identifier]
                if entry['count'] >= self.LOGIN_RATE_LIMIT:
                    await self._log_security_event("RATE_LIMIT_EXCEEDED", identifier, 
                                                  {"attempts": entry['count'], "ip": request.client.host})
                    return False
                entry['count'] += 1
            else:
                self._rate_limit_cache[identifier] = {'count': 1, 'timestamp': current_time}
            
            return True
        except Exception as e:
            logger.error(f"Memory rate limiting failed: {e}")
            return True
    
    async def record_login_attempt(self, identifier: str, success: bool, request: Request):
        """
        Record login attempt for rate limiting and security monitoring
        
        Args:
            identifier: Email or IP address
            success: Whether login was successful
            request: FastAPI request object
        """
        try:
            if self.storage_backend == 'redis':
                await self._record_login_attempt_redis(identifier, success, request)
            elif self.storage_backend == 'firestore':
                await self._record_login_attempt_firestore(identifier, success, request)
            else:
                await self._record_login_attempt_memory(identifier, success, request)
                
        except Exception as e:
            logger.error(f"Failed to record login attempt: {e}")
    
    async def _record_login_attempt_redis(self, identifier: str, success: bool, request: Request):
        """Redis-based login attempt recording"""
        try:
            rate_key = f"rate_limit:login:{identifier}"
            
            if success:
                self.redis_client.delete(rate_key)
                await self._log_security_event("LOGIN_SUCCESS", identifier, 
                                              {"ip": request.client.host, "user_agent": request.headers.get("user-agent")})
            else:
                attempts = self.redis_client.incr(rate_key)
                self.redis_client.expire(rate_key, self.RATE_WINDOW)
                
                if attempts >= self.LOGIN_RATE_LIMIT:
                    lockout_key = f"lockout:{identifier}"
                    self.redis_client.setex(lockout_key, self.LOCKOUT_DURATION, "1")
                
                await self._log_security_event("LOGIN_FAILURE", identifier, 
                                              {"attempts": attempts, "ip": request.client.host})
        except Exception as e:
            logger.error(f"Redis login recording failed: {e}")
    
    async def _record_login_attempt_firestore(self, identifier: str, success: bool, request: Request):
        """Firestore-based login attempt recording"""
        try:
            import asyncio
            from datetime import datetime
            
            def record_firestore():
                rate_doc_id = f"login_rate_{identifier.replace('@', '_at_').replace('.', '_dot_')}"
                rate_ref = self.firestore_client.collection('_security').document('rate_limits').collection('login').document(rate_doc_id)
                
                if success:
                    # Clear rate limit on success
                    rate_ref.delete()
                else:
                    # Update failure count
                    doc = rate_ref.get()
                    now = datetime.utcnow()
                    
                    if doc.exists:
                        data = doc.to_dict()
                        attempts = data.get('attempts', 0) + 1
                    else:
                        attempts = 1
                    
                    rate_ref.set({
                        'attempts': attempts,
                        'last_reset': now,
                        'identifier': identifier,
                        'last_attempt': now,
                        'locked': attempts >= self.LOGIN_RATE_LIMIT
                    })
                
                return True
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, record_firestore)
            
            # Log security event
            event_type = "LOGIN_SUCCESS" if success else "LOGIN_FAILURE"
            await self._log_security_event(event_type, identifier, 
                                          {"ip": request.client.host, "user_agent": request.headers.get("user-agent")})
            
        except Exception as e:
            logger.error(f"Firestore login recording failed: {e}")
    
    async def _record_login_attempt_memory(self, identifier: str, success: bool, request: Request):
        """In-memory login attempt recording"""
        try:
            import time
            
            if not hasattr(self, '_rate_limit_cache'):
                self._rate_limit_cache = {}
            
            if success:
                # Clear on success
                self._rate_limit_cache.pop(identifier, None)
            else:
                # Increment failures
                current_time = int(time.time())
                if identifier in self._rate_limit_cache:
                    self._rate_limit_cache[identifier]['count'] += 1
                else:
                    self._rate_limit_cache[identifier] = {'count': 1, 'timestamp': current_time}
            
            # Log security event
            event_type = "LOGIN_SUCCESS" if success else "LOGIN_FAILURE"
            await self._log_security_event(event_type, identifier, 
                                          {"ip": request.client.host, "user_agent": request.headers.get("user-agent")})
            
        except Exception as e:
            logger.error(f"Memory login recording failed: {e}")
    
    async def is_account_locked(self, identifier: str) -> bool:
        """Check if account is locked due to failed attempts"""
        try:
            if self.storage_backend == 'redis':
                lockout_key = f"lockout:{identifier}"
                return bool(self.redis_client.exists(lockout_key))
            elif self.storage_backend == 'firestore':
                import asyncio
                
                def check_firestore_lock():
                    rate_doc_id = f"login_rate_{identifier.replace('@', '_at_').replace('.', '_dot_')}"
                    rate_ref = self.firestore_client.collection('_security').document('rate_limits').collection('login').document(rate_doc_id)
                    doc = rate_ref.get()
                    
                    if doc.exists:
                        data = doc.to_dict()
                        return data.get('locked', False) and data.get('attempts', 0) >= self.LOGIN_RATE_LIMIT
                    return False
                
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(None, check_firestore_lock)
            else:
                # In-memory check
                if hasattr(self, '_rate_limit_cache') and identifier in self._rate_limit_cache:
                    return self._rate_limit_cache[identifier]['count'] >= self.LOGIN_RATE_LIMIT
                return False
                
        except Exception as e:
            logger.error(f"Lockout check failed: {e}")
            return False
    
    def create_token_pair(self, user_id: str, role: str, email: str) -> TokenPair:
        """
        Create secure access and refresh token pair
        
        Args:
            user_id: User ID
            role: User role
            email: User email
            
        Returns:
            TokenPair with access and refresh tokens
        """
        try:
            token_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            # Access token payload (short-lived)
            access_payload = {
                "sub": user_id,
                "role": role,
                "email": email,
                "type": "access",
                "jti": token_id,
                "iat": now,
                "exp": now + self.ACCESS_TOKEN_EXPIRE
            }
            
            # Refresh token payload (longer-lived)
            refresh_payload = {
                "sub": user_id,
                "type": "refresh",
                "jti": token_id,
                "iat": now,
                "exp": now + self.REFRESH_TOKEN_EXPIRE
            }
            
            # Sign tokens with different keys
            access_token = jwt.encode(
                access_payload, 
                get_jwt_secret(), 
                algorithm="HS256"
            )
            
            refresh_token = jwt.encode(
                refresh_payload,
                get_refresh_secret(),
                algorithm="HS256"
            )
            
            return TokenPair(
                access_token=access_token,
                refresh_token=refresh_token,
                token_id=token_id,
                expires_at=now + self.ACCESS_TOKEN_EXPIRE
            )
            
        except Exception as e:
            logger.error(f"Token creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service unavailable"
            )
    
    def verify_access_token(self, token: str) -> Dict[str, Any]:
        """Verify access token and return payload"""
        try:
            payload = jwt.decode(
                token, 
                get_jwt_secret(), 
                algorithms=["HS256"]
            )
            
            if payload.get("type") != "access":
                raise JWTError("Invalid token type")
            
            # Check if token is blacklisted
            if self._is_token_blacklisted(payload.get("jti")):
                raise JWTError("Token has been revoked")
            
            return payload
            
        except JWTError as e:
            logger.warning(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def verify_refresh_token(self, token: str) -> Dict[str, Any]:
        """Verify refresh token and return payload"""
        try:
            payload = jwt.decode(
                token,
                get_refresh_secret(),
                algorithms=["HS256"]
            )
            
            if payload.get("type") != "refresh":
                raise JWTError("Invalid token type")
            
            if self._is_token_blacklisted(payload.get("jti")):
                raise JWTError("Token has been revoked")
            
            return payload
            
        except JWTError as e:
            logger.warning(f"Refresh token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    
    def blacklist_token(self, token_id: str, expires_at: datetime):
        """Add token to blacklist"""
        if not self.redis_client or not token_id:
            return
        
        try:
            # Calculate TTL based on token expiry
            ttl = int((expires_at - datetime.utcnow()).total_seconds())
            if ttl > 0:
                blacklist_key = f"blacklist:{token_id}"
                self.redis_client.setex(blacklist_key, ttl, "1")
                logger.info(f"Token {token_id[:8]}... blacklisted")
        except Exception as e:
            logger.error(f"Token blacklisting failed: {e}")
    
    def _is_token_blacklisted(self, token_id: str) -> bool:
        """Check if token is blacklisted"""
        if not self.redis_client or not token_id:
            return False
        
        try:
            blacklist_key = f"blacklist:{token_id}"
            return bool(self.redis_client.exists(blacklist_key))
        except Exception as e:
            logger.error(f"Blacklist check failed: {e}")
            return False
    
    async def _log_security_event(self, event_type: str, identifier: str, details: Dict[str, Any]):
        """Log security events for monitoring"""
        try:
            security_event = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event_type,
                "identifier": identifier,
                "details": details
            }
            
            # Log to structured logging for Cloud Logging
            logger.warning(
                f"SECURITY_EVENT: {event_type}",
                extra=security_event
            )
            
        except Exception as e:
            logger.error(f"Security event logging failed: {e}")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash using enhanced security"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password using Argon2"""
        return pwd_context.hash(password)

# Global security service instance
security_service = SecurityService()