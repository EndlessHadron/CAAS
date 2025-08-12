# Setting Up support@theneatlyapp.com Email

## The Problem
- OAuth Playground only lets you send from your actual Gmail address
- To send from `support@theneatlyapp.com`, you need proper setup

## Solution Options

### Option 1: Gmail "Send As" (FREE - Recommended)
This lets you send from `support@theneatlyapp.com` using your Gmail account.

#### Step 1: Set up Email Forwarding (Cloudflare)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `theneatlyapp.com` domain
3. Go to **Email → Email Routing**
4. Create routing rules:
   - `support@theneatlyapp.com` → `destinywiki9@gmail.com`
   - `noreply@theneatlyapp.com` → `destinywiki9@gmail.com`

#### Step 2: Configure Gmail to Send As
1. Open Gmail (destinywiki9@gmail.com)
2. Go to **Settings → Accounts → Send mail as**
3. Click **Add another email address**
4. Enter:
   - Name: `neatly Support`
   - Email: `support@theneatlyapp.com`
   - Uncheck "Treat as alias"
5. Click **Next Step**
6. For SMTP:
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Username: `destinywiki9@gmail.com`
   - Password: Your Gmail password (or App Password if 2FA enabled)
7. Click **Add Account**
8. Gmail will send a verification code to `support@theneatlyapp.com`
9. Since it forwards to your Gmail, check your inbox for the code
10. Enter the verification code

#### Step 3: Create App Password (if using 2FA)
1. Go to https://myaccount.google.com/apppasswords
2. Select app: Mail
3. Select device: Other (enter "neatly")
4. Copy the 16-character password
5. Use this instead of your regular password in SMTP settings

#### Step 4: Create OAuth Credentials
Now create the OAuth credentials:

1. Go to: https://console.cloud.google.com/apis/credentials?project=caas-467918
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If you see "To create an OAuth client ID, you must first configure your consent screen":
   - Click **CONFIGURE CONSENT SCREEN**
   - User Type: **External**
   - Fill in:
     - App name: `neatly`
     - User support email: `destinywiki9@gmail.com`
     - Developer contact: `destinywiki9@gmail.com`
   - Save and continue through all steps
4. Back to credentials, click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **Desktop app**
6. Name: `neatly Email Service`
7. Click **CREATE**
8. Download the JSON file

#### Step 5: Authorize and Test
Run the setup with your downloaded credentials:
```bash
python3 setup_email_with_domain.py
```

When it opens the browser:
1. Sign in with `destinywiki9@gmail.com`
2. Allow access
3. The script will configure everything

Now emails will show as coming from `support@theneatlyapp.com`!

### Option 2: Google Workspace ($6/month)
If you want a real support@theneatlyapp.com mailbox:

1. Sign up for [Google Workspace](https://workspace.google.com)
2. Add your domain `theneatlyapp.com`
3. Verify domain ownership
4. Create user `support@theneatlyapp.com`
5. Use those credentials with OAuth

### Option 3: Use a Transactional Email Service
Services designed for this:

#### Resend (Recommended for developers)
- FREE: 3,000 emails/month
- $20/month: 50,000 emails
- Great API, built for developers
- Supports custom domains easily

#### SendGrid
- Limited free tier (100/day)
- $19.95/month for 50,000 emails
- Industry standard

## Quick Fix for Now

If you want to test immediately without the full setup:

1. Use the OAuth Playground method
2. Emails will come from `destinywiki9@gmail.com`
3. But we set Reply-To as `support@theneatlyapp.com`
4. Later, complete the Gmail "Send As" setup

## DNS Records for Better Delivery

Add these to your domain for better email delivery:

### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

### DMARC Record
```
Type: TXT  
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:support@theneatlyapp.com
```

These tell email providers that Google is authorized to send email for your domain.

## Summary

**For FREE custom domain email:**
1. Set up Cloudflare email routing (forward to Gmail)
2. Configure Gmail "Send As" feature
3. Create proper OAuth credentials
4. Run the setup script

This gives you professional `support@theneatlyapp.com` emails at no extra cost!