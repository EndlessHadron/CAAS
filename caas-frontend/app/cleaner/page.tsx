'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { contractorsApi, usersApi } from '@/lib/api-client'
import Link from 'next/link'
import {
  CalendarIcon,
  ClockIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  TrophyIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface CleanerProfile {
  experience_years: number
  services_offered: string[]
  hourly_rate: number
  radius_miles: number
  rating: number
  total_jobs: number
  availability: Record<string, string[]>
  skills: string[]
  equipment_owned: string[]
  travel_cost_per_mile: number
  min_job_duration: number
  accepts_pets: boolean
  eco_friendly: boolean
}

interface Job {
  booking_id: string
  service: {
    type: string
    price: number
    duration: number
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
    distance?: number
  }
  client: {
    name: string
    rating?: number
    total_bookings?: number
  }
  special_requirements?: string[]
  status: string
}

export default function CleanerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [cleanerProfile, setCleanerProfile] = useState<CleanerProfile | null>(null)
  const [earnings, setEarnings] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading && user.role === 'cleaner') {
      loadCleanerData()
    }
  }, [user, authLoading])

  const loadCleanerData = async () => {
    try {
      const [availableJobsData, earningsData, profileData] = await Promise.all([
        contractorsApi.getAvailableJobs(),
        contractorsApi.getEarnings(),
        usersApi.getProfile(),
      ])

      setAvailableJobs(availableJobsData)
      setEarnings(earningsData)
      setCleanerProfile(profileData.cleaner_profile)

      // Get accepted jobs (mock for now)
      setMyJobs([])

    } catch (error) {
      console.error('Failed to load cleaner dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      await contractorsApi.acceptJob(jobId)
      // Refresh data
      loadCleanerData()
    } catch (error) {
      console.error('Failed to accept job:', error)
    }
  }

  const handleCompleteJob = async (jobId: string) => {
    try {
      await contractorsApi.completeJob(jobId)
      // Refresh data
      loadCleanerData()
    } catch (error) {
      console.error('Failed to complete job:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'cleaner') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">This page is only available to cleaners.</p>
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  const todayJobs = myJobs.filter(job => {
    const jobDate = new Date(job.schedule.date).toDateString()
    const today = new Date().toDateString()
    return jobDate === today && job.status === 'confirmed'
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cleaner Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.profile?.first_name}! Manage your jobs and grow your business.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/70 transition-all duration-200 border border-white/20"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Profile
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/10 backdrop-blur-sm rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{availableJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/10 backdrop-blur-sm rounded-lg">
              <CurrencyPoundIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">£{earnings.monthlyEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/10 backdrop-blur-sm rounded-lg">
              <TrophyIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{cleanerProfile?.total_jobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-6 border border-white/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/10 backdrop-blur-sm rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {cleanerProfile?.rating?.toFixed(1) || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Jobs */}
          {todayJobs.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20">
              <div className="p-6 border-b border-gray-100/50">
                <h2 className="text-xl font-semibold text-gray-900">Today's Jobs</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {todayJobs.map((job) => (
                    <div
                      key={job.booking_id}
                      className="flex items-center justify-between p-4 bg-blue-500/10 backdrop-blur-sm border border-blue-300/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 backdrop-blur-sm rounded-lg">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.service.type}</p>
                          <p className="text-sm text-gray-600">{job.schedule.time}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {job.location.address.line1}, {job.location.address.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">£{job.service.price}</p>
                        <button
                          onClick={() => handleCompleteJob(job.booking_id)}
                          className="mt-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Available Jobs</h2>
                <span className="text-sm text-gray-500">{availableJobs.length} jobs available</span>
              </div>
            </div>
            
            <div className="p-6">
              {availableJobs.length > 0 ? (
                <div className="space-y-4">
                  {availableJobs.map((job) => (
                    <div
                      key={job.booking_id}
                      className="p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-primary-300/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-gray-500/10 backdrop-blur-sm rounded-lg">
                              <HomeIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{job.service.type}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(job.schedule.date).toLocaleDateString()} at {job.schedule.time}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-11 space-y-1">
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {job.location.address.line1}, {job.location.address.city}, {job.location.address.postcode}
                              {job.location.distance && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({job.location.distance} miles away)
                                </span>
                              )}
                            </p>
                            
                            <p className="text-sm text-gray-600">
                              Duration: {job.service.duration}h | Client: {job.client.name}
                              {job.client.rating && (
                                <span className="ml-1">⭐ {job.client.rating}</span>
                              )}
                            </p>
                            
                            {job.special_requirements && job.special_requirements.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.special_requirements.map((req, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-1 text-xs bg-yellow-500/10 text-yellow-700 rounded-full backdrop-blur-sm"
                                  >
                                    {req}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-lg font-semibold text-green-600 mb-2">
                            £{job.service.price}
                          </p>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleAcceptJob(job.booking_id)}
                              className="flex items-center px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button className="flex items-center px-3 py-2 bg-white/50 backdrop-blur-sm text-gray-600 rounded hover:bg-white/70 text-sm border border-white/20">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Pass
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No jobs available right now</p>
                  <p className="text-sm text-gray-400">Check back later or update your availability</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Stats */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {user.profile && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-gray-900">{user.profile.first_name} {user.profile.last_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </>
              )}

              {cleanerProfile && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                    <p className="text-gray-900">£{cleanerProfile.hourly_rate}/hour</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-gray-900">{cleanerProfile.experience_years} years</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Radius</p>
                    <p className="text-gray-900">{cleanerProfile.radius_miles} miles</p>
                  </div>

                  {cleanerProfile.services_offered.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Services</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cleanerProfile.services_offered.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cleanerProfile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cleanerProfile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/profile"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Update your profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This week</span>
                <span className="text-sm font-medium text-gray-900">
                  £{earnings.weeklyEarnings?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This month</span>
                <span className="text-sm font-medium text-gray-900">
                  £{earnings.monthlyEarnings?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total earned</span>
                <span className="text-sm font-medium text-gray-900">
                  £{earnings.totalEarnings?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Jobs completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {cleanerProfile?.total_jobs || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <Link
                href="/availability"
                className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Update Availability
              </Link>
              
              <Link
                href="/profile"
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Update Services
              </Link>
              
              <Link
                href="/earnings"
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CurrencyPoundIcon className="h-5 w-5 mr-2" />
                View Earnings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}