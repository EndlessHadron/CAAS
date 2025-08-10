"""
Production diagnostic endpoint for troubleshooting secret loading issues
TEMPORARY - Remove after fixing production issues
"""
from fastapi import APIRouter, HTTPException
import logging
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter(tags=["diagnostic"])

@router.get("/diagnostic/secrets")
async def diagnose_secrets() -> Dict[str, Any]:
    """Diagnose secret loading issues in production"""
    
    result = {
        "environment": {},
        "firestore": {},
        "secrets": {},
        "errors": []
    }
    
    try:
        # Check environment
        result["environment"] = {
            "project": os.getenv("GOOGLE_CLOUD_PROJECT", "NOT_SET"),
            "service": os.getenv("K_SERVICE", "NOT_SET"),
            "revision": os.getenv("K_REVISION", "NOT_SET"),
            "region": os.getenv("K_CONFIGURATION", "NOT_SET"),
        }
        
        # Check Firestore access
        try:
            from app.core.database import get_firestore_client, FirestoreCollections
            db = get_firestore_client()
            
            # Get the actual collection name
            collection_name = FirestoreCollections.PLATFORM_SETTINGS
            result["firestore"]["collection_path"] = collection_name
            
            # Try to read the secrets document
            secrets_ref = db.collection(collection_name).document('secrets')
            secrets_doc = secrets_ref.get()
            
            if secrets_doc.exists:
                data = secrets_doc.to_dict()
                result["firestore"]["document_exists"] = True
                result["firestore"]["keys_found"] = list(data.keys())
                result["firestore"]["key_count"] = len(data)
            else:
                result["firestore"]["document_exists"] = False
                result["firestore"]["error"] = f"Document not found at {collection_name}/secrets"
                
        except Exception as e:
            result["firestore"]["error"] = str(e)
            result["errors"].append(f"Firestore error: {e}")
        
        # Check secret loading
        try:
            from app.core.secure_secrets import get_secure_secrets
            secret_service = get_secure_secrets()
            
            # Try to get JWT secret
            try:
                jwt_secret = secret_service.get_secret('jwt_secret_key', required=False)
                result["secrets"]["jwt_secret"] = "LOADED" if jwt_secret else "NOT_FOUND"
                if jwt_secret:
                    result["secrets"]["jwt_length"] = len(jwt_secret)
            except Exception as e:
                result["secrets"]["jwt_error"] = str(e)
            
            # Try to get Stripe secret
            try:
                stripe_secret = secret_service.get_secret('stripe_secret_key', required=False)
                result["secrets"]["stripe_secret"] = "LOADED" if stripe_secret else "NOT_FOUND"
                if stripe_secret:
                    result["secrets"]["stripe_prefix"] = stripe_secret[:7] if len(stripe_secret) > 7 else "SHORT"
            except Exception as e:
                result["secrets"]["stripe_error"] = str(e)
            
            # Get audit log
            audit_log = secret_service.get_audit_log()
            result["secrets"]["audit_log_entries"] = len(audit_log)
            if audit_log:
                result["secrets"]["last_access"] = str(audit_log[-1])
                
        except Exception as e:
            result["secrets"]["error"] = str(e)
            result["errors"].append(f"Secret service error: {e}")
        
        # Check Secret Manager fallback
        try:
            from app.core.secrets_manager import SecretManagerService
            sm = SecretManagerService()
            result["secret_manager"] = {
                "available": True,
                "project": sm.project_id
            }
        except Exception as e:
            result["secret_manager"] = {
                "available": False,
                "error": str(e)
            }
        
        # Overall status
        result["status"] = "HEALTHY" if not result["errors"] else "UNHEALTHY"
        
    except Exception as e:
        result["errors"].append(f"Fatal error: {e}")
        result["status"] = "CRITICAL"
    
    return result

@router.post("/diagnostic/fix-secrets")
async def fix_secrets() -> Dict[str, Any]:
    """Attempt to fix secret configuration issues"""
    
    import secrets
    import string
    
    def generate_secret(length=64):
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    result = {"actions": [], "success": False}
    
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        db = get_firestore_client()
        
        collection_name = FirestoreCollections.PLATFORM_SETTINGS
        secrets_ref = db.collection(collection_name).document('secrets')
        
        # Generate and save secrets
        secrets_data = {
            'jwt_secret_key': generate_secret(),
            'refresh_secret_key': generate_secret(),
            'stripe_secret_key': 'stripe_test_key_placeholder',
            'stripe_webhook_secret': 'whsec_' + generate_secret(32)
        }
        
        secrets_ref.set(secrets_data)
        result["actions"].append(f"Wrote secrets to {collection_name}/secrets")
        
        # Clear cache
        from app.core.secure_secrets import get_secure_secrets
        secret_service = get_secure_secrets()
        secret_service.clear_cache()
        result["actions"].append("Cleared secret cache")
        
        # Verify
        test_secret = secret_service.get_secret('jwt_secret_key', required=False)
        if test_secret:
            result["actions"].append("Verified JWT secret loads correctly")
            result["success"] = True
        else:
            result["actions"].append("ERROR: JWT secret still not loading")
            
    except Exception as e:
        result["error"] = str(e)
        result["actions"].append(f"Failed: {e}")
    
    return result

@router.post("/diagnostic/remove-stripe-from-firestore")
async def remove_stripe_from_firestore() -> Dict[str, Any]:
    """Remove Stripe keys from Firestore to force Secret Manager usage"""
    
    result = {"actions": [], "success": False}
    
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        db = get_firestore_client()
        
        collection_name = FirestoreCollections.PLATFORM_SETTINGS
        secrets_ref = db.collection(collection_name).document('secrets')
        
        # Get current secrets
        secrets_doc = secrets_ref.get()
        if secrets_doc.exists:
            current_secrets = secrets_doc.to_dict()
            
            # Remove Stripe keys
            stripe_keys = ['stripe_secret_key', 'stripe_webhook_secret', 'stripe_publishable_key']
            removed = []
            for key in stripe_keys:
                if key in current_secrets:
                    del current_secrets[key]
                    removed.append(key)
            
            # Update Firestore
            secrets_ref.set(current_secrets)
            result["actions"].append(f"Removed {len(removed)} Stripe keys from Firestore")
            result["removed_keys"] = removed
            
            # Clear cache
            from app.core.secure_secrets import get_secure_secrets
            secret_service = get_secure_secrets()
            secret_service.clear_cache()
            result["actions"].append("Cleared secret cache")
            
            result["actions"].append("Stripe keys will now be loaded from Secret Manager")
            result["success"] = True
        else:
            result["actions"].append("No secrets document found")
            
    except Exception as e:
        result["error"] = str(e)
        result["actions"].append(f"Failed: {e}")
    
    return result