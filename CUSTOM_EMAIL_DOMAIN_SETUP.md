# Custom Email Domain Setup for neatly

## Domain Options & Costs

### Option 1: neatly.com (Preferred)
- **Domain Cost**: ~$12/year
- **Availability**: Need to check if available

### Option 2: theneatlyapp.com 
- **Domain Cost**: ~$12/year
- **Status**: Likely available

## Email Service Options with Custom Domain

### 1. Google Workspace (Recommended)
**Cost**: $6/user/month
**Setup**: Easy with your existing GCP account
**Benefits**:
- Professional email: support@neatly.com
- Works perfectly with Gmail API
- 30GB storage
- Google Calendar, Drive, etc.
- Best deliverability

### 2. Cloudflare Email Routing (FREE) + Gmail
**Cost**: FREE (just domain cost)
**How it works**:
1. Buy domain through Cloudflare ($10/year)
2. Set up email routing rules
3. Forward emails to destinywiki9@gmail.com
4. Send emails "from" neatly.com using Gmail

**Setup**:
- Receive at: support@neatly.com → forwards to → destinywiki9@gmail.com
- Send from: destinywiki9@gmail.com as support@neatly.com

### 3. Resend (Developer-Friendly)
**Cost**: FREE for 3,000 emails/month, then $20/month
**Benefits**:
- Built for developers
- Great API
- Good deliverability
- React email templates

## Recommended Approach

### Phase 1: Cloudflare Email (Immediate & Free)
1. Register neatly.com via Cloudflare
2. Set up email routing
3. Configure Gmail to send as support@neatly.com

### Phase 2: Google Workspace (When scaling)
- Upgrade when you need multiple email addresses
- Better for team collaboration

## Step-by-Step: Cloudflare Email Setup

### 1. Register Domain
```bash
# Go to: https://www.cloudflare.com/products/registrar/
# Search for: neatly.com
# Register for ~$10/year
```

### 2. Enable Email Routing
```
1. In Cloudflare Dashboard → Email → Email Routing
2. Click "Get started"
3. Add destination: destinywiki9@gmail.com
4. Create custom addresses:
   - support@neatly.com → destinywiki9@gmail.com
   - noreply@neatly.com → destinywiki9@gmail.com
   - hello@neatly.com → destinywiki9@gmail.com
```

### 3. Configure Gmail to Send As Custom Domain
```
1. In Gmail → Settings → Accounts → Send mail as
2. Add: support@neatly.com
3. SMTP Server: smtp.gmail.com
4. Port: 587
5. Username: destinywiki9@gmail.com
6. Password: Your Gmail password or app password
```

### 4. Set SPF, DKIM, DMARC Records
```
# SPF Record
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"

# DMARC Record
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=none; rua=mailto:support@neatly.com"
```

## Implementation Plan

### Today (Free Solution)
1. Register neatly.com on Cloudflare ($10)
2. Set up email routing (FREE)
3. Configure Gmail API with destinywiki9@gmail.com
4. Send emails with "From: support@neatly.com"

### Code Changes Needed

```python
# In email_service.py
self.sender_email = "support@neatly.com"  # Display email
self.gmail_account = "destinywiki9@gmail.com"  # Actual Gmail account

# When sending
message['From'] = f"neatly <support@neatly.com>"
message['Reply-To'] = "support@neatly.com"
```

## Cost Comparison

| Solution | Monthly Cost | Emails/Month | Custom Domain |
|----------|-------------|--------------|---------------|
| Current (Gmail) | $0 | 500/day | ❌ |
| Cloudflare + Gmail | $0 | 500/day | ✅ |
| Google Workspace | $6 | Unlimited* | ✅ |
| Resend | $0-20 | 3,000-50,000 | ✅ |

## Immediate Action Items

1. **Check domain availability**:
   - https://www.cloudflare.com/products/registrar/
   - Search: neatly.com
   - Alternative: theneatlyapp.com

2. **Register domain** ($10/year)

3. **Set up Cloudflare Email Routing** (5 minutes)

4. **Configure Gmail API** with your setup

## Email Addresses to Create

- **support@neatly.com** - Main support
- **noreply@neatly.com** - Automated emails
- **hello@neatly.com** - General inquiries
- **bookings@neatly.com** - Booking confirmations
- **payments@neatly.com** - Payment receipts

All forward to → destinywiki9@gmail.com

## Benefits of Custom Domain

✅ Professional appearance
✅ Better deliverability 
✅ Brand consistency
✅ Customer trust
✅ Easy to remember

## Next Steps

1. Register neatly.com (or theneatlyapp.com)
2. Set up Cloudflare Email Routing
3. Run Gmail OAuth setup
4. Update email templates with custom domain
5. Test email flow

This gives you professional email addresses immediately at minimal cost!