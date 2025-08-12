from fastapi import FastAPI, HTTPException, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
import os
from contextlib import asynccontextmanager

# Import configuration and core modules
from app.config import settings
from app.core.security_middleware import setup_security_middleware

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


@asynccontextmanager  
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting neatly API (Production - Real Auth)...")
    try:
        # Initialize Firestore for production
        try:
            # Use Cloud Run's built-in service account for Firestore
            logger.info("Initializing Firestore database connection...")
            
            from app.core.database import init_firestore
            init_firestore()
            logger.info("Firestore database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            # Don't fail startup - we'll handle gracefully
        
        yield
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    finally:
        # Shutdown
        logger.info("Shutting down neatly API...")


# Create FastAPI application
app = FastAPI(
    title="neatly API",
    description="Premium Cleaning Services - Production API with Real Authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware with production settings
allowed_origins = [
    "https://caas-frontend-102964896009.us-central1.run.app",
    "https://theneatlyapp.com",
    "https://www.theneatlyapp.com",
    "https://api.theneatlyapp.com",
    "http://localhost:3000",
    "http://localhost:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "caas-backend-102964896009.us-central1.run.app",
        "caas-frontend-102964896009.us-central1.run.app",
        "api.theneatlyapp.com",
        "theneatlyapp.com",
        "www.theneatlyapp.com",
        "*.theneatlyapp.com",
        "neatly.app",
        "*.neatly.app",
        "localhost"
    ]
)

# Setup enhanced security middleware - NOW FIXED
setup_security_middleware(app)
logger.info("Enhanced security middleware enabled with fixes")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "neatly-api",
        "version": "1.0.0",
        "environment": "production",
        "auth": "enhanced-security"
    }

@app.get("/security-status")
async def security_status():
    """Security system status for monitoring"""
    try:
        from app.core.security_enhanced import security_service
        
        # Test storage backend
        backend_status = {}
        if hasattr(security_service, 'storage_backend'):
            backend_status['active_backend'] = security_service.storage_backend
            backend_status['redis_available'] = security_service.redis_client is not None
            backend_status['firestore_available'] = hasattr(security_service, 'firestore_client') and security_service.firestore_client is not None
        else:
            backend_status['active_backend'] = 'initializing'
        
        return {
            "security_status": "operational",
            "rate_limiting": backend_status,
            "middleware": "active",
            "auth_endpoints": ["standard", "enhanced"],
            "security_headers": "enabled",
            "token_blacklisting": backend_status.get('active_backend', 'unknown') != 'memory'
        }
    except Exception as e:
        logger.error(f"Security status check failed: {e}")
        return {
            "security_status": "degraded",
            "error": str(e)
        }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to neatly API - Production Ready",
        "documentation": "/docs",
        "health": "/health",
        "version": "1.0.0",
        "features": ["real-jwt-auth", "user-management", "role-based-access"]
    }

@app.get("/test-firestore")
async def test_firestore():
    """Test Firestore connection directly"""
    try:
        from app.core.database import get_firestore_client
        db = get_firestore_client()
        
        # Test write
        doc_ref = db.collection('test').document('api-test')
        doc_ref.set({
            'timestamp': 'server-timestamp',
            'status': 'ok',
            'message': 'Test from backend API'
        })
        
        # Test read
        doc = doc_ref.get()
        if doc.exists:
            return {
                "status": "success",
                "message": "Firestore connection working",
                "data": doc.to_dict()
            }
        else:
            return {"status": "error", "message": "Document not found"}
            
    except Exception as e:
        logger.error(f"Firestore test failed: {e}")
        return {"status": "error", "message": f"Firestore error: {str(e)}"}

@app.get("/test-user-stats")
async def test_user_stats():
    """Test user statistics"""
    try:
        from app.services.user_service import user_service
        stats = user_service.get_user_statistics()
        return {"status": "success", "stats": stats}
    except Exception as e:
        logger.error(f"Stats test failed: {e}")
        return {"status": "error", "message": f"Stats error: {str(e)}"}

@app.post("/test-register")
async def test_register(user_data: dict):
    """Test user registration directly"""
    try:
        from app.services.user_service import user_service
        from app.models.users import UserCreate, UserRole
        
        # Create user object
        create_data = UserCreate(
            email=user_data.get("email"),
            password=user_data.get("password"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            role=UserRole(user_data.get("role", "client"))
        )
        
        # Create user
        user_id = user_service.create_user(create_data)
        
        if user_id:
            return {
                "status": "success",
                "message": "User created successfully",
                "user_id": user_id
            }
        else:
            return {"status": "error", "message": "Failed to create user - check logs for details"}
            
    except Exception as e:
        logger.error(f"Test registration failed: {e}")
        return {"status": "error", "message": f"Registration error: {str(e)}"}

@app.post("/test-login")  
async def test_login(login_data: dict):
    """Test user login directly"""
    try:
        from app.services.user_service import user_service
        from app.core.security import create_access_token, create_refresh_token
        
        # Authenticate user
        user = user_service.authenticate_user(
            login_data.get("email"),
            login_data.get("password")
        )
        
        if not user:
            return {"status": "error", "message": "Invalid email or password"}
        
        # Create tokens
        access_token = create_access_token({"sub": user['uid'], "role": user['role']})
        refresh_token = create_refresh_token({"sub": user['uid'], "role": user['role']})
        
        return {
            "status": "success",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "uid": user['uid'],
                "email": user['email'],
                "role": user['role'],
                "first_name": user.get('profile', {}).get('first_name'),
                "last_name": user.get('profile', {}).get('last_name')
            }
        }
        
    except Exception as e:
        logger.error(f"Test login failed: {e}")
        return {"status": "error", "message": f"Login error: {str(e)}"}


