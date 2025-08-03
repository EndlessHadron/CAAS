'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { bookingsApi, contractorsApi } from '@/lib/api-client'
import Link from 'next/link'
import { CalendarIcon, ClockIcon, UserGroupIcon, CurrencyPoundIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'client') {
        const [bookingsData] = await Promise.all([
          bookingsApi.getBookings(),
        ])
        setBookings(bookingsData)
        
        // Calculate client stats
        const clientStats = {
          totalBookings: bookingsData.length,
          upcomingBookings: bookingsData.filter(b => 
            new Date(b.schedule.date) > new Date() && ['pending', 'confirmed'].includes(b.status)
          ).length,
          completedBookings: bookingsData.filter(b => b.status === 'completed').length,
          totalSpent: bookingsData
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.payment?.amount || 0), 0)
        }
        setStats(clientStats)
        
      } else if (user?.role === 'cleaner') {
        const [availableJobs, earnings] = await Promise.all([
          contractorsApi.getAvailableJobs(),
          contractorsApi.getEarnings(),
        ])
        setBookings(availableJobs)
        setStats(earnings)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
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
        <p className="text-gray-600 mb-8">Please log in to access your dashboard.</p>
        <Link href="/auth/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'client' 
            ? 'Manage your cleaning bookings and schedule new services.' 
            : 'View available jobs and manage your cleaning assignments.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'client' ? (
          <>
            <div className="card">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedBookings || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">£{stats.totalSpent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>
            <div className="card">  
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">£{stats.monthlyEarnings?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedJobs || 0}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">£{stats.totalEarnings?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.role === 'client' ? (
            <>
              <Link href="/bookings/new" className="btn-primary text-center">
                Book Cleaning Service
              </Link>
              <Link href="/bookings" className="btn-secondary text-center">
                View My Bookings
              </Link>
              <Link href="/profile" className="btn-secondary text-center">
                Update Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/jobs" className="btn-primary text-center">
                Browse Available Jobs
              </Link>
              <Link href="/jobs/my-jobs" className="btn-secondary text-center">
                My Accepted Jobs
              </Link>
              <Link href="/profile" className="btn-secondary text-center">
                Update Profile
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {user.role === 'client' ? 'Recent Bookings' : 'Available Jobs'}
        </h2>
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.booking_id || booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.service?.type || 'Cleaning Service'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.schedule?.date} at {booking.schedule?.time}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.location?.address?.line1}, {booking.location?.address?.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    £{booking.service?.price || booking.payment?.amount}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {booking.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {user.role === 'client' 
              ? 'No bookings yet. Create your first booking!' 
              : 'No available jobs at the moment.'
            }
          </p>
        )}
      </div>
    </div>
  )
}