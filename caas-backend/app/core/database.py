from google.cloud import firestore
from google.auth import default
import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Global Firestore client
_firestore_client: Optional[firestore.Client] = None


def init_memory_db():
    """Initialize memory database for MVP"""
    try:
        from app.core.memory_db import memory_db
        memory_db.init()
        logger.info("Memory database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize memory database: {e}")
        raise


def init_firestore() -> firestore.Client:
    """Initialize Firestore client"""
    global _firestore_client
    
    try:
        # Use default credentials (from gcloud auth or service account)
        credentials, project = default()
        _firestore_client = firestore.Client(
            project=settings.google_cloud_project,
            credentials=credentials
        )
        
        # Test the connection
        _firestore_client.collection('_health_check').limit(1).get()
        logger.info(f"Firestore client initialized for project: {settings.google_cloud_project}")
        
        return _firestore_client
        
    except Exception as e:
        logger.error(f"Failed to initialize Firestore: {e}")
        raise


def get_firestore_client() -> firestore.Client:
    """Get the Firestore client instance"""
    global _firestore_client
    
    if _firestore_client is None:
        _firestore_client = init_firestore()
    
    return _firestore_client


def get_collection_name(collection: str) -> str:
    """Get full collection name with prefix"""
    return f"{settings.firestore_collection_prefix}{collection}"


class FirestoreCollections:
    """Firestore collection names"""
    USERS = get_collection_name("users")
    BOOKINGS = get_collection_name("bookings")
    CLEANER_AVAILABILITY = get_collection_name("cleaner_availability")
    NOTIFICATIONS = get_collection_name("notifications")
    AI_DECISIONS = get_collection_name("ai_decisions")
    AUDIT_LOG = get_collection_name("audit_logs")
    PLATFORM_SETTINGS = get_collection_name("platform_settings")
    ADMIN_SESSIONS = get_collection_name("admin_sessions")