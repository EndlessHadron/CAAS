'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api-client';
import Cookies from 'js-cookie';
import Link from 'next/link';

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');
  const paymentIntent = searchParams.get('payment_intent');
  const [verifying, setVerifying] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId || !paymentIntent) {
        setVerifying(false);
        return;
      }

      try {
        const token = Cookies.get('auth_token');  // Changed from 'access_token' to 'auth_token'
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Confirm payment with backend using API client (already returns data)
        const data = await paymentApi.confirmPayment(paymentIntent, bookingId);
        setPaymentSuccess(data.success);
      } catch (err) {
        console.error('Error verifying payment:', err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [bookingId, paymentIntent, router]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-50"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] border border-white/30 p-8">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>

              {/* Title */}
              <h1 className="mt-6 text-3xl font-bold text-secondary-900">
                Payment Successful!
              </h1>

              {/* Description */}
              <p className="mt-3 text-lg text-secondary-600">
                Your payment has been processed successfully.
              </p>

              {/* Booking Reference */}
              {bookingId && (
                <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <p className="text-sm text-secondary-500">Booking Reference</p>
                  <p className="text-lg font-semibold text-secondary-900 font-mono">
                    #{bookingId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Confirmation Message */}
              <div className="mt-6 flex items-center justify-center text-secondary-600">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
                <p>A confirmation email has been sent to you</p>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
                <Link 
                  href="/bookings"
                  className="block w-full"
                >
                  <button className="w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
                    <div className="relative px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all">
                      View My Bookings
                    </div>
                  </button>
                </Link>

                <Link 
                  href="/client/dashboard"
                  className="block w-full"
                >
                  <button className="w-full px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-medium rounded-xl transition-all duration-200 border border-white/30 hover:border-white/40">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <PaymentCompleteContent />
    </Suspense>
  );
}