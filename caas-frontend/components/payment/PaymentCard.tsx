'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise, stripeAppearance } from '@/lib/stripe-config';
import { CurrencyPoundIcon } from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api-client';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Wait for elements to be ready
  React.useEffect(() => {
    if (elements) {
      // Check if elements are ready
      const checkReady = async () => {
        const paymentElement = elements.getElement('payment');
        if (paymentElement) {
          setIsReady(true);
        }
      };
      
      // Give elements time to mount
      setTimeout(checkReady, 100);
    }
  }, [elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      console.error('Payment not ready:', { stripe: !!stripe, elements: !!elements, isReady });
      setErrorMessage('Payment system is not ready. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/payment-complete?booking_id=${bookingId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <PaymentElement 
            options={{ 
              layout: 'accordion',
              defaultValues: {
                billingDetails: {
                  address: {
                    country: 'GB',
                  }
                }
              },
              business: {
                name: 'theneatlyapp'
              },
              wallets: {
                applePay: 'auto',
                googlePay: 'auto'
              },
              terms: {
                card: 'auto'
              },
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                  address: 'auto'
                }
              }
            }} 
          />
        </div>
      </div>

      {errorMessage && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl"></div>
          <div className="relative bg-red-50/60 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl">
            {errorMessage}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isReady}
        className="w-full relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
        <div className="relative flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              <CurrencyPoundIcon className="h-5 w-5 mr-2" />
              Pay £{amount.toFixed(2)}
            </>
          )}
        </div>
      </button>
    </form>
  );
}

export default function PaymentCard({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const createIntent = async () => {
      try {
        // paymentApi.createPaymentIntent already returns the data
        const data = await paymentApi.createPaymentIntent(bookingId);
        
        if (data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          console.error('No client secret in response:', data);
          onError?.('Failed to initialize payment');
        }
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        
        // Check if it's an auth error
        if (err.response?.status === 401) {
          onError?.('Please login to continue');
        } else {
          onError?.(err.response?.data?.detail || 'Failed to initialize payment');
        }
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [bookingId, onError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl"></div>
        <div className="relative bg-yellow-50/60 backdrop-blur-sm border border-yellow-200/50 text-yellow-700 px-6 py-4 rounded-xl">
          Unable to initialize payment. Please try again.
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: stripeAppearance,
        loader: 'auto',
      }}
    >
      <CheckoutForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}