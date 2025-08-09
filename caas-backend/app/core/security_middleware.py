"""
Security middleware for production-grade security headers and protection
"""

import logging
import time
from typing import Dict, Any
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses"""
    
    def __init__(self, app, domain: str = None):
        super().__init__(app)
        self.domain = domain or "neatly.app"
        
        # Security headers for production
        self.security_headers = {
            # Prevent XSS attacks
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            
            # Content Security Policy
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://apis.google.com; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.neatly.app; "
                "object-src 'none'; "
                "base-uri 'self'"
            ),
            
            # Referrer policy
            "Referrer-Policy": "strict-origin-when-cross-origin",
            
            # Permissions policy
            "Permissions-Policy": (
                "geolocation=(), "
                "microphone=(), "
                "camera=(), "
                "payment=(), "
                "usb=(), "
                "magnetometer=(), "
                "gyroscope=(), "
                "speaker=()"
            ),
            
            # HSTS (will be set conditionally for HTTPS)
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
        }
    
    async def dispatch(self, request: Request, call_next):
        """Add security headers to response"""
        try:
            # Process request
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Add security headers
            for header, value in self.security_headers.items():
                # Only add HSTS for HTTPS
                if header == "Strict-Transport-Security" and request.url.scheme != "https":
                    continue
                response.headers[header] = value
            
            # Add processing time header (for monitoring)
            response.headers["X-Process-Time"] = str(process_time)
            
            # Remove server information safely
            try:
                if "server" in response.headers:
                    del response.headers["server"]
            except (AttributeError, TypeError):
                # Handle cases where headers object doesn't support deletion
                pass
            
            return response
            
        except Exception as e:
            logger.error(f"Security middleware error: {e}")
            # Don't let middleware errors break the app
            response = await call_next(request)
            return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Custom rate limiting middleware with enhanced features"""
    
    def __init__(self, app):
        super().__init__(app)
        # Don't initialize limiter if slowapi import fails
        try:
            self.limiter = Limiter(key_func=get_remote_address)
        except Exception as e:
            logger.warning(f"Rate limiter initialization failed: {e}")
            self.limiter = None
        
        # Different rate limits for different endpoints
        self.endpoint_limits = {
            "/api/v1/auth/login": "5/minute",
            "/api/v1/auth/register": "3/minute", 
            "/api/v1/auth/refresh": "10/minute",
            "/api/v1/admin/": "100/minute",  # Admin endpoints
        }
        
        # Global rate limit
        self.global_limit = "1000/hour"
    
    async def dispatch(self, request: Request, call_next):
        """Apply rate limiting based on endpoint"""
        try:
            # Skip rate limiting for health checks
            if request.url.path in ["/health", "/api/health"]:
                return await call_next(request)
            
            # Get client identifier
            client_ip = get_remote_address(request)
            endpoint = request.url.path
            
            # Apply endpoint-specific rate limiting
            for path_pattern, limit in self.endpoint_limits.items():
                if endpoint.startswith(path_pattern):
                    if not self._check_rate_limit(client_ip, f"{path_pattern}:{limit}", limit):
                        logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint}")
                        raise HTTPException(
                            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail="Rate limit exceeded. Please try again later.",
                            headers={"Retry-After": "60"}
                        )
            
            # Apply global rate limit
            if not self._check_rate_limit(client_ip, f"global:{self.global_limit}", self.global_limit):
                logger.warning(f"Global rate limit exceeded for {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down.",
                    headers={"Retry-After": "300"}
                )
            
            return await call_next(request)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limit middleware error: {e}")
            return await call_next(request)
    
    def _check_rate_limit(self, identifier: str, key: str, limit: str) -> bool:
        """Check if request is within rate limit using Redis"""
        try:
            # Use Redis-based rate limiting for production
            from app.core.security_enhanced import security_service
            
            if security_service.redis_client:
                # Parse limit (e.g., "5/minute" -> 5 requests per 60 seconds)
                limit_parts = limit.split('/')
                if len(limit_parts) == 2:
                    max_requests = int(limit_parts[0])
                    time_window = {
                        'second': 1,
                        'minute': 60, 
                        'hour': 3600,
                        'day': 86400
                    }.get(limit_parts[1], 60)
                    
                    # Sliding window rate limiting with Redis
                    import time
                    current_time = int(time.time())
                    window_start = current_time - time_window
                    
                    redis_key = f"rate_limit:{identifier}:{key}"
                    
                    # Remove old entries
                    security_service.redis_client.zremrangebyscore(redis_key, 0, window_start)
                    
                    # Count current requests in window
                    current_count = security_service.redis_client.zcard(redis_key)
                    
                    if current_count >= max_requests:
                        logger.warning(f"Rate limit exceeded for {identifier}: {current_count}/{max_requests}")
                        return False
                    
                    # Add current request
                    security_service.redis_client.zadd(redis_key, {str(current_time): current_time})
                    security_service.redis_client.expire(redis_key, time_window)
                    
                    return True
            
            # Fallback to permissive if Redis unavailable
            logger.warning("Redis unavailable - rate limiting disabled")
            return True
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True  # Fail open for availability

class SecurityMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for security monitoring and anomaly detection"""
    
    def __init__(self, app):
        super().__init__(app)
        self.suspicious_patterns = [
            # SQL injection patterns
            "union select", "drop table", "insert into", "delete from",
            # XSS patterns  
            "<script", "javascript:", "onerror=", "onload=",
            # Path traversal
            "../", "..\\\\", "/etc/passwd", "/etc/shadow",
            # Command injection
            "; cat", "& cat", "| cat", "; ls", "& ls", "| ls"
        ]
    
    async def dispatch(self, request: Request, call_next):
        """Monitor requests for suspicious activity"""
        try:
            # Check for suspicious patterns in URL and headers
            suspicious_activity = self._detect_suspicious_activity(request)
            
            if suspicious_activity:
                await self._log_security_threat(request, suspicious_activity)
                
                # Block obviously malicious requests
                if suspicious_activity.get("severity") == "high":
                    logger.error(f"Blocked malicious request from {request.client.host}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Request blocked for security reasons"
                    )
            
            return await call_next(request)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Security monitoring middleware error: {e}")
            return await call_next(request)
    
    def _detect_suspicious_activity(self, request: Request) -> Dict[str, Any]:
        """Detect suspicious patterns in request"""
        suspicious = {}
        
        # Check URL path
        path_lower = request.url.path.lower()
        for pattern in self.suspicious_patterns:
            if pattern in path_lower:
                suspicious["url_injection"] = pattern
                suspicious["severity"] = "high"
                break
        
        # Check query parameters
        if request.url.query:
            query_lower = request.url.query.lower()
            for pattern in self.suspicious_patterns:
                if pattern in query_lower:
                    suspicious["query_injection"] = pattern
                    suspicious["severity"] = "high"
                    break
        
        # Check user agent for automated tools
        user_agent = request.headers.get("user-agent", "").lower()
        suspicious_tools = ["sqlmap", "nikto", "nmap", "dirb", "gobuster", "wfuzz"]
        for tool in suspicious_tools:
            if tool in user_agent:
                suspicious["automated_tool"] = tool
                suspicious["severity"] = "medium"
                break
        
        return suspicious
    
    async def _log_security_threat(self, request: Request, threat_info: Dict[str, Any]):
        """Log security threats for analysis"""
        security_event = {
            "timestamp": time.time(),
            "event_type": "SECURITY_THREAT",
            "client_ip": request.client.host,
            "user_agent": request.headers.get("user-agent"),
            "path": request.url.path,
            "method": request.method,
            "threat_info": threat_info
        }
        
        logger.error(
            f"SECURITY_THREAT detected from {request.client.host}",
            extra=security_event
        )

def setup_security_middleware(app):
    """Setup all security middleware"""
    # Order matters - most restrictive first
    app.add_middleware(SecurityMonitoringMiddleware)
    app.add_middleware(RateLimitMiddleware) 
    app.add_middleware(SecurityHeadersMiddleware)
    
    logger.info("Security middleware initialized")