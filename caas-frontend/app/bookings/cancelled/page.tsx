'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { bookingsApi } from '@/lib/api-client'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, MapPinIcon, ArrowLeftIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function CancelledBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading) {
      loadCancelledBookings()
    }
  }, [user, authLoading])

  const loadCancelledBookings = async () => {
    try {
      const bookingsData = await bookingsApi.getBookings()
      // Filter only cancelled bookings
      const cancelled = bookingsData.filter(b => b.status === 'cancelled')
      setCancelledBookings(cancelled)
    } catch (error) {
      console.error('Failed to load cancelled bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">Please log in to access your bookings.</p>
        <Link href="/auth/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard" 
          className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors text-base font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header with glass effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-8 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
                <XCircleIcon className="h-8 w-8 mr-3 text-red-600" />
                Cancelled Bookings
              </h1>
              <p className="text-secondary-600 mt-2 text-lg">
                View your previously cancelled <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> cleaning service bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats with glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cancelled */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl">
                <CalendarIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-secondary-600">Total Cancelled</p>
                <p className="text-2xl font-bold text-secondary-900">{cancelledBookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gray-500/20 backdrop-blur-sm rounded-xl">
                <ClockIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-secondary-600">This Month</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {cancelledBookings.filter(b => {
                    const bookingDate = new Date(b.schedule?.date || b.date)
                    const now = new Date()
                    return bookingDate.getMonth() === now.getMonth() && 
                           bookingDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cancellations */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500/20 backdrop-blur-sm rounded-xl">
                <MapPinIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-secondary-600">Recent (7 days)</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {cancelledBookings.filter(b => {
                    const bookingDate = new Date(b.schedule?.date || b.date)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return bookingDate >= weekAgo
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Bookings List with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Cancelled Bookings History</h2>
          {cancelledBookings.length > 0 ? (
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <div
                  key={booking.booking_id || booking.id}
                  className="flex items-center justify-between p-6 bg-red-50/30 backdrop-blur-sm border border-red-200/50 rounded-xl hover:bg-red-50/40 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium text-secondary-900 mr-3 text-lg">
                        {booking.service?.type || booking.service_type || 'Cleaning Service'}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100/60 text-red-800 border border-red-200/50">
                        Cancelled
                      </span>
                    </div>
                    <div className="flex items-center text-base text-secondary-600 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{booking.schedule?.date || booking.date}</span>
                      <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                      <span>{booking.schedule?.time || booking.time}</span>
                    </div>
                    <div className="flex items-center text-base text-secondary-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>
                        {booking.location?.address?.line1 || booking.address?.line1}, {' '}
                        {booking.location?.address?.city || booking.address?.city}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-base text-secondary-600 mt-2 italic">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <p className="font-semibold text-secondary-600 line-through text-lg">
                      £{booking.service?.price || booking.total_price || booking.payment?.amount}
                    </p>
                    <p className="text-sm text-secondary-500 mt-1">
                      {booking.duration || booking.service?.duration} hours
                    </p>
                    {booking.cancelled_at && (
                      <p className="text-sm text-red-600 mt-1">
                        Cancelled: {new Date(booking.cancelled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-secondary-900 mb-2">No Cancelled Bookings</h3>
              <p className="text-secondary-500 mb-6 text-base">
                You haven't cancelled any bookings yet. That's great!
              </p>
              <Link href="/bookings/new" className="btn-primary">
                Book New Service
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard" 
              className="text-center px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
            >
              Back to Dashboard
            </Link>
            <Link href="/bookings/new" className="btn-primary text-center">
              Book New Service
            </Link>
            <Link 
              href="/profile" 
              className="text-center px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}