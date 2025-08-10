#!/usr/bin/env python3
"""
Quick script to set Stripe test key in Firestore
"""
import sys
import os

# Add backend to path
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

def set_stripe_key():
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        
        print("Setting Stripe test key in Firestore...")
        
        # Get Firestore client
        db = get_firestore_client()
        secrets_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document('secrets')
        
        # Get existing secrets
        secrets_doc = secrets_ref.get()
        existing = secrets_doc.to_dict() if secrets_doc.exists else {}
        
        # Add/update Stripe test key
        existing['stripe_secret_key'] = 'stripe_test_key_placeholder'
        existing['stripe_webhook_secret'] = 'whsec_test_secret_for_development'
        
        # Ensure JWT secrets exist too (generate if not present)
        if 'jwt_secret_key' not in existing:
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits
            existing['jwt_secret_key'] = ''.join(secrets.choice(alphabet) for _ in range(64))
            
        if 'refresh_secret_key' not in existing:
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits
            existing['refresh_secret_key'] = ''.join(secrets.choice(alphabet) for _ in range(64))
        
        # Save to Firestore
        secrets_ref.set(existing)
        
        print("✅ Stripe test key set successfully!")
        print("✅ JWT secrets ensured")
        print("\nSecrets configured:")
        for key in existing:
            if 'stripe' in key:
                print(f"  - {key}: {existing[key][:20]}...")
            else:
                print(f"  - {key}: [configured]")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if set_stripe_key():
        print("\n🎉 Success! Now deploy the backend to use the new configuration.")
        sys.exit(0)
    else:
        sys.exit(1)