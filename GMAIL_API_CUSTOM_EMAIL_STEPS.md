# Gmail API Setup with support@theneatlyapp.com

## Complete Step-by-Step Guide

### Step 1: Configure Gmail "Send As" (Required First!)

This lets Gmail send emails as support@theneatlyapp.com

1. **Login to Gmail** (destinywiki9@gmail.com)

2. **Go to Settings**
   - Click gear icon → "See all settings"
   - Go to "Accounts and Import" tab

3. **Add "Send mail as"**
   - In "Send mail as" section, click "Add another email address"
   - **Name**: neatly Support
   - **Email**: support@theneatlyapp.com
   - **Uncheck** "Treat as an alias"
   - Click "Next Step"

4. **Configure SMTP**
   - **SMTP Server**: smtp.gmail.com
   - **Port**: 587
   - **Username**: destinywiki9@gmail.com
   - **Password**: 
     - If 2FA is OFF: Your Gmail password
     - If 2FA is ON: Generate an App Password (see below)
   - **TLS**: Selected
   - Click "Add Account"

5. **Verify Email**
   - Gmail sends a verification email to support@theneatlyapp.com
   - Since you own the domain, set up email forwarding first:
     - Option A: Use your domain provider's email forwarding
     - Option B: Use Cloudflare Email Routing (free)
   - Or enter the verification code if you receive it another way

### Step 1.5: Generate App Password (If 2FA is enabled)

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other" → type "neatly SMTP"
4. Click "Generate"
5. Copy the 16-character password
6. Use this in the SMTP password field above

### Step 2: Create OAuth2 Credentials

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials?project=caas-467918
   ```

2. **Configure OAuth Consent Screen** (if not done)
   - Click "CONFIGURE CONSENT SCREEN"
   - User Type: **External**
   - App name: **neatly Email Service**
   - User support email: **destinywiki9@gmail.com**
   - Developer contact: **destinywiki9@gmail.com**
   - Save and Continue (skip optional fields)

3. **Create OAuth2 Client**
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: **Desktop app**
   - Name: **neatly Email Service**
   - Click "CREATE"
   - **DOWNLOAD THE JSON FILE** (important!)

### Step 3: Authorize Gmail API

1. **Save the downloaded JSON** as `oauth_credentials.json`

2. **Run the setup script**:
   ```bash
   python3 setup_email_with_domain.py
   ```

3. **When prompted**:
   - Enter path to `oauth_credentials.json`
   - Browser will open
   - Sign in with **destinywiki9@gmail.com**
   - Click "Continue" (ignore warnings about unverified app)
   - Allow access to Gmail

4. **Script will**:
   - Get refresh token
   - Store in Secret Manager
   - Send test email

### Step 4: Update Email Service to Use Gmail

Change these 3 files back to Gmail:

1. **app/api/v1/payments.py**
   ```python
   # Change from:
   from app.services.sendgrid_email_service import email_service
   # To:
   from app.services.email_service import email_service
   ```

2. **app/api/v1/auth_production.py**
   ```python
   # Change from:
   from app.services.sendgrid_email_service import email_service
   # To:
   from app.services.email_service import email_service
   ```

3. **app/simple_bookings.py**
   ```python
   # Change from:
   from app.services.sendgrid_email_service import email_service
   # To:
   from app.services.email_service import email_service
   ```

### Step 5: Deploy

```bash
cd caas-backend
gcloud run deploy caas-backend --source . --region us-central1
```

## Troubleshooting

### "Send As" Verification Issues

If you can't receive the verification email:

**Option A: Set up Email Forwarding (Cloudflare - FREE)**
1. Go to Cloudflare dashboard
2. Select theneatlyapp.com
3. Email → Email Routing
4. Add: support@theneatlyapp.com → destinywiki9@gmail.com
5. Now verification emails will forward to your Gmail

**Option B: Use Domain Provider's Email Forwarding**
- Most domain registrars offer email forwarding
- Set support@theneatlyapp.com → destinywiki9@gmail.com

**Option C: Temporary Workaround**
- Skip custom email for now
- Use destinywiki9@gmail.com directly
- Add custom domain later

### OAuth2 Issues

If the browser doesn't open:
- Copy the URL from terminal
- Open manually in browser
- Complete authorization
- Copy the code back to terminal

### Test Email Not Sending

Check:
1. Gmail "Send As" is verified
2. OAuth credentials are correct
3. Secret Manager has the credentials
4. Less secure app access (if needed): https://myaccount.google.com/lesssecureapps

## Benefits of Gmail API vs SendGrid

| Feature | Gmail API | SendGrid |
|---------|-----------|----------|
| Free Emails | 500/day | 100/day |
| Setup Complexity | Medium | Easy |
| Custom Domain | Yes (with Send As) | Yes |
| Deliverability | Good | Excellent |
| Analytics | Basic | Advanced |
| Cost | FREE | FREE (limited) |

## Quick Test

After setup, test with:
```python
from app.services.email_service import email_service
import asyncio

asyncio.run(
    email_service.send_email(
        "your-email@example.com",
        "Test from neatly",
        "<h1>It works!</h1>",
        "It works!"
    )
)
```

Emails will show as from: **support@theneatlyapp.com** ✨