# Include real API routers - production authentication system
from app.api.v1 import auth_production as auth
from app.api.v1 import auth_secure
from app.api.v1 import profiles

# Include working authentication router (primary)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
logger.info("Authentication router loaded successfully")

# Enhanced secure auth endpoints (available for testing)
app.include_router(auth_secure.router, prefix="/api/v1/auth-secure", tags=["Enhanced Authentication"])
logger.info("Enhanced secure authentication router loaded successfully")

# Include profiles router with role-based profile management
app.include_router(profiles.router, prefix="/api/v1/profiles", tags=["Profiles"])
logger.info("Profiles router loaded successfully")

# Include system debugging router for production troubleshooting
try:
    from app.api.v1 import system
    app.include_router(system.router, prefix="/api/v1/system", tags=["System"])
    logger.info("System debugging router loaded successfully")
except ImportError as e:
    logger.warning(f"Could not import system module: {e}. System debugging disabled.")

# Include test email router (temporary for testing)
# Commented out to fix deployment issues
# try:
#     from app.api.v1 import test_email
#     app.include_router(test_email.router, prefix="/api/v1/test", tags=["Testing"])
#     logger.info("Test email router loaded successfully")
# except ImportError as e:
#     logger.warning(f"Could not import test_email module: {e}")

# Include diagnostic router (TEMPORARY - for production troubleshooting)
try:
    from app.api.v1 import diagnostic
    app.include_router(diagnostic.router, prefix="/api/v1", tags=["Diagnostic"])
    logger.warning("DIAGNOSTIC ENDPOINTS ENABLED - Remove after fixing production issues")
except ImportError as e:
    pass  # Diagnostic module is optional
except Exception as e:
    logger.error(f"Failed to register diagnostic endpoints: {e}")

# Include admin router with full security and audit logging
# Auth issues resolved - re-enabling admin system
try:
    from app.api.v1 import admin
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
    logger.info("Admin router loaded successfully with full security")
except ImportError as e:
    logger.error(f"Could not import admin module: {e}. Admin functionality disabled.")
except Exception as e:
    logger.error(f"Error loading admin router: {e}. Admin functionality disabled.")

# Include booking system - Clean implementation for production stability
logger.info("Loading clean booking implementation for production")

from app.simple_bookings import router as booking_router

# Include booking router
app.include_router(booking_router, prefix="/api/v1/bookings", tags=["Bookings"])
logger.info("Clean booking system loaded successfully")

# Include payment system
try:
    from app.api.v1 import payments
    app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
    logger.info("Payment system loaded successfully")
except ImportError as e:
    logger.warning(f"Could not import payments module: {e}. Payment functionality disabled.")
except Exception as e:
    logger.error(f"Error loading payment router: {e}. Payment functionality disabled.")

# Include webhook system
try:
    from app.api.v1 import webhooks
    app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
    logger.info("Webhook system loaded successfully")
except ImportError as e:
    logger.warning(f"Could not import webhooks module: {e}. Webhook functionality disabled.")

# Include contractor/cleaner system
try:
    from app.api.v1 import contractors
    app.include_router(contractors.router, prefix="/api/v1/contractors", tags=["Contractors"])
    logger.info("Contractor system loaded successfully")
except ImportError as e:
    logger.warning(f"Could not import contractors module: {e}. Contractor functionality disabled.")
except Exception as e:
    logger.error(f"Error loading contractor router: {e}. Contractor functionality disabled.")

# Add simple user management endpoints
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id

users_router = APIRouter()

@users_router.get("/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user profile"""
    try:
        from app.services.user_service import user_service
        user = user_service.get_user_by_id(user_id)
        if not user:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="User not found")
        return user_service.format_user_response(user).model_dump()
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting current user: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Internal server error")

# Simple admin endpoint for testing
@users_router.get("/admin-test")
async def admin_test(user_id: str = Depends(get_current_user_id)):
    """Test admin access"""
    try:
        from app.services.user_service import user_service
        user = user_service.get_user_by_id(user_id)
        if not user:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get('role') != 'admin':
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Admin access required")
            
        return {
            "message": "Admin access successful",
            "user_id": user_id,
            "role": user.get('role'),
            "email": user.get('email')
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in admin test: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Internal server error")

# Simple admin dashboard metrics endpoint
@users_router.get("/admin-metrics")  
async def get_admin_dashboard_metrics(user_id: str = Depends(get_current_user_id)):
    """Get dashboard metrics for admin - simple version"""
    try:
        from app.services.user_service import user_service
        from app.core.database import get_firestore_client
        
        user = user_service.get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get basic counts from Firestore
        db = get_firestore_client()
        users_ref = db.collection("users")
        bookings_ref = db.collection("bookings")
        
        # Count total users (simplified)
        total_users = len(list(users_ref.stream()))
        
        # Simple metrics
        metrics = {
            "total_users": total_users,
            "active_bookings": 5,  # Placeholder
            "pending_bookings": 2,  # Placeholder
            "total_revenue": 1250.50,  # Placeholder
            "monthly_revenue": 340.25,  # Placeholder
            "support_tickets_open": 1,  # Placeholder
            "system_health": "healthy"
        }
        
        return metrics
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in admin metrics: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Internal server error")

app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
logger.info("Production API system loaded successfully")

# Global exception handler
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(_request, exc):
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main_production_real:app",
        host="0.0.0.0",
        port=port,
        log_level=settings.log_level.lower()
    )# Force deployment Tue Aug  5 13:00:30 BST 2025
