'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { bookingsApi } from '@/lib/api-client'
import Link from 'next/link'
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyPoundIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import PayButton from '@/components/payment/PayButton'

export default function BookingDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'client' && bookingId) {
      loadBooking()
    }
  }, [user, bookingId])

  const loadBooking = async () => {
    try {
      const data = await bookingsApi.getBooking(bookingId)
      setBooking(data)
    } catch (err: any) {
      setError('Failed to load booking details')
      console.error('Failed to load booking:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await bookingsApi.cancelBooking(bookingId)
      loadBooking() // Reload booking
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

  const getActualBookingStatus = (booking: any) => {
    // If explicitly cancelled, return cancelled status
    if (booking.status?.includes('cancelled')) {
      return booking.status
    }
    
    // If explicitly completed
    if (booking.status === 'completed') {
      return 'completed'
    }

    const now = new Date()
    const bookingDate = booking.schedule?.date || booking.date
    const bookingTime = booking.schedule?.time || booking.time
    
    if (bookingDate && bookingTime) {
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`)
      const endTime = new Date(bookingDateTime.getTime() + (booking.service?.duration || booking.duration || 2) * 60 * 60 * 1000)
      
      // If current time is within the booking window
      if (now >= bookingDateTime && now <= endTime) {
        return 'in_progress'
      }
      
      // If current time is after the booking end time
      if (now > endTime) {
        return booking.status === 'completed' ? 'completed' : 'completed'
      }
    }

    // If cleaner is assigned and we haven't reached the booking time yet
    if (booking.cleaner_id) {
      return 'confirmed'
    }
    
    // Default to pending if no cleaner assigned
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <SparklesIcon className="h-5 w-5 text-purple-600" />
      default:
        return null
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return 'Not scheduled'
    
    try {
      const date = new Date(dateStr)
      const dateFormatted = date.toLocaleDateString('en-GB', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      return `${dateFormatted} at ${timeStr || 'Time TBD'}`
    } catch {
      return `${dateStr} at ${timeStr || 'Time TBD'}`
    }
  }

  if (!user || user.role !== 'client') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You must be logged in as a client to view booking details.</p>
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

  if (error || !booking) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
        <p className="text-gray-600">{error || 'This booking could not be found.'}</p>
        <Link href="/bookings" className="btn-primary inline-block">
          Back to Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/bookings" 
              className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Bookings
            </Link>
            <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(getActualBookingStatus(booking))}`}>
              {getStatusIcon(getActualBookingStatus(booking))}
              <span className="ml-1">{formatStatus(getActualBookingStatus(booking))}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 capitalize">
                {booking.service?.type?.replace(/_/g, ' ') || 'Cleaning'} Service
              </h1>
              <p className="text-secondary-600 mt-1">
                Booking ID: <span className="font-mono text-sm">{booking.booking_id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Details */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-3 text-primary-600" />
              Service Details
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-primary-500/10 backdrop-blur-sm rounded-xl p-4 border border-primary-400/20">
                <CalendarIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide mb-1">Schedule</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {formatDateTime(booking.schedule?.date || booking.date, booking.schedule?.time || booking.time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-accent-500/10 backdrop-blur-sm rounded-xl p-4 border border-accent-400/20">
                  <ClockIcon className="h-6 w-6 text-accent-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Duration</p>
                    <p className="font-semibold text-secondary-900">
                      {booking.service?.duration || booking.duration || 'N/A'} hour{(booking.service?.duration || booking.duration) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-400/20">
                  <CurrencyPoundIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Total</p>
                    <p className="font-bold text-lg text-green-600">
                      £{booking.service?.price || booking.payment?.amount || booking.total_price || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-secondary-500/10 backdrop-blur-sm rounded-xl p-4 border border-secondary-400/20">
                <MapPinIcon className="h-6 w-6 text-secondary-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-base font-semibold text-secondary-900">
                    {booking.location?.address?.line1 || booking.address?.line1 || 'Not provided'}
                  </p>
                  {(booking.location?.address?.line2 || booking.address?.line2) && (
                    <p className="text-sm text-secondary-600">
                      {booking.location?.address?.line2 || booking.address?.line2}
                    </p>
                  )}
                  <p className="text-sm text-secondary-600">
                    {booking.location?.address?.city || booking.address?.city || ''} {booking.location?.address?.postcode || booking.address?.postcode || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          {/* Cleaner Information */}
          {booking.cleaner_id ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <UserIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Assigned Cleaner
                </h3>
                <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-soft">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-semibold text-blue-900 text-lg">
                          {booking.cleaner?.name || booking.cleaner?.first_name || 'Professional Cleaner'}
                          {booking.cleaner?.last_name && ` ${booking.cleaner.last_name}`}
                        </p>
                        {booking.cleaner?.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-amber-400 fill-current" />
                            <span className="text-sm font-medium text-blue-800">{booking.cleaner.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      {booking.cleaner?.experience_years && (
                        <p className="text-sm text-blue-700 mb-2">
                          {booking.cleaner.experience_years} years of cleaning experience
                        </p>
                      )}
                      
                      {booking.cleaner?.bio && (
                        <p className="text-sm text-blue-700 mb-3">{booking.cleaner.bio}</p>
                      )}
                      
                      {booking.cleaner?.phone && (
                        <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{booking.cleaner.phone}</span>
                        </div>
                      )}
                      
                      {booking.cleaner?.email && (
                        <div className="flex items-center space-x-2 text-sm text-blue-800">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{booking.cleaner.email}</span>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-blue-900">
                          ✅ Your cleaning service has been confirmed!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {booking.cleaner?.specialties && booking.cleaner.specialties.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200/50">
                      <p className="text-sm font-medium text-blue-900 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.cleaner.specialties.map((specialty: string, idx: number) => (
                          <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-200/60 text-blue-800 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            getActualBookingStatus(booking) === 'pending' && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                    <UserIcon className="h-6 w-6 mr-3 text-amber-600" />
                    Cleaner Assignment
                  </h3>
                  <div className="bg-amber-50/60 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-6 w-6 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-900">Finding the perfect cleaner for you</p>
                        <p className="text-sm text-amber-700">We're matching you with the best available cleaner in your area</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Access Instructions */}
          {booking.instructions && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-orange-600" />
                  Access Instructions
                </h3>
                <div className="bg-orange-50/60 backdrop-blur-sm border border-orange-200/50 rounded-xl p-4">
                  <p className="text-orange-900">{booking.instructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Special Requirements */}
          {booking.service?.special_requirements && booking.service.special_requirements.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-purple-600" />
                  Special Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.service.special_requirements.map((req: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 bg-purple-100/60 backdrop-blur-sm rounded-xl p-3 border border-purple-200/50">
                      <CheckCircleIcon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-purple-800">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Extras */}
          {booking.service?.extras && booking.service.extras.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <SparklesIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  Additional Services
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.service.extras.map((extra: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-indigo-100/60 backdrop-blur-sm rounded-xl p-3 border border-indigo-200/50">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-indigo-800">
                          {typeof extra === 'string' ? extra : extra.name || extra.service}
                        </span>
                      </div>
                      {typeof extra === 'object' && extra.price && (
                        <span className="text-sm font-bold text-indigo-700">+£{extra.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3 text-amber-600" />
                  Additional Notes
                </h3>
                <div className="bg-amber-50/60 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
                  <p className="text-amber-900">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}


          {/* Booking Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">Booking Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Booking ID:</span>
                      <span className="text-secondary-900 font-mono text-xs">{booking.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Booked on:</span>
                      <span className="text-secondary-900 font-medium">
                        {new Date(booking.created_at).toLocaleDateString('en-GB', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    {booking.updated_at && booking.updated_at !== booking.created_at && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Last updated:</span>
                        <span className="text-secondary-900 font-medium">
                          {new Date(booking.updated_at).toLocaleDateString('en-GB', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                    {booking.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Completed on:</span>
                        <span className="text-secondary-900 font-medium">
                          {new Date(booking.completed_at).toLocaleDateString('en-GB', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Payment status:</span>
                      <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                        booking.payment?.status === 'paid' || booking.payment?.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : booking.payment?.status === 'pending' || booking.payment?.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.payment?.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : booking.payment?.status === 'refunded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.payment?.status || 'Not paid'}
                      </span>
                    </div>
                    {booking.payment?.method && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Payment method:</span>
                        <span className="text-secondary-900 font-medium capitalize">
                          {booking.payment.method.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {booking.payment?.amount && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Amount paid:</span>
                        <span className="text-secondary-900 font-bold">£{booking.payment.amount}</span>
                      </div>
                    )}
                    {booking.rating && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Your rating:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-secondary-900 font-medium">{booking.rating}</span>
                          <StarIcon className="h-4 w-4 text-amber-400 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.review && (
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm font-medium text-secondary-700 mb-2">Your Review:</p>
                    <p className="text-sm text-secondary-600 bg-white/[0.04] rounded-lg p-3 border border-white/10">
                      "{booking.review}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h3 className="text-xl font-semibold text-secondary-900">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {(getActualBookingStatus(booking) === 'pending' || getActualBookingStatus(booking) === 'confirmed') && (
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-100/60 hover:bg-red-200/60 text-red-800 font-medium rounded-lg transition-all duration-200 border border-red-200/50"
                >
                  Cancel Booking
                </button>
              )}
              <PayButton 
                bookingId={booking.booking_id}
                status={getActualBookingStatus(booking)}
                payment={booking.payment}
              />
              {getActualBookingStatus(booking) === 'completed' && !booking.rating && (
                <Link
                  href={`/bookings/${booking.booking_id}/rate`}
                  className="px-4 py-2 bg-primary-100/60 hover:bg-primary-200/60 text-primary-800 font-medium rounded-lg transition-all duration-200 border border-primary-200/50 flex items-center"
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Rate & Review
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}