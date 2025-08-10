"""
Webhook endpoints for external integrations
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import logging
import stripe
import os
import json
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(tags=["webhooks"])

# Use centralized secure secrets service for webhook secret
def get_stripe_webhook_secret() -> Optional[str]:
    """Get Stripe webhook secret from secure storage"""
    from app.core.secure_secrets import get_stripe_webhook_secret as get_secure_webhook_secret
    return get_secure_webhook_secret()

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None)
):
    """Handle Stripe webhook events"""
    try:
        # Get raw body
        payload = await request.body()
        
        # Verify webhook signature if secret is configured
        webhook_secret = get_stripe_webhook_secret()
        if webhook_secret and stripe_signature:
            try:
                event = stripe.Webhook.construct_event(
                    payload, stripe_signature, webhook_secret
                )
            except ValueError:
                logger.error("Invalid webhook payload")
                raise HTTPException(400, "Invalid payload")
            except stripe.error.SignatureVerificationError:
                logger.error("Invalid webhook signature")
                raise HTTPException(400, "Invalid signature")
        else:
            # Parse without verification (development mode)
            event = json.loads(payload)
            logger.warning("Webhook signature not verified (no secret configured)")
        
        # Handle the event
        event_type = event.get('type')
        logger.info(f"Received Stripe webhook: {event_type}")
        
        # Get Firestore client for updates
        from app.core.database import get_firestore_client, FirestoreCollections
        db = get_firestore_client()
        
        if event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            booking_id = payment_intent.get('metadata', {}).get('booking_id')
            
            if booking_id:
                # Update booking status
                booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(booking_id)
                booking_ref.update({
                    'payment.status': 'succeeded',
                    'payment.paid_at': datetime.utcnow(),
                    'status': 'paid'
                })
                logger.info(f"Updated booking {booking_id} as paid")
        
        elif event_type == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            booking_id = payment_intent.get('metadata', {}).get('booking_id')
            
            if booking_id:
                # Update payment status
                booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(booking_id)
                booking_ref.update({
                    'payment.status': 'failed',
                    'payment.last_error': payment_intent.get('last_payment_error', {}).get('message')
                })
                logger.info(f"Updated booking {booking_id} payment as failed")
        
        elif event_type == 'charge.refunded':
            charge = event['data']['object']
            payment_intent_id = charge.get('payment_intent')
            
            # Find booking by payment intent
            bookings = db.collection(FirestoreCollections.BOOKINGS).where(
                'payment.payment_intent_id', '==', payment_intent_id
            ).stream()
            
            for booking_doc in bookings:
                booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(booking_doc.id)
                booking_ref.update({
                    'payment.status': 'refunded',
                    'payment.refunded_at': datetime.utcnow(),
                    'status': 'cancelled'
                })
                logger.info(f"Updated booking {booking_doc.id} as refunded")
        
        elif event_type == 'account.updated':
            # Handle cleaner account updates
            account = event['data']['object']
            cleaner_id = account.get('metadata', {}).get('user_id')
            
            if cleaner_id:
                user_ref = db.collection(FirestoreCollections.USERS).document(cleaner_id)
                user_ref.update({
                    'profile.stripe_account_status': account.get('charges_enabled')
                })
                logger.info(f"Updated cleaner {cleaner_id} Stripe account status")
        
        return {"status": "success", "event": event_type}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        # Return success to prevent Stripe from retrying
        return {"status": "error", "message": str(e)}