'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { bookingsApi } from '@/lib/api-client'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ClockIcon, CurrencyPoundIcon } from '@heroicons/react/24/outline'

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
      setBookings(data)
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
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'cancelled_by_client':
      case 'cancelled_by_cleaner':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage your cleaning service bookings
          </p>
        </div>
        <Link href="/bookings/new" className="btn-primary">
          Book New Service
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          Booking created successfully! You'll receive a confirmation email shortly.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't made any bookings yet. Book your first cleaning service!
          </p>
          <Link href="/bookings/new" className="btn-primary">
            Book Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.booking_id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {booking.service?.type?.replace(/_/g, ' ')} Cleaning
                  </h3>
                  <p className="text-sm text-gray-500">
                    Booking ID: {booking.booking_id}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {formatStatus(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {booking.schedule?.date} at {booking.schedule?.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">
                      {booking.service?.duration} hour{booking.service?.duration > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CurrencyPoundIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Price</p>
                    <p className="text-sm text-gray-600">
                      £{booking.service?.price || booking.payment?.amount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      {booking.location?.address?.line1}, {booking.location?.address?.city}
                    </p>
                  </div>
                </div>
              </div>

              {booking.cleaner_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Cleaner Assigned:</span> Your cleaning service has been confirmed!
                  </p>
                </div>
              )}

              {booking.service?.special_requirements && booking.service.special_requirements.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Special Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.service.special_requirements.map((req: string, index: number) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {booking.notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Booked on {new Date(booking.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.booking_id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.rating && (
                    <Link
                      href={`/bookings/${booking.booking_id}/rate`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Rate & Review
                    </Link>
                  )}
                  <Link
                    href={`/bookings/${booking.booking_id}`}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}