#!/usr/bin/env python3
"""
Automated script to configure essential secrets in Firestore
Sets up JWT secrets automatically for development/testing
"""
import sys
import os
import secrets
import string

# Add backend to path
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

from app.core.database import get_firestore_client, FirestoreCollections


def generate_secure_secret(length=64):
    """Generate a cryptographically secure random secret"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def setup_essential_secrets():
    """Set up essential JWT secrets for the system to work"""
    try:
        print("🔐 Configuring Essential CAAS Secrets")
        print("=" * 60)
        
        # Get Firestore client
        db = get_firestore_client()
        secrets_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document('secrets')
        
        # Check if secrets already exist
        secrets_doc = secrets_ref.get()
        existing_secrets = secrets_doc.to_dict() if secrets_doc.exists else {}
        
        secrets_to_configure = {}
        
        # Always ensure JWT secrets exist
        if 'jwt_secret_key' not in existing_secrets:
            secrets_to_configure['jwt_secret_key'] = generate_secure_secret()
            print("✨ Generated JWT secret key")
        else:
            print("✅ JWT secret key already configured")
        
        if 'refresh_secret_key' not in existing_secrets:
            secrets_to_configure['refresh_secret_key'] = generate_secure_secret()
            print("✨ Generated refresh token secret")
        else:
            print("✅ Refresh token secret already configured")
        
        # For development, use test Stripe keys if not configured
        if 'stripe_secret_key' not in existing_secrets:
            # Use Stripe test key for development
            # This is a test key from Stripe docs, not a real secret
            secrets_to_configure['stripe_secret_key'] = 'stripe_test_key_placeholder'
            print("⚠️  Using Stripe TEST key for development")
        else:
            print("✅ Stripe secret key already configured")
        
        if 'stripe_webhook_secret' not in existing_secrets:
            # Generate a placeholder webhook secret for development
            secrets_to_configure['stripe_webhook_secret'] = 'whsec_' + generate_secure_secret(32)
            print("⚠️  Generated placeholder webhook secret for development")
        else:
            print("✅ Stripe webhook secret already configured")
        
        # Save to Firestore
        if secrets_to_configure:
            if secrets_doc.exists:
                # Update existing document
                secrets_ref.update(secrets_to_configure)
                print(f"\n✅ Updated {len(secrets_to_configure)} secret(s) in Firestore")
            else:
                # Create new document
                secrets_ref.set(secrets_to_configure)
                print(f"\n✅ Created {len(secrets_to_configure)} secret(s) in Firestore")
        else:
            print("\n✅ All essential secrets already configured")
        
        print("\n🎉 Secret configuration complete!")
        print("\n📝 Next Steps:")
        print("   1. Deploy the backend: ./deploy-container.sh backend")
        print("   2. Test authentication: curl /api/v1/auth/login")
        print("   3. For production, update Stripe keys with real values")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Automated Secret Configuration")
    print("   This will configure essential secrets for the system to work")
    print()
    
    if setup_essential_secrets():
        sys.exit(0)
    else:
        sys.exit(1)