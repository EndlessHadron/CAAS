#!/usr/bin/env python3
"""
Update Firestore to remove test Stripe keys and use Secret Manager instead
"""
import sys
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

def update_stripe_config():
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        
        print("🔐 Updating Stripe configuration to use production keys from Secret Manager")
        print("=" * 60)
        
        # Get Firestore client
        db = get_firestore_client()
        secrets_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document('secrets')
        
        # Get current secrets
        secrets_doc = secrets_ref.get()
        if secrets_doc.exists:
            current_secrets = secrets_doc.to_dict()
            print("Current Firestore secrets:")
            for key in current_secrets:
                if 'stripe' in key.lower():
                    print(f"  - {key}: {current_secrets[key][:20]}...")
                else:
                    print(f"  - {key}: [exists]")
            
            # Remove Stripe keys from Firestore so Secret Manager will be used
            keys_to_remove = ['stripe_secret_key', 'stripe_webhook_secret', 'stripe_publishable_key']
            for key in keys_to_remove:
                if key in current_secrets:
                    del current_secrets[key]
                    print(f"  ✅ Removed {key} from Firestore (will use Secret Manager)")
            
            # Update Firestore
            secrets_ref.set(current_secrets)
            print("\n✅ Updated Firestore configuration")
            print("   Stripe keys will now be loaded from Google Secret Manager:")
            print("   - STRIPE_SECRET_KEY")
            print("   - STRIPE_PUBLISHABLE_KEY")
            print("   - STRIPE_WEBHOOK_SECRET")
            
        else:
            print("❌ No secrets document found in Firestore")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if update_stripe_config():
        print("\n🎉 Configuration updated successfully!")
        print("   Next step: Deploy the backend to use the production Stripe keys")
        sys.exit(0)
    else:
        sys.exit(1)