'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { bookingsApi, usersApi } from '@/lib/api-client'
import Link from 'next/link'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  PlusIcon,
  CogIcon,
  HeartIcon,
  HomeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ClientProfile {
  preferred_service_types: string[]
  preferred_times: string[]
  special_requirements: string[]
  property_type: string
  property_size: string
  pets: boolean
  preferred_products: string
  access_notes: string
}

interface Booking {
  booking_id: string
  service: {
    type: string
    price: number
  }
  schedule: {
    date: string
    time: string
  }
  location: {
    address: {
      line1: string
      city: string
      postcode: string
    }
  }
  status: string
  cleaner?: {
    name: string
    rating: number
  }
}

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading && user.role === 'client') {
      loadClientData()
    }
  }, [user, authLoading])

  const loadClientData = async () => {
    try {
      const [bookingsData, profileData] = await Promise.all([
        bookingsApi.getBookings(),
        usersApi.getProfile(),
      ])

      setBookings(bookingsData)
      setClientProfile(profileData.client_profile)

      // Calculate client stats with null safety
      const now = new Date()
      const clientStats = {
        totalBookings: bookingsData.length,
        upcomingBookings: bookingsData.filter(b => 
          b?.schedule?.date && new Date(b.schedule.date) > now && ['pending', 'confirmed'].includes(b.status)
        ).length,
        completedBookings: bookingsData.filter(b => b?.status === 'completed').length,
        totalSpent: bookingsData
          .filter(b => b?.status === 'completed')
          .reduce((sum, b) => sum + (b?.service?.price || 0), 0),
        favoriteCleaners: new Set(
          bookingsData
            .filter(b => b?.status === 'completed' && b?.cleaner?.name)
            .map(b => b.cleaner!.name)
        ).size
      }
      setStats(clientStats)

    } catch (error) {
      console.error('Failed to load client dashboard data:', error)
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

  if (!user || user.role !== 'client') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">This page is only available to clients.</p>
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  const upcomingBookings = bookings.filter(b => 
    b?.schedule?.date && new Date(b.schedule.date) > new Date() && ['pending', 'confirmed'].includes(b?.status)
  )

  const recentBookings = bookings
    .filter(b => b?.status && ['completed', 'cancelled'].includes(b.status))
    .sort((a, b) => {
      if (!a?.schedule?.date || !b?.schedule?.date) return 0
      return new Date(b.schedule.date).getTime() - new Date(a.schedule.date).getTime()
    })
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header with glass effect - Mobile optimized */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 flex items-center">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
                Client Dashboard
              </h1>
              <p className="text-secondary-600 mt-2 text-base sm:text-lg">
                Welcome back, {user.profile?.first_name}! Manage your <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> services.
              </p>
            </div>
            <Link
              href="/bookings/new"
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Book Cleaning
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats with glass cards - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Bookings */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-primary-500/20 backdrop-blur-sm rounded-xl">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm sm:text-base font-medium text-secondary-600">Total Bookings</p>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900">{stats.totalBookings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-500/20 backdrop-blur-sm rounded-xl">
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm sm:text-base font-medium text-secondary-600">Upcoming</p>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900">{stats.upcomingBookings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="relative group sm:col-span-2 lg:col-span-1">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-500/20 backdrop-blur-sm rounded-xl">
                <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm sm:text-base font-medium text-secondary-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900">{stats.completedBookings || 0}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid - Mobile optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Bookings */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Upcoming Bookings with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-4 sm:p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">Upcoming Bookings</h2>
                  <Link href="/bookings" className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium transition-colors">
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.booking_id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/[0.08] transition-all duration-200 space-y-3 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="p-2 bg-primary-500/20 backdrop-blur-sm rounded-xl flex-shrink-0">
                            <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-secondary-900 text-sm sm:text-base">{booking?.service?.type || 'Service'}</p>
                            <p className="text-sm sm:text-base text-secondary-600">
                              {booking?.schedule?.date ? new Date(booking.schedule.date).toLocaleDateString() : 'Date TBD'}
                              {booking?.schedule?.time ? ` at ${booking.schedule.time}` : ''}
                            </p>
                            {booking?.location?.address && (
                              <p className="text-xs sm:text-sm text-secondary-500 flex items-center mt-1">
                                <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{booking.location.address.line1}, {booking.location.address.city}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                          <p className="font-semibold text-primary-600 text-sm sm:text-base">£{booking?.service?.price || 0}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            booking?.status === 'confirmed' 
                              ? 'bg-green-100/60 text-green-800 border border-green-200/50'
                              : 'bg-yellow-100/60 text-yellow-800 border border-yellow-200/50'
                          }`}>
                            {booking?.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-500 mb-4 text-base">No upcoming bookings</p>
                    <Link href="/bookings/new" className="btn-primary">
                      Book Your First Cleaning
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-4 sm:p-6 border-b border-white/20">
                <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">Recent Activity</h2>
              </div>
              
              <div className="p-4 sm:p-6">
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.booking_id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white/[0.06] backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/[0.08] transition-all duration-200 space-y-3 sm:space-y-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-secondary-900 text-sm sm:text-base">{booking?.service?.type || 'Service'}</p>
                          <p className="text-sm sm:text-base text-secondary-600">
                            {booking?.schedule?.date ? new Date(booking.schedule.date).toLocaleDateString() : 'Date TBD'}
                          </p>
                          {booking?.cleaner?.name && (
                            <p className="text-xs sm:text-sm text-secondary-500">
                              Cleaned by {booking.cleaner.name} 
                              {booking.cleaner.rating && (
                                <span className="ml-1">⭐ {booking.cleaner.rating}</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                          <p className="font-semibold text-secondary-900 text-sm sm:text-base">£{booking?.service?.price || 0}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            booking?.status === 'completed' 
                              ? 'bg-green-100/60 text-green-800 border border-green-200/50'
                              : 'bg-red-100/60 text-red-800 border border-red-200/50'
                          }`}>
                            {booking?.status || 'unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-center py-8 text-base">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Quick Actions */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Actions with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-4 sm:p-6 border-b border-white/20">
                <h2 className="text-base sm:text-lg font-semibold text-secondary-900">Quick Actions</h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-3">
                <Link
                  href="/bookings/new"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Book Cleaning Service
                </Link>
                
                <Link
                  href="/bookings"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  View All Bookings
                </Link>
                
                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  Update Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Summary with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-4 sm:p-6 border-b border-white/20">
                <h2 className="text-base sm:text-lg font-semibold text-secondary-900">Profile Summary</h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                {user.profile && (
                  <>
                    <div>
                      <p className="text-base font-medium text-secondary-600">Name</p>
                      <p className="text-secondary-900">{user.profile.first_name} {user.profile.last_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-base font-medium text-secondary-600">Email</p>
                      <p className="text-secondary-900">{user.email}</p>
                    </div>
                    
                    {user.profile.phone && (
                      <div>
                        <p className="text-base font-medium text-secondary-600">Phone</p>
                        <p className="text-secondary-900">{user.profile.phone}</p>
                      </div>
                    )}
                  </>
                )}

                {clientProfile && (
                  <>
                    {clientProfile.property_type && (
                      <div>
                        <p className="text-base font-medium text-secondary-600">Property Type</p>
                        <p className="text-secondary-900 capitalize">{clientProfile.property_type}</p>
                      </div>
                    )}
                    
                    {clientProfile.property_size && (
                      <div>
                        <p className="text-base font-medium text-secondary-600">Property Size</p>
                        <p className="text-secondary-900">{clientProfile.property_size}</p>
                      </div>
                    )}

                    {clientProfile.preferred_service_types.length > 0 && (
                      <div>
                        <p className="text-base font-medium text-secondary-600">Preferred Services</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {clientProfile.preferred_service_types.map((service, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-1 text-sm bg-primary-500/20 text-primary-700 rounded-full backdrop-blur-sm border border-primary-400/30"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {clientProfile.pets && (
                      <div className="flex items-center space-x-2">
                        <HeartIcon className="h-4 w-4 text-red-500" />
                        <span className="text-base text-secondary-600">Pet-friendly cleaning needed</span>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-4 border-t border-white/20">
                  <Link
                    href="/profile"
                    className="text-primary-600 hover:text-primary-700 text-base font-medium transition-colors"
                  >
                    Complete your profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}