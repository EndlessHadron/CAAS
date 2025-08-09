"""
System endpoints for production debugging and verification
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import hashlib
import os
import inspect
from datetime import datetime
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class SystemInfo(BaseModel):
    """System information response"""
    service: str
    version: str
    build_time: str
    environment: str
    code_hash: str
    auth_status: str


class CodeVerification(BaseModel):
    """Code verification response"""
    file_path: str
    code_hash: str
    last_modified: str
    verification_status: str


def get_code_hash(file_path: str) -> str:
    """Generate hash of source code file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    except Exception as e:
        logger.error(f"Error hashing {file_path}: {e}")
        return "error"


def verify_auth_code_integrity() -> Dict[str, Any]:
    """Verify critical authentication code hasn't been corrupted"""
    critical_files = [
        'app/repositories/base.py',
        'app/services/user_service.py',
        'app/api/v1/auth_production.py',
        'app/core/security.py'
    ]
    
    verification_results = {}
    
    for file_path in critical_files:
        full_path = os.path.join('/app', file_path)
        if os.path.exists(full_path):
            code_hash = get_code_hash(full_path)
            mod_time = datetime.fromtimestamp(os.path.getmtime(full_path))
            
            verification_results[file_path] = {
                'hash': code_hash,
                'modified': mod_time.isoformat(),
                'exists': True
            }
        else:
            verification_results[file_path] = {
                'hash': 'missing',
                'modified': None,
                'exists': False
            }
    
    return verification_results


@router.get("/info", response_model=SystemInfo)
async def get_system_info():
    """Get system information for debugging and verification"""
    try:
        # Get environment info
        build_time = os.getenv('BUILD_TIME', datetime.now().isoformat())
        environment = os.getenv('ENVIRONMENT', 'production')
        
        # Check authentication system
        auth_status = "operational"
        try:
            from app.services.user_service import user_service
            from app.repositories.base import BaseRepository
            
            # Quick verification that base repository doesn't have broken query.select() calls
            base_repo_file = '/app/app/repositories/base.py'
            if os.path.exists(base_repo_file):
                with open(base_repo_file, 'r') as f:
                    content = f.read()
                    if 'query.select()' in content:
                        auth_status = "degraded-malformed-query-detected"
                    else:
                        auth_status = "operational"
            else:
                auth_status = "unknown-missing-files"
                
        except Exception as e:
            auth_status = f"error-{str(e)[:50]}"
        
        # Generate code hash for this deployment
        try:
            main_file = '/app/app/main_production_real.py'
            code_hash = get_code_hash(main_file) if os.path.exists(main_file) else "unknown"
        except:
            code_hash = "error"
        
        return SystemInfo(
            service="caas-backend",
            version="1.0.0",
            build_time=build_time,
            environment=environment,
            code_hash=code_hash,
            auth_status=auth_status
        )
        
    except Exception as e:
        logger.error(f"System info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System info error: {str(e)}"
        )


@router.get("/verify-code")
async def verify_code_integrity():
    """Verify critical code files integrity"""
    try:
        verification_results = verify_auth_code_integrity()
        
        # Check for known issues
        issues = []
        
        base_repo_path = '/app/app/repositories/base.py'
        if os.path.exists(base_repo_path):
            with open(base_repo_path, 'r') as f:
                content = f.read()
                if 'query.select()' in content:
                    issues.append("base.py contains malformed query.select() call")
        
        return {
            "verification_timestamp": datetime.now().isoformat(),
            "files": verification_results,
            "issues": issues,
            "status": "degraded" if issues else "healthy"
        }
        
    except Exception as e:
        logger.error(f"Code verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Code verification error: {str(e)}"
        )


@router.get("/auth-test")
async def test_auth_components():
    """Test authentication system components"""
    try:
        from app.services.user_service import user_service
        from app.repositories.user_repository import user_repository
        from app.core.security import get_password_hash, verify_password
        
        test_results = {
            "timestamp": datetime.now().isoformat(),
            "components": {}
        }
        
        # Test password hashing
        try:
            test_password = "TestPassword123!"
            hashed = get_password_hash(test_password)
            verified = verify_password(test_password, hashed)
            test_results["components"]["password_hashing"] = {
                "status": "operational" if verified else "failed",
                "hash_length": len(hashed)
            }
        except Exception as e:
            test_results["components"]["password_hashing"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Test repository query (without creating actual data)
        try:
            # This should not fail with query.select() error
            result = user_repository.get_by_email("nonexistent@test.com")
            test_results["components"]["user_repository"] = {
                "status": "operational",
                "query_result": "none" if result is None else "found"
            }
        except Exception as e:
            test_results["components"]["user_repository"] = {
                "status": "error",
                "error": str(e)
            }
        
        overall_status = "healthy"
        for component, result in test_results["components"].items():
            if result["status"] not in ["operational", "healthy"]:
                overall_status = "degraded"
                break
        
        test_results["overall_status"] = overall_status
        
        return test_results
        
    except Exception as e:
        logger.error(f"Auth test error: {e}")
        return {
            "timestamp": datetime.now().isoformat(),
            "overall_status": "error",
            "error": str(e)
        }