"""
Payment API endpoints for Stripe integration
Production-ready implementation with proper error handling
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import logging
import stripe
import os

from app.config import settings
from app.core.security import get_current_user_id, get_current_user_role

logger = logging.getLogger(__name__)
router = APIRouter(tags=["payments"])

# Lazy initialization of Stripe API
def ensure_stripe_initialized():
    """Ensure Stripe is initialized with API key from secure storage"""
    if not stripe.api_key:
        try:
            from app.core.secure_secrets import get_stripe_secret
            stripe_key = get_stripe_secret()
            
            if stripe_key:
                stripe.api_key = stripe_key
                logger.info("Stripe API initialized successfully from secure storage")
            else:
                logger.error("CRITICAL: Stripe API key not configured - payments will not work")
                raise HTTPException(500, "Payment service not configured")
        except Exception as e:
            logger.error(f"Failed to initialize Stripe: {e}")
            raise HTTPException(500, "Payment service unavailable")

# Request/Response Models
class CreatePaymentIntentRequest(BaseModel):
    booking_id: str
    save_payment_method: bool = False

class PaymentIntentResponse(BaseModel):
    payment_intent_id: str
    client_secret: str
    amount: float
    currency: str = "GBP"
    booking_id: str
    status: str

class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    booking_id: str

@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    user_id: str = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role)
):
    """Create a payment intent for a booking"""
    if role != 'client':
        raise HTTPException(403, "Only clients can create payments")
    
    # Ensure Stripe is initialized
    ensure_stripe_initialized()
    
    try:
        # Get booking details from Firestore directly
        from app.core.database import get_firestore_client, FirestoreCollections
        db = get_firestore_client()
        
        booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(request.booking_id)
        booking_doc = booking_ref.get()
        
        if not booking_doc.exists:
            raise HTTPException(404, "Booking not found")
        
        booking = booking_doc.to_dict()
        
        # Verify ownership
        if booking.get('client_id') != user_id:
            raise HTTPException(403, "Not authorized for this booking")
        
        # Check booking status - allow payment for pending (new) and confirmed bookings
        if booking.get('status') not in ['confirmed', 'pending']:
            raise HTTPException(400, f"Cannot pay for booking with status: {booking.get('status')}")
        
        # Check if already paid
        if booking.get('payment', {}).get('status') == 'succeeded':
            raise HTTPException(400, "Booking already paid")
        
        # Calculate amount
        amount = booking.get('service', {}).get('price', 50.00)
        amount_pence = int(amount * 100)
        
        # Create payment intent with automatic payment methods for Payment Element
        # This will use all payment methods enabled in your Stripe Dashboard
        intent = stripe.PaymentIntent.create(
            amount=amount_pence,
            currency='gbp',
            automatic_payment_methods={
                'enabled': True,
                'allow_redirects': 'always'  # Allow redirect-based payment methods
            },
            metadata={
                'booking_id': request.booking_id,
                'client_id': user_id,
                'service_type': booking.get('service', {}).get('type', 'regular')
            },
            description=f"Cleaning service - Booking {request.booking_id[:8]}"
        )
        
        # Update booking with payment info
        booking_ref.update({
            'payment.payment_intent_id': intent.id,
            'payment.amount': amount,
            'payment.status': 'pending',
            'payment.created_at': datetime.utcnow()
        })
        
        return PaymentIntentResponse(
            payment_intent_id=intent.id,
            client_secret=intent.client_secret,
            amount=amount,
            currency="GBP",
            booking_id=request.booking_id,
            status=intent.status
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(500, f"Payment service error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating payment: {e}")
        raise HTTPException(500, "Failed to create payment")

@router.post("/confirm-payment")
async def confirm_payment(
    request: ConfirmPaymentRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Confirm payment completion"""
    # Ensure Stripe is initialized
    ensure_stripe_initialized()
    
    try:
        # Verify payment intent status
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        # Get Firestore client
        from app.core.database import get_firestore_client, FirestoreCollections
        db = get_firestore_client()
        booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(request.booking_id)
        
        # Update booking based on payment status
        update_data = {
            'payment.status': intent.status,
            'payment.last_updated': datetime.utcnow()
        }
        
        if intent.status == 'succeeded':
            update_data['payment.paid_at'] = datetime.utcnow()
            update_data['status'] = 'paid'
            
            # Get receipt URL if available
            if intent.charges and intent.charges.data:
                charge = intent.charges.data[0]
                update_data['payment.receipt_url'] = charge.receipt_url
        
        booking_ref.update(update_data)
        
        return {
            'success': intent.status == 'succeeded',
            'status': intent.status,
            'payment_intent_id': intent.id,
            'receipt_url': update_data.get('payment.receipt_url')
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(500, f"Payment confirmation error: {str(e)}")
    except Exception as e:
        logger.error(f"Error confirming payment: {e}")
        raise HTTPException(500, "Failed to confirm payment")

# Cleaner onboarding endpoints
@router.post("/cleaners/onboard")
async def create_cleaner_onboarding(
    user_id: str = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role)
):
    """Create Stripe Connect onboarding for cleaners"""
    if role != 'cleaner':
        raise HTTPException(403, "Only cleaners can access onboarding")
    
    # Ensure Stripe is initialized
    ensure_stripe_initialized()
    
    try:
        # Get user from Firestore directly
        from app.core.database import get_firestore_client
        db = get_firestore_client()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(404, "User not found")
        
        user = user_doc.to_dict()
        stripe_account_id = user.get('profile', {}).get('stripe_account_id')
        
        # Create account if doesn't exist
        if not stripe_account_id:
            account = stripe.Account.create(
                type='express',
                country='GB',
                email=user['email'],
                capabilities={
                    'card_payments': {'requested': True},
                    'transfers': {'requested': True},
                },
                metadata={'user_id': user_id}
            )
            stripe_account_id = account.id
            
            # Save account ID
            user_ref.update({
                'profile.stripe_account_id': stripe_account_id
            })
        
        # Generate onboarding link
        account_link = stripe.AccountLink.create(
            account=stripe_account_id,
            refresh_url=f"{settings.frontend_url}/cleaner/onboarding",
            return_url=f"{settings.frontend_url}/cleaner/onboarding/complete",
            type='account_onboarding',
        )
        
        return {
            'onboarding_url': account_link.url,
            'stripe_account_id': stripe_account_id,
            'message': 'Redirect to complete Stripe onboarding'
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(500, f"Onboarding error: {str(e)}")
    except Exception as e:
        logger.error(f"Onboarding error: {e}")
        raise HTTPException(500, "Failed to create onboarding")

@router.get("/cleaners/earnings")
async def get_cleaner_earnings(
    user_id: str = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role)
):
    """Get cleaner earnings"""
    if role != 'cleaner':
        raise HTTPException(403, "Only cleaners can view earnings")
    
    # Ensure Stripe is initialized
    ensure_stripe_initialized()
    
    try:
        # Get user from Firestore directly
        from app.core.database import get_firestore_client
        db = get_firestore_client()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {
                'available_balance': 0,
                'pending_balance': 0,
                'message': 'User not found'
            }
        
        user = user_doc.to_dict()
        stripe_account_id = user.get('profile', {}).get('stripe_account_id')
        
        if not stripe_account_id:
            return {
                'available_balance': 0,
                'pending_balance': 0,
                'message': 'No payment account connected'
            }
        
        # Get balance from Stripe
        balance = stripe.Balance.retrieve(stripe_account=stripe_account_id)
        
        return {
            'available_balance': balance.available[0].amount / 100 if balance.available else 0,
            'pending_balance': balance.pending[0].amount / 100 if balance.pending else 0,
            'currency': 'GBP'
        }
        
    except Exception as e:
        logger.error(f"Earnings error: {e}")
        return {
            'available_balance': 0,
            'pending_balance': 0,
            'error': str(e)
        }