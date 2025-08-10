#!/usr/bin/env python3
"""
Production hotfix to ensure secrets are in the correct Firestore location
This script can be run locally with gcloud auth or as a Cloud Run job
"""
import sys
import secrets
import string
from datetime import datetime

def generate_secure_secret(length=64):
    """Generate a cryptographically secure random secret"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    print("🚨 PRODUCTION SECRET HOTFIX")
    print("=" * 60)
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    
    try:
        # Import Firestore
        from google.cloud import firestore
        from google.auth import default
        
        # Get credentials and project
        credentials, project = default()
        print(f"Project: {project}")
        
        # Initialize Firestore client
        db = firestore.Client(project='caas-467918', credentials=credentials)
        
        # Define BOTH possible collection paths
        paths_to_check = [
            ('caas_platform_settings', 'With prefix (CORRECT)'),
            ('platform_settings', 'Without prefix (LEGACY)')
        ]
        
        secrets_found = False
        existing_secrets = {}
        
        # Check both paths
        for collection_name, description in paths_to_check:
            print(f"\nChecking {description}: {collection_name}/secrets")
            doc_ref = db.collection(collection_name).document('secrets')
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                print(f"  ✅ Found {len(data)} secrets")
                for key in data:
                    if 'stripe' in key.lower():
                        print(f"     - {key}: {data[key][:20]}...")
                    else:
                        print(f"     - {key}: [exists]")
                existing_secrets.update(data)
                secrets_found = True
            else:
                print(f"  ❌ No secrets document found")
        
        # Always ensure secrets exist in the CORRECT location
        correct_collection = 'caas_platform_settings'
        correct_ref = db.collection(correct_collection).document('secrets')
        
        # Prepare secrets data
        final_secrets = {}
        
        # Use existing secrets if found, otherwise generate new ones
        if existing_secrets.get('jwt_secret_key'):
            final_secrets['jwt_secret_key'] = existing_secrets['jwt_secret_key']
            print(f"\n♻️  Reusing existing JWT secret")
        else:
            final_secrets['jwt_secret_key'] = generate_secure_secret()
            print(f"\n🔑 Generated new JWT secret")
        
        if existing_secrets.get('refresh_secret_key'):
            final_secrets['refresh_secret_key'] = existing_secrets['refresh_secret_key']
            print(f"♻️  Reusing existing refresh secret")
        else:
            final_secrets['refresh_secret_key'] = generate_secure_secret()
            print(f"🔑 Generated new refresh secret")
        
        # Always use test Stripe keys for now
        final_secrets['stripe_secret_key'] = existing_secrets.get('stripe_secret_key', 'stripe_test_key_placeholder')
        final_secrets['stripe_webhook_secret'] = existing_secrets.get('stripe_webhook_secret', 'whsec_' + generate_secure_secret(32))
        
        # Write to the CORRECT location
        print(f"\n📝 Writing secrets to {correct_collection}/secrets...")
        correct_ref.set(final_secrets)
        
        # Verify the write
        verification = correct_ref.get()
        if verification.exists:
            print("✅ Secrets successfully written and verified!")
            print(f"   Collection: {correct_collection}")
            print(f"   Document: secrets")
            print(f"   Keys configured: {list(verification.to_dict().keys())}")
        else:
            print("❌ Failed to verify secret write!")
            return False
        
        # Also check Secret Manager as fallback
        print("\n🔍 Checking Secret Manager fallback...")
        try:
            from google.cloud import secretmanager
            sm_client = secretmanager.SecretManagerServiceClient()
            
            secret_names = ['jwt-signing-key', 'refresh-token-key']
            for secret_name in secret_names:
                try:
                    name = f"projects/{project}/secrets/{secret_name}/versions/latest"
                    response = sm_client.access_secret_version(request={"name": name})
                    print(f"  ✅ {secret_name}: Available in Secret Manager")
                except Exception:
                    print(f"  ⚠️  {secret_name}: Not in Secret Manager (Firestore will be used)")
        except ImportError:
            print("  ℹ️  Secret Manager client not available")
        
        print("\n🎉 HOTFIX COMPLETE - Secrets are properly configured!")
        print("   Next step: Restart the Cloud Run service to pick up changes")
        print("   Command: gcloud run services update caas-backend --region=us-central1")
        
        return True
        
    except Exception as e:
        print(f"\n❌ HOTFIX FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if main():
        sys.exit(0)
    else:
        sys.exit(1)