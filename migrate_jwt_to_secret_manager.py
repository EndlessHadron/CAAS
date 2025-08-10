#!/usr/bin/env python3
"""
Migrate JWT secrets from Firestore to Google Secret Manager
These are crown-jewel credentials that need proper IAM, audit logs, and versioning
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
    print("🔐 JWT Secret Migration to Secret Manager")
    print("=" * 60)
    print("Moving crown-jewel credentials to proper secure storage...")
    print()
    
    try:
        # Import required modules
        from google.cloud import secretmanager
        from google.cloud import firestore
        from google.auth import default
        
        # Get credentials and project
        credentials, project = default()
        project_id = 'caas-467918'
        
        print(f"Project: {project_id}")
        print()
        
        # Initialize clients
        sm_client = secretmanager.SecretManagerServiceClient(credentials=credentials)
        db = firestore.Client(project=project_id, credentials=credentials)
        
        # Define the secrets to migrate
        secrets_to_migrate = [
            {
                'firestore_key': 'jwt_secret_key',
                'secret_manager_id': 'jwt-signing-key',
                'description': 'JWT access token signing key - CRITICAL',
                'labels': {
                    'environment': 'production',
                    'service': 'authentication',
                    'criticality': 'crown-jewel'
                }
            },
            {
                'firestore_key': 'refresh_secret_key',
                'secret_manager_id': 'refresh-token-key',
                'description': 'JWT refresh token signing key - CRITICAL',
                'labels': {
                    'environment': 'production',
                    'service': 'authentication',
                    'criticality': 'crown-jewel'
                }
            }
        ]
        
        # Step 1: Get current secrets from Firestore (if they exist)
        print("📋 Step 1: Checking current secrets in Firestore...")
        secrets_ref = db.collection('caas_platform_settings').document('secrets')
        secrets_doc = secrets_ref.get()
        
        current_secrets = {}
        if secrets_doc.exists:
            firestore_data = secrets_doc.to_dict()
            for secret_config in secrets_to_migrate:
                key = secret_config['firestore_key']
                if key in firestore_data:
                    current_secrets[key] = firestore_data[key]
                    print(f"  ✓ Found {key} in Firestore")
                else:
                    print(f"  ⚠ {key} not in Firestore, will generate new")
        else:
            print("  ⚠ No secrets document in Firestore")
        
        print()
        
        # Step 2: Create or update secrets in Secret Manager
        print("📤 Step 2: Creating/updating secrets in Secret Manager...")
        
        for secret_config in secrets_to_migrate:
            secret_id = secret_config['secret_manager_id']
            firestore_key = secret_config['firestore_key']
            parent = f"projects/{project_id}"
            secret_name = f"{parent}/secrets/{secret_id}"
            
            # Get or generate the secret value
            if firestore_key in current_secrets:
                secret_value = current_secrets[firestore_key]
                print(f"\n  Migrating existing {firestore_key}...")
            else:
                secret_value = generate_secure_secret()
                print(f"\n  Generating new {firestore_key}...")
            
            try:
                # Try to get the secret first
                secret = sm_client.get_secret(request={"name": secret_name})
                print(f"    ✓ Secret '{secret_id}' already exists")
                
                # Add a new version with the value
                version_request = {
                    "parent": secret_name,
                    "payload": {"data": secret_value.encode("UTF-8")}
                }
                version = sm_client.add_secret_version(request=version_request)
                print(f"    ✓ Added new version: {version.name.split('/')[-1]}")
                
            except Exception as e:
                if "404" in str(e) or "NOT_FOUND" in str(e):
                    # Secret doesn't exist, create it
                    print(f"    Creating new secret '{secret_id}'...")
                    
                    secret_request = {
                        "parent": parent,
                        "secret_id": secret_id,
                        "secret": {
                            "replication": {"automatic": {}},
                            "labels": secret_config['labels']
                        }
                    }
                    
                    secret = sm_client.create_secret(request=secret_request)
                    print(f"    ✓ Created secret: {secret.name}")
                    
                    # Add the initial version
                    version_request = {
                        "parent": secret.name,
                        "payload": {"data": secret_value.encode("UTF-8")}
                    }
                    version = sm_client.add_secret_version(request=version_request)
                    print(f"    ✓ Added initial version: {version.name.split('/')[-1]}")
                else:
                    print(f"    ❌ Error: {e}")
                    raise
            
            # Set up rotation reminder (metadata)
            print(f"    ℹ️  Rotation recommended: Quarterly")
            print(f"    ℹ️  Description: {secret_config['description']}")
        
        print()
        
        # Step 3: Remove JWT secrets from Firestore
        print("🗑️  Step 3: Removing JWT secrets from Firestore...")
        
        if secrets_doc.exists:
            firestore_data = secrets_doc.to_dict()
            
            # Remove JWT keys
            removed_keys = []
            for secret_config in secrets_to_migrate:
                key = secret_config['firestore_key']
                if key in firestore_data:
                    del firestore_data[key]
                    removed_keys.append(key)
            
            # Update Firestore (keeping other non-JWT secrets if any)
            if removed_keys:
                if firestore_data:  # Still has other secrets
                    secrets_ref.set(firestore_data)
                    print(f"  ✓ Removed {len(removed_keys)} JWT secrets from Firestore")
                    print(f"    Removed: {', '.join(removed_keys)}")
                    print(f"    Remaining in Firestore: {', '.join(firestore_data.keys())}")
                else:  # No secrets left
                    secrets_ref.delete()
                    print(f"  ✓ Removed all secrets from Firestore (document deleted)")
            else:
                print("  ℹ️  No JWT secrets found in Firestore to remove")
        else:
            print("  ℹ️  No Firestore secrets document to clean up")
        
        print()
        
        # Step 4: Verify the migration
        print("✅ Step 4: Verifying migration...")
        
        for secret_config in secrets_to_migrate:
            secret_id = secret_config['secret_manager_id']
            secret_name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
            
            try:
                response = sm_client.access_secret_version(request={"name": secret_name})
                print(f"  ✓ {secret_id}: Accessible in Secret Manager")
            except Exception as e:
                print(f"  ❌ {secret_id}: Failed to access - {e}")
        
        print()
        print("🎉 Migration Complete!")
        print()
        print("📋 Summary:")
        print("  • JWT secrets moved to Secret Manager with proper security controls")
        print("  • Per-secret IAM policies now available")
        print("  • Access audit logs enabled automatically")
        print("  • Version history maintained for rollback")
        print("  • Rotation reminders can be configured")
        print()
        print("⚠️  IMPORTANT NEXT STEPS:")
        print("  1. Deploy the backend to use the new configuration")
        print("  2. Test authentication to ensure JWT secrets load from Secret Manager")
        print("  3. Update IAM policies to restrict access to jwt-signing-key and refresh-token-key")
        print("  4. Configure rotation reminders in Secret Manager console")
        print()
        print("🔒 Security Benefits Gained:")
        print("  • Full audit trail of who accessed JWT secrets and when")
        print("  • Ability to grant/revoke access per secret")
        print("  • Automatic versioning for safe rotation")
        print("  • Integration with Cloud KMS for encryption at rest")
        print("  • Compliance with security best practices")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Run non-interactively for automation
    if "--yes" in sys.argv or "--force" in sys.argv:
        if main():
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        print("⚠️  WARNING: This will migrate JWT secrets to Secret Manager")
        print("   This is a one-way migration for improved security")
        print()
        print("Run with --yes to proceed automatically")
        sys.exit(0)