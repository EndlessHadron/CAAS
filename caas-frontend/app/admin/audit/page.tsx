'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api-client'
import {
  DocumentTextIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  CogIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface AuditLog {
  log_id: string
  admin_id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address: string
  user_agent?: string
  timestamp: string
  success: boolean
}

interface AuditLogsResponse {
  logs: AuditLog[]
  limit: number
  offset: number
  has_more: boolean
}

export default function AdminAuditPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAdminId, setFilterAdminId] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterResourceType, setFilterResourceType] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)

  const limit = 50

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage, filterAdminId, filterAction, filterResourceType])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit,
        offset: currentPage * limit
      }

      if (filterAdminId) params.admin_id = filterAdminId
      if (filterAction) params.action = filterAction
      if (filterResourceType) params.resource_type = filterResourceType

      const data: AuditLogsResponse = await adminApi.getAuditLogs(params)
      setLogs(data.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('view')) return <EyeIcon className="h-5 w-5 text-blue-500" />
    if (action.includes('update') || action.includes('edit')) return <CogIcon className="h-5 w-5 text-yellow-500" />
    if (action.includes('delete') || action.includes('suspend')) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    if (action.includes('create') || action.includes('add')) return <ShieldCheckIcon className="h-5 w-5 text-green-500" />
    return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
  }

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user':
      case 'users':
        return <UserIcon className="h-4 w-4" />
      case 'booking':
      case 'bookings':
        return <CalendarIcon className="h-4 w-4" />
      case 'dashboard':
        return <DocumentTextIcon className="h-4 w-4" />
      default:
        return <CogIcon className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('view')) return 'bg-blue-100 text-blue-800'
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800'
    if (action.includes('delete') || action.includes('suspend')) return 'bg-red-100 text-red-800'
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatResourceType = (resourceType: string) => {
    return resourceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const timeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Audit Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review all administrative actions and system activity for compliance and security monitoring.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-admin" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Admin Email
            </label>
            <input
              type="email"
              id="filter-admin"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter admin email"
              value={filterAdminId}
              onChange={(e) => setFilterAdminId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filter-action" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Action
            </label>
            <select
              id="filter-action"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="view_dashboard_metrics">View Dashboard</option>
              <option value="search_users">Search Users</option>
              <option value="view_user_details">View User Details</option>
              <option value="update_user_status">Update User Status</option>
              <option value="search_bookings">Search Bookings</option>
              <option value="update_booking_status">Update Booking Status</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-resource" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Resource Type
            </label>
            <select
              id="filter-resource"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value)}
            >
              <option value="">All Resources</option>
              <option value="dashboard">Dashboard</option>
              <option value="users">Users</option>
              <option value="user">User</option>
              <option value="bookings">Bookings</option>
              <option value="booking">Booking</option>
              <option value="auth">Authentication</option>
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
                  fetchAuditLogs()
                }}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              Real-time monitoring
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.log_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                            {getResourceIcon(log.resource_type)}
                            <span className="ml-1">{formatAction(log.action)}</span>
                          </span>
                          <span className="text-xs text-gray-500">on</span>
                          <span className="text-xs font-medium text-gray-700">
                            {formatResourceType(log.resource_type)}
                          </span>
                          {log.resource_id && (
                            <>
                              <span className="text-xs text-gray-500">:</span>
                              <span className="text-xs font-mono text-gray-600">
                                {log.resource_id.length > 20 ? `${log.resource_id.slice(0, 20)}...` : log.resource_id}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          by <span className="font-medium">{log.admin_email}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{timeAgo(log.timestamp)}</span>
                          <span>•</span>
                          <span>{log.ip_address}</span>
                          {log.success ? (
                            <span className="text-green-600 font-medium">Success</span>
                          ) : (
                            <span className="text-red-600 font-medium">Failed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLog(log)
                        setShowLogModal(true)
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No audit logs found matching your criteria.
                </div>
              )}

              {/* Load More Button */}
              {logs.length >= limit && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded-md hover:bg-primary-50"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {showLogModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.log_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.admin_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin ID</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.admin_id}</p>
                  </div>
                </div>

                {/* Action Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <span className={`mt-1 inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${getActionColor(selectedLog.action)}`}>
                      {formatAction(selectedLog.action)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Type</label>
                    <p className="mt-1 text-sm text-gray-900">{formatResourceType(selectedLog.resource_type)}</p>
                  </div>
                </div>

                {selectedLog.resource_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.resource_id}</p>
                  </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.ip_address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedLog.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLog.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>

                {selectedLog.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-xs font-mono text-gray-900 break-all">{selectedLog.user_agent}</p>
                  </div>
                )}

                {/* Additional Details */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                    <div className="bg-gray-50 rounded-md p-3">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}