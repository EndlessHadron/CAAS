'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import {
  UsersIcon,
  CalendarIcon,
  CurrencyPoundIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  TicketIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface AdminMetrics {
  total_users: number
  active_bookings: number
  pending_bookings: number
  total_revenue: number
  monthly_revenue: number
  support_tickets_open: number
  system_health: string
  last_updated?: string
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (authLoading) return // Wait for auth to complete
    
    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'admin') {
      console.log('User is not admin:', user.role)
      router.push('/dashboard')
      return
    }
    
    console.log('Admin user verified, loading metrics')
    fetchDashboardMetrics()
  }, [user, authLoading, router])

  const fetchDashboardMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getDashboardMetrics()
      setMetrics({
        ...data,
        last_updated: new Date().toISOString()
      })
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You must be an admin to access this page.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl"></div>
          <div className="relative bg-red-50/60 backdrop-blur-sm border border-red-200/50 rounded-xl p-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-base font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="mt-1 text-base text-red-600">{error}</p>
                <button
                  onClick={fetchDashboardMetrics}
                  className="mt-3 text-base font-medium text-red-800 hover:text-red-900 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Users',
      value: metrics?.total_users || 0,
      icon: UsersIcon,
      change: 'Current total',
      changeType: 'neutral',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/20'
    },
    {
      name: 'Active Bookings',
      value: metrics?.active_bookings || 0,
      icon: CalendarIcon,
      change: 'In progress',
      changeType: 'neutral',
      bgColor: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-500/20'
    },
    {
      name: 'Pending Bookings',
      value: metrics?.pending_bookings || 0,
      icon: ClockIcon,
      change: 'Awaiting action',
      changeType: 'neutral',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-500/20'
    },
    {
      name: 'Monthly Revenue',
      value: `£${metrics?.monthly_revenue?.toFixed(2) || '0.00'}`,
      icon: CurrencyPoundIcon,
      change: 'Current month',
      changeType: 'neutral',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-500/20'
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'bookings', name: 'Bookings', icon: CalendarIcon },
    { id: 'audit', name: 'Audit Logs', icon: DocumentTextIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with glass effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-8 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-primary-600" />
                Admin Dashboard
              </h1>
              <p className="text-secondary-600 mt-2 text-lg">
                Welcome back, {user?.profile?.first_name || user?.email}. Manage your <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> platform.
              </p>
            </div>
            <div className="text-base text-secondary-500">
              Last updated: {metrics?.last_updated ? new Date(metrics.last_updated).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* System Health with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl"></div>
        <div className="relative bg-green-50/30 backdrop-blur-sm rounded-xl border border-green-400/30 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="text-lg font-medium text-secondary-900">System Status</h3>
              <p className="text-2xl font-bold text-green-600 capitalize">
                {metrics?.system_health || 'Healthy'}
              </p>
            </div>
            <div className="text-base text-secondary-600">
              All systems operational
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.bgColor} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center">
                <div className={`p-3 ${stat.iconBg} backdrop-blur-sm rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-secondary-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-500">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-base transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-secondary-900">Platform Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-base font-medium text-secondary-700 mb-4">Platform Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-600">Database</span>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-600">Authentication</span>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-600">Payment Processing</span>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-base font-medium text-secondary-700 mb-4">Support Tickets</h4>
                    <div className="flex items-center space-x-2">
                      <TicketIcon className="h-5 w-5 text-yellow-600" />
                      <span className="text-lg font-semibold text-secondary-900">
                        {metrics?.support_tickets_open || 0} Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">User Management</h3>
                <p className="text-secondary-600">Search and manage platform users</p>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="btn-primary"
                >
                  Manage Users
                </button>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">Booking Management</h3>
                <p className="text-secondary-600">View and manage all bookings</p>
                <button
                  onClick={() => router.push('/admin/bookings')}
                  className="btn-primary"
                >
                  Manage Bookings
                </button>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">Audit Logs</h3>
                <p className="text-secondary-600">Track all admin actions and system events</p>
                <button
                  onClick={() => router.push('/admin/audit')}
                  className="btn-primary"
                >
                  View Audit Logs
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">Platform Settings</h3>
                <p className="text-secondary-600">Configure platform-wide settings and preferences</p>
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="btn-primary"
                >
                  Manage Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-secondary-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users/new')}
                className="p-4 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/[0.08] transition-all text-center"
              >
                <UsersIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <span className="text-base text-secondary-700">Add User</span>
              </button>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="p-4 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/[0.08] transition-all text-center"
              >
                <CalendarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-base text-secondary-700">View Bookings</span>
              </button>
              <button
                onClick={() => router.push('/admin/reports')}
                className="p-4 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/[0.08] transition-all text-center"
              >
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-base text-secondary-700">Reports</span>
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-4 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/[0.08] transition-all text-center"
              >
                <CogIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <span className="text-base text-secondary-700">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}