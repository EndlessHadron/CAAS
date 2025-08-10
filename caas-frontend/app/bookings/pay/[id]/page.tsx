'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PaymentCard from '@/components/payment/PaymentCard';
import { CalendarIcon, ClockIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { bookingsApi } from '@/lib/api-client';
import Cookies from 'js-cookie';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = Cookies.get('auth_token');  // Changed from 'access_token' to 'auth_token'
        if (!token) {
          // Redirect to login with return URL
          router.push(`/auth/login?from=/bookings/pay/${bookingId}`);
          return;
        }

        // Use the API client which handles auth automatically
        const response = await bookingsApi.getBooking(bookingId);
        setBooking(response);
      } catch (err) {
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const handlePaymentSuccess = () => {
    router.push(`/bookings/payment-complete?booking_id=${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900">Booking not found</h2>
        </div>
      </div>
    );
  }

  const amount = booking.service?.price || 50.00;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-8 border border-white/30">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 mr-3 text-primary-600" />
              <h1 className="text-3xl font-bold text-secondary-900">
                Complete Your Payment
              </h1>
            </div>
            <p className="text-secondary-600 mt-2 text-lg">
              Secure payment powered by <span className="font-semibold">Stripe</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">Booking Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Date</p>
                      <p className="font-semibold text-secondary-900">
                        {new Date(booking.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Time & Duration</p>
                      <p className="font-semibold text-secondary-900">
                        {booking.time} • {booking.service?.duration || 2} hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Location</p>
                      <p className="font-semibold text-secondary-900">
                        {booking.location?.address?.line1 || 'Address on file'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-medium text-secondary-900">Total Amount</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        £{amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">Service Type</h3>
                <p className="text-lg font-medium text-secondary-800 capitalize">
                  {booking.service?.type?.replace(/_/g, ' ')} Cleaning
                </p>
                {booking.service?.special_requirements && booking.service.special_requirements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-secondary-600 mb-2">Special Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.service.special_requirements.map((req: string, index: number) => (
                        <span key={index} className="inline-flex px-3 py-1 text-sm bg-white/10 backdrop-blur-sm text-secondary-800 rounded-full border border-white/20">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-6">Payment Method</h3>
                <PaymentCard
                  bookingId={bookingId}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            </div>

            <div className="text-center text-sm text-secondary-500">
              <p>Your payment information is securely processed by Stripe.</p>
              <p className="mt-1">We never store your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}