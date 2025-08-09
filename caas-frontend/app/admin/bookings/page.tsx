'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api-client'
import Cookies from 'js-cookie'
import { getAdminApiUrl } from '@/lib/config'
import { MobileResponsiveTable, MobileActionButton, MobileActionGroup } from '@/components/ui/MobileResponsiveTable'
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Booking {
  booking_id: string
  client_id: string
  cleaner_id?: string
  client_name?: string
  cleaner_name?: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  duration_hours: number
  total_price: number
  address: {
    street: string
    city: string
    postcode: string
  }
  created_at: string
  updated_at: string
  admin_notes?: string
}

interface BookingSearchResponse {
  bookings: Booking[]
  total_count: number
  limit: number
  offset: number
  has_more: boolean
}

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchId, setSearchId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [newCleanerId, setNewCleanerId] = useState('')
  const [reassignReason, setReassignReason] = useState('')
  const [showForceCompleteModal, setShowForceCompleteModal] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')

  const limit = 25

  useEffect(() => {
    fetchBookings()
  }, [currentPage, searchId, filterStatus])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit,
        offset: currentPage * limit
      }

      if (searchId) params.booking_id = searchId
      if (filterStatus) params.status = filterStatus

      console.log('Fetching bookings with params:', params)
      const data: BookingSearchResponse = await adminApi.getBookings(params)
      console.log('Bookings response:', data)
      setBookings(data.bookings || [])
      setTotalCount(data.total_count || 0)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, reason?: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL
      const apiUrl = getAdminApiUrl('bookings', bookingId, 'status')
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_status: status,
          reason: reason
        })
      })
      if (!response.ok) throw new Error('Failed to update booking status')
      fetchBookings()
      setShowBookingModal(false)
      setNewStatus('')
      setStatusReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status')
    }
  }

  const cancelBooking = async (bookingId: string, reason: string, refundAmount?: number) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL with query params
      const apiUrl = `${getAdminApiUrl('bookings', bookingId, 'cancel')}?reason=${encodeURIComponent(reason)}${refundAmount ? `&refund_amount=${refundAmount}` : ''}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to cancel booking')
      fetchBookings()
      setShowCancelModal(false)
      setCancelReason('')
      setRefundAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
    }
  }

  const reassignBooking = async (bookingId: string, newCleanerId: string, reason: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL with query params
      const apiUrl = `${getAdminApiUrl('bookings', bookingId, 'reassign')}?new_cleaner_id=${newCleanerId}&reason=${encodeURIComponent(reason)}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to reassign booking')
      fetchBookings()
      setShowReassignModal(false)
      setNewCleanerId('')
      setReassignReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reassign booking')
    }
  }

  const forceCompleteBooking = async (bookingId: string, notes: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL with query params
      const apiUrl = `${getAdminApiUrl('bookings', bookingId, 'force-complete')}?completion_notes=${encodeURIComponent(notes)}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to force complete booking')
      fetchBookings()
      setShowForceCompleteModal(false)
      setCompletionNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to force complete booking')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'in_progress':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'regular_cleaning':
        return 'bg-blue-100 text-blue-800'
      case 'deep_cleaning':
        return 'bg-purple-100 text-purple-800'
      case 'end_of_tenancy':
        return 'bg-green-100 text-green-800'
      case 'office_cleaning':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Booking Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all bookings, handle disputes and status changes.
        </p>
      </div>

      {/* Filters - Mobile-first responsive */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search-id" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Booking ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search-id"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter booking ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="filter-status"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  fetchBookings()
                }}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Bookings ({totalCount})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <MobileResponsiveTable
              data={bookings}
              columns={[
                {
                  key: 'booking_id',
                  label: 'Booking ID',
                  mobileLabel: 'ID',
                  render: (id) => `#${id.slice(-8)}`
                },
                {
                  key: 'client',
                  label: 'Client',
                  mobileLabel: 'Client',
                  render: (_, booking) => (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.client_name || booking.client_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.address.city}, {booking.address.postcode}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'service',
                  label: 'Service',
                  mobileLabel: 'Service',
                  render: (_, booking) => (
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceTypeColor(booking.service_type)}`}>
                        {formatServiceType(booking.service_type)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.duration_hours}h duration
                      </div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  mobileLabel: 'Status',
                  render: (status) => (
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'scheduled',
                  label: 'Date & Time',
                  mobileLabel: 'Date',
                  hideOnMobile: true,
                  render: (_, booking) => (
                    <div>
                      <div>{new Date(booking.scheduled_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{booking.scheduled_time}</div>
                    </div>
                  )
                },
                {
                  key: 'total_price',
                  label: 'Price',
                  mobileLabel: 'Price',
                  render: (price) => `£${price.toFixed(2)}`
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  mobileLabel: 'Actions',
                  className: 'text-right',
                  render: (_, booking) => (
                    <div className="flex space-x-2 md:justify-end">
                      {/* Desktop actions */}
                      <div className="hidden md:flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowBookingModal(true)
                          }}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowCancelModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Booking"
                          >
                            ❌
                          </button>
                        )}
                        {booking.cleaner_id && ['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowReassignModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Reassign Cleaner"
                          >
                            🔄
                          </button>
                        )}
                        {['confirmed', 'in_progress'].includes(booking.status) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowForceCompleteModal(true)
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Force Complete"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile actions with improved touch targets */}
                      <MobileActionGroup className="md:hidden">
                        <MobileActionButton
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowBookingModal(true)
                          }}
                          variant="secondary"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </MobileActionButton>
                        {['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
                          <MobileActionButton
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowCancelModal(true)
                            }}
                            variant="danger"
                            title="Cancel Booking"
                          >
                            ❌ Cancel
                          </MobileActionButton>
                        )}
                        {booking.cleaner_id && ['pending', 'confirmed'].includes(booking.status) && (
                          <MobileActionButton
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowReassignModal(true)
                            }}
                            variant="secondary"
                            title="Reassign Cleaner"
                          >
                            🔄 Reassign
                          </MobileActionButton>
                        )}
                        {['confirmed', 'in_progress'].includes(booking.status) && (
                          <MobileActionButton
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowForceCompleteModal(true)
                            }}
                            variant="primary"
                            title="Force Complete"
                          >
                            ✅ Complete
                          </MobileActionButton>
                        )}
                      </MobileActionGroup>
                    </div>
                  )
                }
              ]}
              emptyMessage="No bookings found matching your criteria."
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalCount)} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal - Mobile-optimized */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 sm:p-5 border w-full max-w-full sm:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white sm:top-20 sm:w-11/12">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Booking Details - #{selectedBooking.booking_id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Booking Info - Mobile-responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.client_name || selectedBooking.client_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cleaner</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.cleaner_name || selectedBooking.cleaner_id || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceTypeColor(selectedBooking.service_type)}`}>
                      {formatServiceType(selectedBooking.service_type)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedBooking.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Price */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedBooking.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.scheduled_time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.duration_hours} hours</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">£{selectedBooking.total_price.toFixed(2)}</p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.address.street}<br />
                    {selectedBooking.address.city} {selectedBooking.address.postcode}
                  </p>
                </div>

                {/* Admin Notes */}
                {selectedBooking.admin_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.admin_notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <label className="block font-medium">Created</label>
                    <p>{new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium">Last Updated</label>
                    <p>{new Date(selectedBooking.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Admin Action Buttons */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Admin Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    {/* Status Update */}
                    <div className="flex space-x-2 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">New Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="text-xs py-1 px-2 border border-gray-300 bg-white rounded"
                        >
                          <option value="">Select...</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                        <input
                          type="text"
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          className="text-xs py-1 px-2 border border-gray-300 rounded w-32"
                          placeholder="Optional..."
                        />
                      </div>
                      <button
                        onClick={() => updateBookingStatus(selectedBooking.booking_id, newStatus, statusReason)}
                        disabled={!newStatus}
                        className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {['pending', 'confirmed', 'in_progress'].includes(selectedBooking.status) && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                      >
                        ❌ Cancel Booking
                      </button>
                    )}
                    
                    {selectedBooking.cleaner_id && ['pending', 'confirmed'].includes(selectedBooking.status) && (
                      <button
                        onClick={() => setShowReassignModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        🔄 Reassign Cleaner
                      </button>
                    )}
                    
                    {['confirmed', 'in_progress'].includes(selectedBooking.status) && (
                      <button
                        onClick={() => setShowForceCompleteModal(true)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                      >
                        ✅ Force Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cancel Booking</h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                    setRefundAmount('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Cancel booking: <strong>#{selectedBooking.booking_id.slice(-8)}</strong>
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason (required)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount (£) (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedBooking.total_price}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={`Max: £${selectedBooking.total_price.toFixed(2)}`}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (cancelReason.trim()) {
                        cancelBooking(selectedBooking.booking_id, cancelReason, refundAmount ? parseFloat(refundAmount) : undefined)
                      }
                    }}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelModal(false)
                      setCancelReason('')
                      setRefundAmount('')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Cleaner Modal */}
      {showReassignModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reassign Cleaner</h3>
                <button
                  onClick={() => {
                    setShowReassignModal(false)
                    setNewCleanerId('')
                    setReassignReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Reassign booking: <strong>#{selectedBooking.booking_id.slice(-8)}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Current cleaner: {selectedBooking.cleaner_name || selectedBooking.cleaner_id}
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Cleaner ID (required)
                  </label>
                  <input
                    type="text"
                    value={newCleanerId}
                    onChange={(e) => setNewCleanerId(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter cleaner user ID..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reassignment Reason (required)
                  </label>
                  <textarea
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter reason for reassignment..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (newCleanerId.trim() && reassignReason.trim()) {
                        reassignBooking(selectedBooking.booking_id, newCleanerId, reassignReason)
                      }
                    }}
                    disabled={!newCleanerId.trim() || !reassignReason.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reassign Cleaner
                  </button>
                  <button
                    onClick={() => {
                      setShowReassignModal(false)
                      setNewCleanerId('')
                      setReassignReason('')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Force Complete Modal - Mobile-optimized */}
      {showForceCompleteModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 sm:p-5 border w-full max-w-full sm:max-w-lg shadow-lg rounded-md bg-white sm:top-20 sm:w-11/12">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Force Complete Booking</h3>
                <button
                  onClick={() => {
                    setShowForceCompleteModal(false)
                    setCompletionNotes('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Force complete booking: <strong>#{selectedBooking.booking_id.slice(-8)}</strong>
                </p>
                <p className="text-sm text-yellow-600">
                  This will mark the booking as completed regardless of its current status.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Notes (required)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter notes explaining why this booking is being force completed..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (completionNotes.trim()) {
                        forceCompleteBooking(selectedBooking.booking_id, completionNotes)
                      }
                    }}
                    disabled={!completionNotes.trim()}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
                  >
                    Force Complete
                  </button>
                  <button
                    onClick={() => {
                      setShowForceCompleteModal(false)
                      setCompletionNotes('')
                    }}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 min-h-[44px] flex items-center justify-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}