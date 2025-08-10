#!/usr/bin/env python3
"""
Test script to check Firestore secrets configuration
"""
import sys
import os
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

from app.core.database import get_firestore_client, FirestoreCollections

def check_firestore_secrets():
    """Check if Stripe key is stored in Firestore"""
    try:
        db = get_firestore_client()
        
        # Check platform_settings collection
        print("Checking platform_settings collection...")
        settings_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS)
        
        # Try to get config document
        config_doc = settings_ref.document('config').get()
        if config_doc.exists:
            config_data = config_doc.to_dict()
            print(f"Config document found with keys: {list(config_data.keys())}")
            
            # Check for stripe-related keys (without exposing values)
            stripe_keys = [k for k in config_data.keys() if 'stripe' in k.lower()]
            if stripe_keys:
                print(f"Found Stripe-related keys: {stripe_keys}")
        else:
            print("No config document found")
        
        # Check for secrets document
        secrets_doc = settings_ref.document('secrets').get()
        if secrets_doc.exists:
            secrets_data = secrets_doc.to_dict()
            print(f"Secrets document found with keys: {list(secrets_data.keys())}")
            
            # Check for stripe-related keys (without exposing values)
            stripe_keys = [k for k in secrets_data.keys() if 'stripe' in k.lower()]
            if stripe_keys:
                print(f"Found Stripe-related keys in secrets: {stripe_keys}")
        else:
            print("No secrets document found")
            
        # List all documents in platform_settings
        print("\nAll documents in platform_settings:")
        docs = settings_ref.stream()
        for doc in docs:
            print(f"  - {doc.id}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_firestore_secrets()