# CAAS Payment System Implementation Guide

## Architecture Overview

### Payment Flow
```
Client → Books Service → Stripe Payment Intent → Hold Funds
                ↓
         Service Completed
                ↓
    Platform Fee (15-20%) + Cleaner Payout (80-85%)
```

### Technology Stack
- **Stripe Connect Express**: Marketplace payments with automatic splits
- **Stripe Elements**: PCI-compliant card collection
- **Webhook Processing**: Real-time payment events
- **Firestore**: Payment state tracking

## Cost Structure

### Transaction Costs
- **Stripe Connect**: 1.5% + 25p per transaction
- **Express Account**: £2/month per cleaner
- **International cards**: +2% (can pass to customer)
- **Currency conversion**: 2% (if needed)

### Example: £50 Cleaning Service
- Customer pays: £50.00
- Stripe fee: £1.00 (1.5% + 25p)
- Your platform fee (20%): £10.00
- Cleaner receives: £39.00
- **Your net revenue: £9.00**

## Phase 1: Core Payment Infrastructure (Week 1)

### 1.1 Stripe Account Setup
```python
# caas-backend/app/core/stripe_client.py
import stripe
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    def __init__(self):
        self.stripe = stripe
    
    def create_connect_account(self, cleaner_data):
        """Create Express account for cleaner"""
        return self.stripe.Account.create(
            type='express',
            country='GB',
            email=cleaner_data['email'],
            capabilities={
                'card_payments': {'requested': True},
                'transfers': {'requested': True},
            },
            business_type='individual',
            business_profile={
                'mcc': '7349',  # Cleaning services
                'url': 'https://caas.co.uk',
            }
        )
    
    def create_payment_intent(self, booking_data):
        """Create payment with automatic transfer"""
        return self.stripe.PaymentIntent.create(
            amount=booking_data['amount_pence'],
            currency='gbp',
            payment_method_types=['card'],
            transfer_data={
                'destination': booking_data['cleaner_stripe_id'],
            },
            application_fee_amount=booking_data['platform_fee_pence'],
            metadata={
                'booking_id': booking_data['booking_id'],
                'client_id': booking_data['client_id'],
            }
        )
```

### 1.2 Database Schema Updates
```python
# Add to users collection (cleaners)
cleaner_profile = {
    'stripe_account_id': 'acct_xxx',
    'stripe_onboarding_complete': False,
    'payout_enabled': False,
    'charges_enabled': False,
    'bank_account_verified': False,
    'payment_details_submitted': False,
}

# Add to bookings collection
payment_data = {
    'stripe_payment_intent_id': 'pi_xxx',
    'stripe_transfer_id': 'tr_xxx',
    'payment_status': 'pending|processing|succeeded|failed|refunded',
    'amount_pence': 5000,
    'platform_fee_pence': 1000,
    'cleaner_payout_pence': 4000,
    'stripe_fee_pence': 100,
    'paid_at': '2025-01-01T00:00:00Z',
    'refunded_at': None,
    'refund_amount_pence': None,
}
```

## Phase 2: Cleaner Onboarding (Week 1)

### 2.1 Onboarding API Endpoint
```python
# caas-backend/app/api/v1/payments.py
@router.post("/cleaners/onboard")
async def create_onboarding_link(
    current_user: User = Depends(get_current_user),
    stripe_service: StripeService = Depends()
):
    """Generate Stripe Express onboarding link"""
    if current_user.role != 'cleaner':
        raise HTTPException(403, "Only cleaners can onboard")
    
    # Create or retrieve Stripe account
    if not current_user.profile.get('stripe_account_id'):
        account = stripe_service.create_connect_account({
            'email': current_user.email,
            'first_name': current_user.profile['first_name'],
            'last_name': current_user.profile['last_name'],
        })
        # Save account ID to user profile
        await user_repository.update_stripe_account(
            current_user.uid, 
            account.id
        )
    
    # Generate onboarding link
    link = stripe.AccountLink.create(
        account=current_user.profile['stripe_account_id'],
        refresh_url=f"{settings.FRONTEND_URL}/cleaner/onboarding",
        return_url=f"{settings.FRONTEND_URL}/cleaner/onboarding/complete",
        type='account_onboarding',
    )
    
    return {'onboarding_url': link.url}
```

### 2.2 Frontend Onboarding Flow
```typescript
// caas-frontend/app/cleaner/onboarding/page.tsx
export default function CleanerOnboarding() {
    const handleOnboarding = async () => {
        const response = await api.post('/api/v1/payments/cleaners/onboard');
        window.location.href = response.data.onboarding_url;
    };
    
    return (
        <div>
            <h2>Set Up Your Payments</h2>
            <p>Complete Stripe verification to receive payments</p>
            <button onClick={handleOnboarding}>
                Continue to Stripe
            </button>
        </div>
    );
}
```

## Phase 3: Client Payment Flow (Week 2)

