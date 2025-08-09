'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { bookingsApi } from '@/lib/api-client'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ClockIcon, CurrencyPoundIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    if (user?.role === 'client') {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getBookings()
      // Filter out cancelled bookings - they have their own page
      const activeBookings = data.filter(booking => booking.status !== 'cancelled')
      setBookings(activeBookings)
    } catch (err: any) {
      setError('Failed to load bookings')
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await bookingsApi.cancelBooking(bookingId)
      loadBookings() // Reload bookings
    } catch (err: any) {
      alert('Failed to cancel booking: ' + (err.response?.data?.detail || err.message))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100/60 text-yellow-800 border border-yellow-200/50'
      case 'confirmed':
        return 'bg-blue-100/60 text-blue-800 border border-blue-200/50'
      case 'in_progress':
        return 'bg-purple-100/60 text-purple-800 border border-purple-200/50'
      case 'completed':
        return 'bg-green-100/60 text-green-800 border border-green-200/50'
      case 'cancelled':
      case 'cancelled_by_client':
      case 'cancelled_by_cleaner':
        return 'bg-red-100/60 text-red-800 border border-red-200/50'
      default:
        return 'bg-gray-100/60 text-gray-800 border border-gray-200/50'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (!user || user.role !== 'client') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You must be logged in as a client to view bookings.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with glass effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-8 border border-white/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-primary-600" />
                My Bookings
              </h1>
              <p className="text-secondary-600 mt-2 text-lg">
                Manage your active <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> cleaning service bookings
              </p>
            </div>
            <div className="flex space-x-3">
              <Link 
                href="/bookings/cancelled" 
                className="px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
              >
                View Cancelled
              </Link>
              <Link href="/bookings/new" className="btn-primary">
                Book New Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl"></div>
          <div className="relative bg-green-50/60 backdrop-blur-sm border border-green-200/50 text-green-700 px-6 py-4 rounded-xl">
            Booking created successfully! You'll receive a confirmation email shortly.
          </div>
        </div>
      )}

      {error && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl"></div>
          <div className="relative bg-red-50/60 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-12">
            <div className="text-center">
              <CalendarIcon className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-secondary-900 mb-2">No bookings yet</h3>
              <p className="text-secondary-600 mb-6 text-base">
                You haven't made any bookings yet. Book your first cleaning service!
              </p>
              <Link href="/bookings/new" className="btn-primary">
                Book Your First Service
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="relative">
              {/* Glass card effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 capitalize">
                      {booking.service?.type?.replace(/_/g, ' ')} Cleaning
                    </h3>
                    <p className="text-base text-secondary-500 mt-1">
                      Booking ID: {booking.booking_id}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-3 bg-primary-500/10 backdrop-blur-sm rounded-xl p-3 border border-primary-400/20">
                    <CalendarIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Date & Time</p>
                      <p className="font-semibold text-secondary-900">
                        {booking.schedule?.date || booking.date || 'Not set'}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {booking.schedule?.time || booking.time || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-accent-500/10 backdrop-blur-sm rounded-xl p-3 border border-accent-400/20">
                    <ClockIcon className="h-6 w-6 text-accent-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Duration</p>
                      <p className="font-semibold text-secondary-900">
                        {booking.service?.duration || booking.duration || 'N/A'} hour{(booking.service?.duration || booking.duration) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-green-500/10 backdrop-blur-sm rounded-xl p-3 border border-green-400/20">
                    <CurrencyPoundIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Price</p>
                      <p className="font-bold text-lg text-green-600">
                        £{booking.service?.price || booking.payment?.amount || booking.total_price || '0'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-secondary-500/10 backdrop-blur-sm rounded-xl p-3 border border-secondary-400/20">
                    <MapPinIcon className="h-6 w-6 text-secondary-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Location</p>
                      <p className="font-semibold text-secondary-900 text-sm leading-tight">
                        {booking.location?.address?.line1 || booking.address?.line1 || 'Not provided'}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {booking.location?.address?.city || booking.address?.city || ''} {booking.location?.address?.postcode || booking.address?.postcode || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.cleaner_id && (
                  <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/50 rounded-xl p-3 mb-4">
                    <p className="text-base text-blue-800">
                      <span className="font-medium">Cleaner Assigned:</span> Your cleaning service has been confirmed!
                    </p>
                  </div>
                )}

                {booking.service?.special_requirements && booking.service.special_requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-base font-medium text-secondary-900 mb-2">Special Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.service.special_requirements.map((req: string, index: number) => (
                        <span key={index} className="inline-flex px-3 py-1 text-sm bg-white/10 backdrop-blur-sm text-secondary-800 rounded-full border border-white/20">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-base font-medium text-secondary-900 mb-1">Notes:</p>
                    <p className="text-base text-secondary-600">{booking.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <div className="text-base text-secondary-500">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="text-base text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'completed' && !booking.rating && (
                      <Link
                        href={`/bookings/${booking.booking_id}/rate`}
                        className="text-base text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Rate & Review
                      </Link>
                    )}
                    <Link
                      href={`/bookings/${booking.booking_id}`}
                      className="text-base text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}