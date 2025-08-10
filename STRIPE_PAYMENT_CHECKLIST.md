# Stripe Payment Element Configuration Checklist

## Backend Requirements ✅

### 1. Payment Intent Creation
- [x] Use `automatic_payment_methods: { enabled: true }` 
- [x] Set `allow_redirects: 'always'` for bank redirect methods
- [x] Include proper amount and currency (GBP)
- [x] Add metadata for tracking

### 2. Stripe Initialization
- [x] Stripe API key loaded from Secret Manager
- [x] Lazy initialization to prevent startup failures

## Frontend Requirements ✅

### 1. Stripe Elements Configuration
- [x] Pass `clientSecret` from payment intent
- [x] Set `loader: 'auto'` for automatic loading
- [x] Configure appearance for consistent styling

### 2. Payment Element Options
- [x] Set `layout: 'tabs'` for better UX
- [x] Configure default billing country to 'GB'
- [x] Enable wallets (Apple Pay, Google Pay) with `auto`
- [x] Add terms configuration for various payment methods

### 3. Environment Variables
- [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set correctly
- [x] Using test key: pk_test_51QSoLlHjgOtFvMtF...

## Stripe Dashboard Configuration 📋

### IMPORTANT: Check these settings in your Stripe Dashboard

1. **Payment Methods** (Settings → Payment methods)
   - [ ] Cards - Should be enabled by default
   - [ ] Apple Pay - Enable and verify domain
   - [ ] Google Pay - Enable for web payments
   - [ ] Bacs Direct Debit - Enable for UK bank payments
   - [ ] SEPA Direct Debit - Optional for EU payments

2. **Apple Pay Domain Verification**
   - [ ] Add domain: caas-frontend-102964896009.europe-west2.run.app
   - [ ] Download verification file
   - [ ] Upload to /.well-known/apple-developer-merchantid-domain-association

3. **Payment Method Configuration**
   - [ ] Ensure GBP currency is enabled
   - [ ] Check country settings include UK

## Testing Payment Methods

### Test Cards for Different Scenarios:
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **3D Secure**: 4000 0027 6000 3184
- **UK Debit**: 4000 0582 6000 0005

### Test Bank Accounts (Bacs):
- **Sort Code**: 10-88-00
- **Account**: 00012345

## Troubleshooting

### If payment methods don't appear:

1. **Check Stripe Dashboard**
   - Verify payment methods are enabled
   - Check for any account restrictions
   - Ensure test mode is active

2. **Check Browser Console**
   - Look for Stripe initialization errors
   - Check network tab for failed API calls
   - Verify client secret format

3. **Verify Backend Response**
   ```bash
   curl -X POST https://caas-backend-102964896009.us-central1.run.app/api/v1/payments/create-intent \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"booking_id": "test-123"}'
   ```

4. **Common Issues**
   - Client secret not valid: Check backend is creating intent correctly
   - Payment methods not showing: Enable in Stripe Dashboard
   - Wallets not appearing: Domain verification required
   - Bank payments missing: Country/currency compatibility

## Next Steps

1. Log into Stripe Dashboard
2. Navigate to Settings → Payment methods
3. Enable desired payment methods
4. Save changes
5. Test payment flow in production

## Resources

- [Stripe Payment Element Docs](https://stripe.com/docs/payments/payment-element)
- [Automatic Payment Methods](https://stripe.com/docs/payments/payment-methods/integration-options#automatic-payment-methods)
- [Apple Pay on Web](https://stripe.com/docs/apple-pay)
- [Google Pay](https://stripe.com/docs/google-pay)