### 3.1 Payment Collection
```python
# caas-backend/app/api/v1/bookings.py
@router.post("/bookings/{booking_id}/pay")
async def create_booking_payment(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    stripe_service: StripeService = Depends()
):
    """Create payment intent for booking"""
    booking = await booking_repository.get(booking_id)
    
    # Validate booking
    if booking.client_id != current_user.uid:
        raise HTTPException(403, "Not your booking")
    if booking.status != 'confirmed':
        raise HTTPException(400, "Booking not confirmed")
    
    # Calculate fees
    total_amount = int(booking.service['price'] * 100)  # Convert to pence
    platform_fee = int(total_amount * 0.20)  # 20% platform fee
    
    # Create payment intent
    intent = stripe_service.create_payment_intent({
        'amount_pence': total_amount,
        'platform_fee_pence': platform_fee,
        'cleaner_stripe_id': booking.cleaner.stripe_account_id,
        'booking_id': booking_id,
        'client_id': current_user.uid,
    })
    
    # Save payment intent to booking
    await booking_repository.update_payment(booking_id, {
        'stripe_payment_intent_id': intent.id,
        'payment_status': 'pending',
        'amount_pence': total_amount,
        'platform_fee_pence': platform_fee,
    })
    
    return {
        'client_secret': intent.client_secret,
        'amount': total_amount / 100,
        'currency': 'GBP'
    }
```

### 3.2 Frontend Payment Component
```typescript
// caas-frontend/components/PaymentForm.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ booking, clientSecret }) {
    const stripe = useStripe();
    const elements = useElements();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: booking.client_name,
                    email: booking.client_email,
                },
            },
        });
        
        if (result.error) {
            console.error(result.error);
        } else {
            // Payment succeeded
            await api.post(`/api/v1/bookings/${booking.id}/confirm-payment`);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
                Pay £{booking.price}
            </button>
        </form>
    );
}
```

## Phase 4: Webhook Processing (Week 2)

### 4.1 Webhook Handler
```python
# caas-backend/app/api/v1/webhooks.py
@router.post("/webhooks/stripe")
async def handle_stripe_webhook(
    request: Request,
    stripe_service: StripeService = Depends()
):
    """Process Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(400, "Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    
    # Handle events
    if event['type'] == 'payment_intent.succeeded':
        await handle_payment_success(event['data']['object'])
    elif event['type'] == 'payment_intent.payment_failed':
        await handle_payment_failure(event['data']['object'])
    elif event['type'] == 'account.updated':
        await handle_account_update(event['data']['object'])
    elif event['type'] == 'transfer.created':
        await handle_transfer_created(event['data']['object'])
    
    return {'received': True}

async def handle_payment_success(payment_intent):
    """Update booking when payment succeeds"""
    booking_id = payment_intent['metadata']['booking_id']
    
    await booking_repository.update(booking_id, {
        'payment.status': 'succeeded',
        'payment.paid_at': datetime.utcnow(),
        'status': 'paid',
    })
    
    # Send confirmation emails
    await email_service.send_payment_confirmation(booking_id)
```

## Phase 5: Automated Payouts (Week 3)

### 5.1 Payout Configuration
```python
# Stripe Connect handles payouts automatically!
# Default schedule: Daily payouts with 2-day delay
# Can customize per cleaner:

def update_payout_schedule(cleaner_stripe_id, schedule='weekly'):
    """Customize cleaner payout schedule"""
    stripe.Account.modify(
        cleaner_stripe_id,
        settings={
            'payouts': {
                'schedule': {
                    'interval': schedule,  # 'daily', 'weekly', 'monthly'
                    'weekly_anchor': 'friday' if schedule == 'weekly' else None,
                }
            }
        }
    )
```

### 5.2 Payout Tracking
```python
# Add to cleaner dashboard
@router.get("/cleaners/earnings")
async def get_cleaner_earnings(
    current_user: User = Depends(get_current_user)
):
    """Get cleaner earnings and payout history"""
    if current_user.role != 'cleaner':
        raise HTTPException(403)
    
    # Get from Stripe
    balance = stripe.Balance.retrieve(
        stripe_account=current_user.profile['stripe_account_id']
    )
    
    payouts = stripe.Payout.list(
        stripe_account=current_user.profile['stripe_account_id'],
        limit=10
    )
    
    # Get booking history
    bookings = await booking_repository.get_cleaner_bookings(
        current_user.uid,
        status='completed'
    )
    
    return {
        'available_balance': balance.available[0].amount / 100,
        'pending_balance': balance.pending[0].amount / 100,
        'recent_payouts': [
            {
                'amount': p.amount / 100,
                'arrival_date': p.arrival_date,
                'status': p.status
            } for p in payouts.data
        ],
        'total_earnings': sum(b.cleaner_payout_pence for b in bookings) / 100
    }
```

## Phase 6: Refunds & Disputes (Week 3)

