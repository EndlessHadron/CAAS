#!/usr/bin/env python3
"""
Resend Setup for neatly
Quick setup to get Resend working for email notifications
"""

import json
import subprocess
import sys
import os

def setup_resend():
    print("=" * 60)
    print("Resend Setup for neatly")
    print("=" * 60)
    print()
    print("This will configure Resend for sending emails from support@theneatlyapp.com")
    print()
    
    print("Step 1: Get Resend API Key")
    print("-" * 40)
    print()
    print("1. Go to: https://resend.com/signup")
    print("2. Sign up for a FREE account")
    print("3. After login, go to: API Keys")
    print("4. Click 'Create API Key'")
    print("5. Name: 'neatly Production'")
    print("6. Permission: 'Full Access'")
    print("7. Copy the API key (starts with 're_')")
    print()
    
    api_key = input("Paste your Resend API key here: ").strip()
    
    if not api_key or not api_key.startswith('re_'):
        print("Invalid API key format. Resend keys start with 're_'")
        return False
    
    print()
    print("Step 2: Verify Domain (Important for custom email)")
    print("-" * 40)
    print()
    print("To send from support@theneatlyapp.com:")
    print()
    print("1. In Resend dashboard, go to: Domains")
    print("2. Click 'Add Domain'")
    print("3. Enter: theneatlyapp.com")
    print("4. Add these DNS records to your domain:")
    print()
    print("   Type: TXT")
    print("   Name: resend._domainkey")
    print("   Value: (shown in Resend dashboard)")
    print()
    print("   Type: TXT") 
    print("   Name: @")
    print("   Value: (SPF record shown in dashboard)")
    print()
    print("5. Click 'Verify' in Resend after adding DNS records")
    print()
    
    domain_verified = input("Have you verified the domain? (y/n/skip): ").strip().lower()
    
    if domain_verified == 'skip':
        print("Note: Emails will be sent from onboarding@resend.dev until domain is verified")
    
    print()
    print("Step 3: Store API Key in Secret Manager")
    print("-" * 40)
    
    # Save API key to temp file
    with open("temp_resend_key.txt", "w") as f:
        f.write(api_key)
    
    try:
        # Check if secret exists
        result = subprocess.run(
            ["gcloud", "secrets", "describe", "resend-api-key"],
            capture_output=True
        )
        
        if result.returncode == 0:
            # Update existing secret
            subprocess.run([
                "gcloud", "secrets", "versions", "add", "resend-api-key",
                "--data-file=temp_resend_key.txt"
            ], check=True)
            print("✅ Updated existing Resend secret")
        else:
            # Create new secret
            subprocess.run([
                "gcloud", "secrets", "create", "resend-api-key",
                "--data-file=temp_resend_key.txt",
                "--replication-policy=automatic"
            ], check=True)
            print("✅ Created Resend secret")
        
        # Grant access to service account
        subprocess.run([
            "gcloud", "secrets", "add-iam-policy-binding", "resend-api-key",
            "--member=serviceAccount:102964896009-compute@developer.gserviceaccount.com",
            "--role=roles/secretmanager.secretAccessor"
        ], check=False)  # Don't fail if already has access
        
        print("✅ Granted access to service account")
        
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Could not store in Secret Manager: {e}")
        print("You can set it as an environment variable instead:")
        print(f"RESEND_API_KEY={api_key}")
    finally:
        # Clean up temp file
        if os.path.exists("temp_resend_key.txt"):
            os.remove("temp_resend_key.txt")
    
    print()
    print("Step 4: Test Email")
    print("-" * 40)
    
    test = input("Send a test email? (y/n): ").strip().lower()
    
    if test == 'y':
        test_to = input("Send test email to: ").strip()
        
        print("\nSending test email via Resend...")
        
        try:
            import resend
            
            resend.api_key = api_key
            
            # Determine sender based on domain verification
            if domain_verified == 'y':
                from_email = "support@theneatlyapp.com"
            else:
                from_email = "onboarding@resend.dev"
                print(f"Note: Using {from_email} until domain is verified")
            
            params = {
                "from": f"neatly <{from_email}>",
                "to": [test_to],
                "subject": "Test Email from neatly",
                "html": """
                <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                        <h1>Resend is Working! 🎉</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p>This test email confirms that Resend is configured correctly for neatly.</p>
                        <p>Emails will be sent from: <strong>support@theneatlyapp.com</strong></p>
                        <p>Ready to send:</p>
                        <ul>
                            <li>Welcome emails</li>
                            <li>Booking confirmations</li>
                            <li>Payment receipts</li>
                            <li>Reminders</li>
                        </ul>
                    </div>
                </div>
                """
            }
            
            response = resend.Emails.send(params)
            
            if response.get("id"):
                print(f"✅ Test email sent successfully to {test_to}")
                print(f"Email ID: {response['id']}")
            else:
                print(f"⚠️  Unexpected response: {response}")
                
        except Exception as e:
            print(f"❌ Failed to send test email: {e}")
            print("Make sure to install resend: pip install resend")
    
    print()
    print("=" * 60)
    print("✅ Resend Setup Complete!")
    print("=" * 60)
    print()
    print("Resend is configured to send emails from:")
    if domain_verified == 'y':
        print("  support@theneatlyapp.com ✅")
    else:
        print("  onboarding@resend.dev (temporary)")
        print("  support@theneatlyapp.com (after domain verification)")
    print()
    print("Free tier includes:")
    print("  • 3,000 emails per month")
    print("  • 100 emails per day")
    print("  • Much better than SendGrid's free tier!")
    print()
    print("To activate in your code:")
    print("  Update imports in 3 files:")
    print("  - app/api/v1/payments.py")
    print("  - app/api/v1/auth_production.py")
    print("  - app/simple_bookings.py")
    print()
    print("  Change from:")
    print("    from app.services.sendgrid_email_service import email_service")
    print()
    print("  To:")
    print("    from app.services.resend_email_service import email_service")
    print()
    
    return True

if __name__ == "__main__":
    try:
        # Install resend if not present
        try:
            import resend
        except ImportError:
            print("Installing resend package...")
            subprocess.run([sys.executable, "-m", "pip", "install", "resend"], check=True)
        
        setup_resend()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled")
    except Exception as e:
        print(f"\n❌ Error: {e}")