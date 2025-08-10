#!/usr/bin/env python3
"""
Script to securely set up Stripe secret key in Firestore
This should only be run once by an administrator
"""
import sys
import os
import getpass

# Add backend to path
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

from app.core.database import get_firestore_client, FirestoreCollections

def setup_stripe_secret():
    """Set up Stripe secret key in Firestore securely"""
    try:
        print("Stripe Secret Key Setup")
        print("=" * 50)
        print("This script will securely store your Stripe secret key in Firestore.")
        print("The key will be stored in the platform_settings/secrets document.")
        print()
        
        # Get Firestore client
        db = get_firestore_client()
        
        # Check if secrets document already exists
        secrets_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document('secrets')
        secrets_doc = secrets_ref.get()
        
        if secrets_doc.exists:
            secrets_data = secrets_doc.to_dict()
            if any(k in secrets_data for k in ['stripe_secret_key', 'stripe_api_key', 'stripe_key']):
                print("⚠️  WARNING: A Stripe key already exists in Firestore.")
                response = input("Do you want to replace it? (yes/no): ").strip().lower()
                if response != 'yes':
                    print("Setup cancelled.")
                    return
        
        # Get the Stripe secret key securely (hidden input)
        print()
        print("Please enter your Stripe SECRET key (starts with 'sk_'):")
        print("Note: The key will be hidden as you type for security.")
        stripe_key = getpass.getpass("Stripe Secret Key: ").strip()
        
        # Validate the key format
        if not stripe_key.startswith('sk_'):
            print("❌ Error: Stripe secret keys should start with 'sk_'")
            print("   (sk_test_ for test keys, sk_live_ for production keys)")
            return
        
        # Confirm before saving
        key_type = "TEST" if "test" in stripe_key else "LIVE"
        print(f"\nYou are about to save a {key_type} Stripe key.")
        confirm = input("Confirm save? (yes/no): ").strip().lower()
        
        if confirm != 'yes':
            print("Setup cancelled.")
            return
        
        # Save to Firestore
        if secrets_doc.exists:
            # Update existing document
            secrets_ref.update({
                'stripe_secret_key': stripe_key
            })
        else:
            # Create new document
            secrets_ref.set({
                'stripe_secret_key': stripe_key
            })
        
        print("✅ Stripe secret key successfully stored in Firestore!")
        print("   Location: platform_settings/secrets")
        print()
        print("⚠️  IMPORTANT SECURITY NOTES:")
        print("   1. Never commit this key to version control")
        print("   2. Never expose this key in logs or error messages")
        print("   3. Only authorized admin users should have access to this document")
        print("   4. Consider using Firestore security rules to restrict access")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_stripe_secret()