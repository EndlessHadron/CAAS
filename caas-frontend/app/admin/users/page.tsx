'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api-client'
import Cookies from 'js-cookie'
import { getAdminApiUrl } from '@/lib/config'
import { MobileResponsiveTable, MobileActionButton, MobileActionGroup } from '@/components/ui/MobileResponsiveTable'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface User {
  uid: string
  email: string
  role: string
  status: string
  profile?: {
    first_name?: string
    last_name?: string
    phone?: string
  }
  created_at: string
  updated_at: string
  last_login?: string
}

interface UserSearchResponse {
  users: User[]
  total_count: number
  limit: number
  offset: number
  has_more: boolean
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const limit = 25

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchEmail, filterRole, filterStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit,
        offset: currentPage * limit
      }

      if (searchEmail) params.email = searchEmail
      if (filterRole) params.role = filterRole
      if (filterStatus) params.status = filterStatus

      const data: UserSearchResponse = await adminApi.searchUsers(params)
      setUsers(data.users)
      setTotalCount(data.total_count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const viewUserDetails = async (userId: string) => {
    try {
      const userDetails = await adminApi.getUserDetails(userId)
      setSelectedUser(userDetails)
      setShowUserModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details')
    }
  }


  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      // Refresh the users list
      fetchUsers()
      setShowUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  const unlockUserAccount = async (userId: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL instead of hardcoded
      const apiUrl = getAdminApiUrl('users', userId, 'unlock')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to unlock user account')
      fetchUsers()
      setShowUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock user account')
    }
  }

  const activateUser = async (userId: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL instead of hardcoded
      const apiUrl = getAdminApiUrl('users', userId, 'activate')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to activate user')
      fetchUsers()
      setShowUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate user')
    }
  }

  const blockUser = async (userId: string, reason: string) => {
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL with query params
      const apiUrl = `${getAdminApiUrl('users', userId, 'block')}?reason=${encodeURIComponent(reason)}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to block user')
      fetchUsers()
      setShowUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block user')
    }
  }

  const deleteUser = async (userId: string, permanent = false) => {
    if (!confirm(permanent ? 'Are you sure you want to PERMANENTLY delete this user? This cannot be undone!' : 'Are you sure you want to delete this user? This can be undone later.')) {
      return
    }
    try {
      const token = Cookies.get('auth_token')
      // PRODUCTION SAFE: Use configurable URL with proper error handling
      const apiUrl = `${getAdminApiUrl('users', userId)}?permanent=${permanent}`
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to delete user')
      fetchUsers()
      setShowUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'suspended':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <UserCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'cleaner':
        return 'bg-blue-100 text-blue-800'
      case 'client':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          User Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Search, view, and manage user accounts across the platform.
        </p>
      </div>

      {/* Filters - Mobile-first responsive */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="search-email" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="search-email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-role" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              id="filter-role"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="cleaner">Cleaner</option>
              <option value="admin">Admin</option>
            </select>
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
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
                  fetchUsers()
                }}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Users ({totalCount})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <MobileResponsiveTable
              data={users}
              columns={[
                {
                  key: 'user',
                  label: 'User',
                  mobileLabel: 'User',
                  render: (_, user) => (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.profile?.first_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.first_name && user.profile?.last_name
                            ? `${user.profile.first_name} ${user.profile.last_name}`
                            : user.email}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'role',
                  label: 'Role',
                  mobileLabel: 'Role',
                  render: (role) => (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(role)}`}>
                      {role}
                    </span>
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
                        {status}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'created_at',
                  label: 'Created',
                  mobileLabel: 'Created',
                  hideOnMobile: true,
                  render: (date) => new Date(date).toLocaleDateString()
                },
                {
                  key: 'last_login',
                  label: 'Last Login',
                  mobileLabel: 'Last Login',
                  hideOnMobile: true,
                  render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  mobileLabel: 'Actions',
                  className: 'text-right',
                  render: (_, user) => (
                    <div className="flex space-x-2 md:justify-end">
                      {/* Desktop actions */}
                      <div className="hidden md:flex space-x-2">
                        <button
                          onClick={() => viewUserDetails(user.uid)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {user.status === 'blocked' || user.status === 'suspended' ? (
                          <button
                            onClick={() => unlockUserAccount(user.uid)}
                            className="text-green-600 hover:text-green-900"
                            title="Unlock Account"
                          >
                            🔓
                          </button>
                        ) : null}
                        {user.status !== 'active' ? (
                          <button
                            onClick={() => activateUser(user.uid)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Activate User"
                          >
                            ✅
                          </button>
                        ) : null}
                        {user.status !== 'blocked' ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBlockModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Block User"
                          >
                            🚫
                          </button>
                        ) : null}
                        <button
                          onClick={() => deleteUser(user.uid, false)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Soft Delete"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => deleteUser(user.uid, true)}
                          className="text-red-700 hover:text-red-900"
                          title="Permanent Delete"
                        >
                          ❌
                        </button>
                      </div>
                      
                      {/* Mobile actions with improved touch targets */}
                      <MobileActionGroup className="md:hidden">
                        <MobileActionButton
                          onClick={() => viewUserDetails(user.uid)}
                          variant="secondary"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </MobileActionButton>
                        {user.status === 'blocked' || user.status === 'suspended' ? (
                          <MobileActionButton
                            onClick={() => unlockUserAccount(user.uid)}
                            variant="secondary"
                            title="Unlock Account"
                          >
                            🔓 Unlock
                          </MobileActionButton>
                        ) : null}
                        {user.status !== 'active' ? (
                          <MobileActionButton
                            onClick={() => activateUser(user.uid)}
                            variant="primary"
                            title="Activate User"
                          >
                            ✅ Activate
                          </MobileActionButton>
                        ) : null}
                        {user.status !== 'blocked' ? (
                          <MobileActionButton
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBlockModal(true)
                            }}
                            variant="danger"
                            title="Block User"
                          >
                            🚫 Block
                          </MobileActionButton>
                        ) : null}
                        <MobileActionButton
                          onClick={() => deleteUser(user.uid, false)}
                          variant="secondary"
                          title="Soft Delete"
                        >
                          🗑️ Delete
                        </MobileActionButton>
                      </MobileActionGroup>
                    </div>
                  )
                }
              ]}
              emptyMessage="No users found matching your criteria."
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

      {/* User Details Modal - Mobile-optimized */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 sm:p-5 border w-full max-w-full sm:max-w-2xl lg:max-w-3xl shadow-lg rounded-md bg-white sm:top-20 sm:w-11/12">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedUser.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.profile?.first_name && selectedUser.profile?.last_name
                        ? `${selectedUser.profile.first_name} ${selectedUser.profile.last_name}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>

                {selectedUser.profile?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.profile.phone}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Bookings summary */}
                {(selectedUser as any).bookings && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bookings</label>
                    <p className="mt-1 text-sm text-gray-900">{(selectedUser as any).bookings.length} total bookings</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {/* Status Actions */}
                  {selectedUser.status === 'active' && (
                    <button
                      onClick={() => updateUserStatus(selectedUser.uid, 'suspended')}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                    >
                      Suspend User
                    </button>
                  )}
                  {selectedUser.status === 'suspended' && (
                    <button
                      onClick={() => updateUserStatus(selectedUser.uid, 'active')}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      Reactivate User
                    </button>
                  )}
                  {selectedUser.status === 'pending' && (
                    <button
                      onClick={() => activateUser(selectedUser.uid)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Activate User
                    </button>
                  )}
                  
                  {/* Security Actions */}
                  {(selectedUser.status === 'blocked' || selectedUser.status === 'suspended') && (
                    <button
                      onClick={() => unlockUserAccount(selectedUser.uid)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      🔓 Unlock Account
                    </button>
                  )}
                  
                  {selectedUser.status !== 'blocked' && (
                    <button
                      onClick={() => {
                        setShowBlockModal(true)
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    >
                      🚫 Block User
                    </button>
                  )}
                  
                  {/* Delete Actions */}
                  <button
                    onClick={() => deleteUser(selectedUser.uid, false)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                  >
                    🗑️ Soft Delete
                  </button>
                  
                  <button
                    onClick={() => deleteUser(selectedUser.uid, true)}
                    className="px-4 py-2 bg-red-800 text-white text-sm font-medium rounded-md hover:bg-red-900"
                  >
                    ❌ Permanent Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal - Mobile-optimized */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 sm:p-5 border w-full max-w-full sm:max-w-lg shadow-lg rounded-md bg-white sm:top-20 sm:w-11/12">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Block User</h3>
                <button
                  onClick={() => {
                    setShowBlockModal(false)
                    setBlockReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You are about to block user: <strong>{selectedUser.email}</strong>
                </p>
                <p className="text-sm text-red-600">
                  This will permanently block the user and cancel all their active bookings.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for blocking (required)
                  </label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter the reason for blocking this user..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (blockReason.trim()) {
                        blockUser(selectedUser.uid, blockReason)
                        setBlockReason('')
                      }
                    }}
                    disabled={!blockReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Block User
                  </button>
                  <button
                    onClick={() => {
                      setShowBlockModal(false)
                      setBlockReason('')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Cancel
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