# Enable Apple Pay & Google Pay in Stripe

## Quick Setup Guide

### 1. Enable Payment Methods in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings → Payment methods**
3. Enable these payment methods:
   - ✅ **Apple Pay** - Click "Turn on" 
   - ✅ **Google Pay** - Click "Turn on"
   - ✅ **Link** (Stripe's one-click checkout)
   - ✅ **Klarna** (Buy now, pay later)
   - ✅ **Clearpay/Afterpay** (Buy now, pay later)

### 2. Configure Apple Pay Domain Verification

**IMPORTANT**: Apple Pay requires domain verification to work on web.

#### Step-by-Step Domain Verification:

1. **Access Apple Pay Settings**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to **Settings → Payment methods → Apple Pay**
   - Click on **"Configure"** or **"Settings"**

2. **Register Your Domain**
   - Click **"Add new domain"** 
   - Enter your production domain:
     ```
     caas-frontend-102964896009.us-central1.run.app
     ```
   - Click **"Add"**

3. **Download Verification File**
   - After adding the domain, click **"Download verification file"**
   - The file will be named: `apple-developer-merchantid-domain-association`
   - This is a text file with no extension

4. **Deploy Verification File to Your Frontend**
   
   Create the directory and file in your frontend:
   ```bash
   # Create the .well-known directory
   mkdir -p caas-frontend/public/.well-known
   
   # Copy the downloaded file to the correct location
   cp ~/Downloads/apple-developer-merchantid-domain-association \
      caas-frontend/public/.well-known/apple-developer-merchantid-domain-association
   ```

5. **Verify File is Accessible**
   
   After deployment, the file must be accessible at:
   ```
   https://caas-frontend-102964896009.us-central1.run.app/.well-known/apple-developer-merchantid-domain-association
   ```

6. **Complete Verification in Stripe**
   - Return to Stripe Dashboard
   - Click **"Verify"** next to your domain
   - Stripe will check for the file and verify the domain
   - Status should change to **"Verified"** ✅

### 3. Google Pay Configuration

Google Pay should work automatically once enabled, but verify:

1. In Stripe Dashboard, go to **Settings → Payment methods → Google Pay**
2. Ensure **"Web Payments"** is enabled
3. No domain verification needed for Google Pay

### 4. Test Configuration

Use these test cards to verify each payment method:

#### Apple Pay Testing
- Use Safari on Mac with a test Apple ID
- Or use iPhone/iPad with test Apple ID
- Card: 4000 0027 6000 3184

#### Google Pay Testing  
- Use Chrome browser logged into Google account
- Card: 4242 4242 4242 4242

#### Regular Card Testing
- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- 3D Secure: 4000 0027 6000 3184

### 5. Frontend Configuration (Already Done)

The Payment Element is now configured to:
- Show payment methods in order: Apple Pay → Google Pay → Card → Others
- Use `accordion` layout for better UX
- Set `wallets` to `always` show when available
- Auto-detect device capabilities

### 6. Why Payment Methods May Not Appear

**Apple Pay won't show if:**
- Not using Safari on Mac or iOS device
- Domain not verified in Stripe Dashboard
- Not enabled in Stripe Dashboard
- Testing on localhost (requires HTTPS)

**Google Pay won't show if:**
- Not enabled in Stripe Dashboard  
- Using unsupported browser
- Testing on localhost (requires HTTPS)

**Other methods won't show if:**
- Not enabled in Stripe Dashboard
- Currency/country restrictions
- Amount below minimum threshold

### 7. Verify in Production

After deployment, test the payment flow:

1. Create a test booking
2. Navigate to payment page
3. You should see payment methods in this order:
   - Apple Pay (on Safari/iOS)
   - Google Pay (on Chrome/Android)
   - Card (always visible)
   - Other methods based on eligibility

### 8. Monitor Payment Methods

Check which methods customers are using:

1. Go to Stripe Dashboard → **Payments**
2. Filter by payment method type
3. Monitor conversion rates

## Troubleshooting

### Payment methods not showing after configuration?

1. **Clear browser cache**
2. **Check browser console** for errors
3. **Verify Stripe Dashboard** shows methods as "Active"
4. **Test in incognito/private mode**
5. **Check Cloud Run logs** for backend errors:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=caas-backend" --limit=50
   ```

### Still having issues?

Contact Stripe Support with:
- Your account ID
- Screenshot of Payment methods settings
- Browser console errors
- Payment Intent ID from logs