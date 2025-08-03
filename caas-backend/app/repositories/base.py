from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, TypeVar, Generic
from google.cloud import firestore
from google.cloud.firestore import DocumentReference, CollectionReference
import logging
from datetime import datetime

from app.core.database import get_firestore_client

logger = logging.getLogger(__name__)

T = TypeVar('T')


class BaseRepository(ABC, Generic[T]):
    """Base repository class for Firestore operations"""
    
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self._client = None
        self._collection = None
    
    @property
    def client(self) -> firestore.Client:
        """Get Firestore client instance"""
        if self._client is None:
            self._client = get_firestore_client()
        return self._client
    
    @property
    def collection(self) -> CollectionReference:
        """Get collection reference"""
        if self._collection is None:
            self._collection = self.client.collection(self.collection_name)
        return self._collection
    
    async def create(self, document_id: str, data: Dict[str, Any]) -> bool:
        """Create a new document"""
        try:
            # Add timestamps
            now = datetime.utcnow()
            data['created_at'] = now
            data['updated_at'] = now
            
            doc_ref = self.collection.document(document_id)
            doc_ref.set(data)
            
            logger.info(f"Created document {document_id} in {self.collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create document {document_id}: {e}")
            return False
    
    async def get_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        try:
            doc_ref = self.collection.document(document_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get document {document_id}: {e}")
            return None
    
    async def update(self, document_id: str, data: Dict[str, Any]) -> bool:
        """Update an existing document"""
        try:
            # Add update timestamp
            data['updated_at'] = datetime.utcnow()
            
            doc_ref = self.collection.document(document_id)
            doc_ref.update(data)
            
            logger.info(f"Updated document {document_id} in {self.collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update document {document_id}: {e}")
            return False
    
    async def delete(self, document_id: str) -> bool:
        """Delete a document"""
        try:
            doc_ref = self.collection.document(document_id)
            doc_ref.delete()
            
            logger.info(f"Deleted document {document_id} from {self.collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            return False
    
    async def get_by_field(self, field: str, value: Any) -> Optional[Dict[str, Any]]:
        """Get first document where field equals value"""
        try:
            query = self.collection.where(field, '==', value).limit(1)
            docs = query.stream()
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to query by {field}={value}: {e}")
            return None
    
    async def get_many_by_field(self, field: str, value: Any, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get multiple documents where field equals value"""
        try:
            query = self.collection.where(field, '==', value)
            
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to query multiple by {field}={value}: {e}")
            return []
    
    async def get_all(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all documents in collection"""
        try:
            query = self.collection
            
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get all documents: {e}")
            return []
    
    async def exists(self, document_id: str) -> bool:
        """Check if document exists"""
        try:
            doc_ref = self.collection.document(document_id)
            doc = doc_ref.get()
            return doc.exists
            
        except Exception as e:
            logger.error(f"Failed to check existence of {document_id}: {e}")
            return False
    
    async def count(self) -> int:
        """Count documents in collection"""
        try:
            docs = self.collection.stream()
            return len(list(docs))
            
        except Exception as e:
            logger.error(f"Failed to count documents: {e}")
            return 0
    
    def batch_operation(self):
        """Get batch operation context manager"""
        return self.client.batch()
    
    def transaction(self):
        """Get transaction context manager"""
        return self.client.transaction()