### 6.1 Refund Processing
```python
@router.post("/bookings/{booking_id}/refund")
async def process_refund(
    booking_id: str,
    refund_request: RefundRequest,
    current_user: User = Depends(get_current_admin)
):
    """Process full or partial refund"""
    booking = await booking_repository.get(booking_id)
    
    # Create refund
    refund = stripe.Refund.create(
        payment_intent=booking.payment['stripe_payment_intent_id'],
        amount=refund_request.amount_pence if refund_request.partial else None,
        reason=refund_request.reason,  # 'duplicate', 'fraudulent', 'requested_by_customer'
        metadata={'booking_id': booking_id}
    )
    
    # Reverse platform fee if full refund
    if not refund_request.partial:
        stripe.ApplicationFee.create_refund(
            booking.payment['application_fee_id']
        )
    
    # Update booking
    await booking_repository.update(booking_id, {
        'payment.status': 'refunded',
        'payment.refunded_at': datetime.utcnow(),
        'payment.refund_amount_pence': refund.amount,
        'status': 'refunded'
    })
    
    return {'refund_id': refund.id, 'amount': refund.amount / 100}
```

## Configuration & Environment Variables

### Backend (.env)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxx  # Use sk_test_ for testing
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Use pk_test_ for testing
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx  # For OAuth flow (optional)

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=20  # 20% platform fee
MINIMUM_BOOKING_AMOUNT=2000  # £20 minimum in pence
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Testing Strategy

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### Test Flow
1. Create test cleaner account
2. Complete Stripe onboarding in test mode
3. Create test booking
4. Process test payment
5. Verify webhook processing
6. Check test payout creation

## Monitoring & Reconciliation

### Daily Reconciliation
```python
# Run daily via Cloud Scheduler
async def daily_reconciliation():
    """Reconcile Stripe transactions with database"""
    # Get yesterday's transactions
    charges = stripe.Charge.list(
        created={'gte': yesterday_timestamp, 'lt': today_timestamp}
    )
    
    for charge in charges.data:
        booking_id = charge.metadata.get('booking_id')
        if booking_id:
            booking = await booking_repository.get(booking_id)
            if booking.payment['stripe_payment_intent_id'] != charge.payment_intent:
                # Log discrepancy
                logger.error(f"Payment mismatch for booking {booking_id}")
```

### Key Metrics Dashboard
```python
@router.get("/admin/payments/metrics")
async def get_payment_metrics():
    """Payment KPIs for admin dashboard"""
    return {
        'daily_volume': get_daily_transaction_volume(),
        'success_rate': calculate_payment_success_rate(),
        'average_transaction': get_average_transaction_value(),
        'platform_revenue': calculate_platform_revenue(),
        'pending_payouts': get_pending_payouts_total(),
        'dispute_rate': calculate_dispute_rate(),
    }
```

## Security Best Practices

1. **Never log full card numbers** - Use Stripe tokens only
2. **Webhook signature verification** - Always verify Stripe signatures
3. **Idempotency keys** - Prevent duplicate charges
4. **Rate limiting** - Limit payment attempts per user
5. **Fraud detection** - Use Stripe Radar (included free)
6. **PCI compliance** - Use Stripe Elements (never touch raw card data)

## Go-Live Checklist

- [ ] Stripe account approved and verified
- [ ] Live API keys configured
- [ ] Webhook endpoint registered in Stripe dashboard
- [ ] SSL certificate verified (required for production)
- [ ] Test complete payment flow in production
- [ ] Monitoring alerts configured
- [ ] Refund process documented for support team
- [ ] Terms of service updated with payment terms
- [ ] Privacy policy updated with Stripe data processing

## Support & Escalation

### Common Issues
1. **Payment declined**: Check Stripe dashboard for decline code
2. **Webhook failures**: Check webhook logs in Stripe dashboard
3. **Payout delays**: Verify cleaner's bank account details
4. **Refund failures**: Check if funds are available

### Stripe Support
- Dashboard: https://dashboard.stripe.com
- Documentation: https://stripe.com/docs
- Support: Available 24/7 via dashboard

## Cost Optimization Tips

1. **Encourage bank transfers** for regular clients (0.8% cap at £5)
2. **Batch refunds** to reduce operational overhead
3. **Use Stripe Billing** for subscription cleanings (better rates)
4. **Enable local payment methods** (BACS Direct Debit for UK)
5. **Pass foreign card fees** to international customers

## Total Implementation Time: 3 Weeks

**Week 1**: Core infrastructure + cleaner onboarding
**Week 2**: Payment flow + webhook processing  
**Week 3**: Refunds + monitoring + testing

## Expected Costs at Scale

### 100 bookings/month @ £50 average
- Revenue: £5,000
- Stripe fees: £75 (1.5%)
- Platform revenue (20%): £1,000
- Cleaner payouts: £3,925
- **Net platform profit: £925/month**

### 1,000 bookings/month @ £50 average  
- Revenue: £50,000
- Stripe fees: £750
- Platform revenue (20%): £10,000
- Cleaner payouts: £39,250
- **Net platform profit: £9,250/month**

This scales linearly with ZERO additional operational overhead!