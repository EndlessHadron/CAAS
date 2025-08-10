#!/usr/bin/env python3
"""
Script to securely set up ALL required secrets in Firestore
This should only be run once by an administrator
"""
import sys
import os
import getpass
import secrets
import string

# Add backend to path
sys.path.insert(0, '/Users/maxsenestrari/Documents/GitHub/CAAS/caas-backend')

from app.core.database import get_firestore_client, FirestoreCollections


def generate_secure_secret(length=64):
    """Generate a cryptographically secure random secret"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def setup_all_secrets():
    """Set up all required secrets in Firestore"""
    try:
        print("🔐 CAAS Platform Secrets Setup")
        print("=" * 60)
        print("This script will help you securely configure all required secrets.")
        print("Secrets will be stored in Firestore: platform_settings/secrets")
        print()
        
        # Get Firestore client
        db = get_firestore_client()
        secrets_ref = db.collection(FirestoreCollections.PLATFORM_SETTINGS).document('secrets')
        
        # Check if secrets already exist
        secrets_doc = secrets_ref.get()
        existing_secrets = secrets_doc.to_dict() if secrets_doc.exists else {}
        
        secrets_to_configure = {}
        
        # 1. JWT Secrets
        print("1️⃣  JWT Authentication Secrets")
        print("-" * 40)
        
        if 'jwt_secret_key' in existing_secrets:
            print("   ✅ JWT secret already configured")
            response = input("   Replace with new secret? (yes/no): ").strip().lower()
            if response == 'yes':
                secrets_to_configure['jwt_secret_key'] = generate_secure_secret()
                print("   ✨ New JWT secret generated")
        else:
            secrets_to_configure['jwt_secret_key'] = generate_secure_secret()
            print("   ✨ JWT secret generated")
        
        if 'refresh_secret_key' in existing_secrets:
            print("   ✅ Refresh token secret already configured")
            response = input("   Replace with new secret? (yes/no): ").strip().lower()
            if response == 'yes':
                secrets_to_configure['refresh_secret_key'] = generate_secure_secret()
                print("   ✨ New refresh secret generated")
        else:
            secrets_to_configure['refresh_secret_key'] = generate_secure_secret()
            print("   ✨ Refresh token secret generated")
        
        print()
        
        # 2. Stripe Secrets
        print("2️⃣  Stripe Payment Integration")
        print("-" * 40)
        
        if 'stripe_secret_key' in existing_secrets:
            print("   ✅ Stripe secret key already configured")
            response = input("   Replace with new key? (yes/no): ").strip().lower()
            if response == 'yes':
                stripe_key = getpass.getpass("   Stripe Secret Key (sk_...): ").strip()
                if stripe_key and stripe_key.startswith('sk_'):
                    secrets_to_configure['stripe_secret_key'] = stripe_key
                    print("   ✅ Stripe secret key updated")
        else:
            print("   ⚠️  Stripe secret key not configured")
            stripe_key = getpass.getpass("   Enter Stripe Secret Key (sk_... or press Enter to skip): ").strip()
            if stripe_key:
                if not stripe_key.startswith('sk_'):
                    print("   ❌ Invalid format - Stripe keys start with 'sk_'")
                else:
                    secrets_to_configure['stripe_secret_key'] = stripe_key
                    print("   ✅ Stripe secret key configured")
        
        if 'stripe_webhook_secret' in existing_secrets:
            print("   ✅ Stripe webhook secret already configured")
            response = input("   Replace with new secret? (yes/no): ").strip().lower()
            if response == 'yes':
                webhook_secret = getpass.getpass("   Stripe Webhook Secret (whsec_...): ").strip()
                if webhook_secret and webhook_secret.startswith('whsec_'):
                    secrets_to_configure['stripe_webhook_secret'] = webhook_secret
                    print("   ✅ Stripe webhook secret updated")
        else:
            print("   ⚠️  Stripe webhook secret not configured")
            webhook_secret = getpass.getpass("   Enter Stripe Webhook Secret (whsec_... or press Enter to skip): ").strip()
            if webhook_secret:
                if not webhook_secret.startswith('whsec_'):
                    print("   ❌ Invalid format - Webhook secrets start with 'whsec_'")
                else:
                    secrets_to_configure['stripe_webhook_secret'] = webhook_secret
                    print("   ✅ Stripe webhook secret configured")
        
        print()
        
        # 3. Other API Keys (optional)
        print("3️⃣  Optional API Keys")
        print("-" * 40)
        print("   Press Enter to skip any optional keys")
        
        # SendGrid
        if 'sendgrid_api_key' not in existing_secrets:
            sendgrid_key = getpass.getpass("   SendGrid API Key (optional): ").strip()
            if sendgrid_key:
                secrets_to_configure['sendgrid_api_key'] = sendgrid_key
                print("   ✅ SendGrid API key configured")
        
        # FCM
        if 'fcm_server_key' not in existing_secrets:
            fcm_key = getpass.getpass("   FCM Server Key (optional): ").strip()
            if fcm_key:
                secrets_to_configure['fcm_server_key'] = fcm_key
                print("   ✅ FCM server key configured")
        
        print()
        
        # Summary and confirmation
        print("📋 Summary of Changes")
        print("-" * 40)
        
        if not secrets_to_configure:
            print("   No changes to make - all secrets already configured")
            return
        
        print(f"   Will configure {len(secrets_to_configure)} secret(s):")
        for key in secrets_to_configure:
            if 'jwt' in key or 'refresh' in key:
                print(f"   • {key}: [auto-generated]")
            else:
                print(f"   • {key}: [user-provided]")
        
        print()
        confirm = input("⚠️  Confirm save to Firestore? (yes/no): ").strip().lower()
        
        if confirm != 'yes':
            print("❌ Setup cancelled")
            return
        
        # Save to Firestore
        if secrets_doc.exists:
            # Update existing document
            secrets_ref.update(secrets_to_configure)
            print("✅ Secrets updated successfully!")
        else:
            # Create new document
            secrets_ref.set(secrets_to_configure)
            print("✅ Secrets created successfully!")
        
        print()
        print("🎉 Secret configuration complete!")
        print()
        print("⚠️  IMPORTANT SECURITY NOTES:")
        print("   1. Never share these secrets or commit them to version control")
        print("   2. Ensure Firestore security rules restrict access to platform_settings")
        print("   3. Monitor access logs for unauthorized attempts")
        print("   4. Rotate JWT secrets periodically (quarterly recommended)")
        print("   5. Use different Stripe keys for test/production environments")
        print()
        print("📝 Next Steps:")
        print("   1. Deploy the updated backend: ./deploy-container.sh backend")
        print("   2. Test authentication: curl /api/v1/auth/login")
        print("   3. Test payments (if configured): test_payment_flow.sh")
        print("   4. Monitor logs for any secret loading errors")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("⚠️  WARNING: This script will configure production secrets")
    print("   Only run this in a secure environment")
    print()
    proceed = input("Continue? (yes/no): ").strip().lower()
    
    if proceed == 'yes':
        setup_all_secrets()
    else:
        print("Setup cancelled")