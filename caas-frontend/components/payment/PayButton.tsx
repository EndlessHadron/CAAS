'use client';

import Link from 'next/link';
import { CurrencyPoundIcon } from '@heroicons/react/24/outline';

interface PayButtonProps {
  bookingId: string;
  status: string;
  payment?: {
    status?: string;
  };
}

export default function PayButton({ bookingId, status, payment }: PayButtonProps) {
  // Show pay button for pending or confirmed bookings that haven't been paid
  if ((status !== 'pending' && status !== 'confirmed') || payment?.status === 'succeeded') {
    return null;
  }

  return (
    <Link 
      href={`/bookings/pay/${bookingId}`}
      className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
    >
      <CurrencyPoundIcon className="h-4 w-4 mr-2" />
      Pay Now
    </Link>
  );
}