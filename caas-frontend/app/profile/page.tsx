'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { usersApi } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  HeartIcon,
  CurrencyPoundIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface BasicProfile {
  first_name: string
  last_name: string
  phone: string
  bio: string
  address: {
    line1: string
    line2?: string
    city: string
    postcode: string
    country: string
  } | null
}

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

interface CleanerProfile {
  experience_years: number
  services_offered: string[]
  hourly_rate: number
  radius_miles: number
  availability: Record<string, string[]>
  skills: string[]
  equipment_owned: string[]
  travel_cost_per_mile: number
  min_job_duration: number
  accepts_pets: boolean
  eco_friendly: boolean
}

const SERVICE_TYPES = [
  'Regular Cleaning', 'Deep Cleaning', 'End of Tenancy', 'After Builders',
  'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Oven Cleaning'
]

const PREFERRED_TIMES = [
  'Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Flexible'
]

const PROPERTY_TYPES = ['Flat', 'House', 'Office', 'Studio', 'Other']
const PROPERTY_SIZES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom', 'Small Office', 'Large Office']

const CLEANER_SKILLS = [
  'Eco-friendly Products', 'Pet-friendly', 'Deep Cleaning Specialist',
  'Commercial Cleaning', 'Post-construction Cleanup', 'Window Cleaning',
  'Carpet Cleaning', 'Upholstery Cleaning'
]

const EQUIPMENT_LIST = [
  'Vacuum Cleaner', 'Steam Cleaner', 'Carpet Cleaner', 'Window Cleaning Kit',
  'Pressure Washer', 'Floor Buffer', 'Professional Chemicals', 'Microfiber Cloths'
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = ['8am-12pm', '12pm-5pm', '5pm-8pm']

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile states
  const [basicProfile, setBasicProfile] = useState<BasicProfile>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    address: null
  })
  
  const [clientProfile, setClientProfile] = useState<ClientProfile>({
    preferred_service_types: [],
    preferred_times: [],
    special_requirements: [],
    property_type: '',
    property_size: '',
    pets: false,
    preferred_products: '',
    access_notes: ''
  })
  
  const [cleanerProfile, setCleanerProfile] = useState<CleanerProfile>({
    experience_years: 0,
    services_offered: [],
    hourly_rate: 0,
    radius_miles: 5,
    availability: {},
    skills: [],
    equipment_owned: [],
    travel_cost_per_mile: 0,
    min_job_duration: 2,
    accepts_pets: true,
    eco_friendly: false
  })

  useEffect(() => {
    if (user && !authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      const profileData = await usersApi.getProfile()
      
      // Set basic profile
      if (profileData.profile) {
        setBasicProfile({
          first_name: profileData.profile.first_name || '',
          last_name: profileData.profile.last_name || '',
          phone: profileData.profile.phone || '',
          bio: profileData.profile.bio || '',
          address: profileData.profile.address || null
        })
      }
      
      // Set role-specific profile
      if (user?.role === 'client' && profileData.client_profile) {
        setClientProfile({ ...clientProfile, ...profileData.client_profile })
      } else if (user?.role === 'cleaner' && profileData.cleaner_profile) {
        setCleanerProfile({ ...cleanerProfile, ...profileData.cleaner_profile })
      }
      
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      if (user.role === 'client') {
        const updateData = { ...basicProfile, ...clientProfile }
        await usersApi.updateClientProfile(updateData)
      } else if (user.role === 'cleaner') {
        const updateData = { ...basicProfile, ...cleanerProfile }
        await usersApi.updateCleanerProfile(updateData)
      }
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleArrayToggle = (array: string[], value: string, setter: Function) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value))
    } else {
      setter([...array, value])
    }
  }

  const handleAvailabilityChange = (day: string, timeSlot: string) => {
    const currentDaySlots = cleanerProfile.availability[day] || []
    const newSlots = currentDaySlots.includes(timeSlot)
      ? currentDaySlots.filter(slot => slot !== timeSlot)
      : [...currentDaySlots, timeSlot]
    
    setCleanerProfile({
      ...cleanerProfile,
      availability: { ...cleanerProfile.availability, [day]: newSlots }
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with glass effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-8 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-primary-600" />
                Profile Settings
              </h1>
              <p className="text-secondary-600 mt-2 text-lg">
                Manage your <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> profile and {user.role === 'client' ? 'cleaning preferences' : 'service details'}
              </p>
            </div>
            
            {saveSuccess && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200/50">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-base font-medium">Profile saved!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Profile with glass effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-secondary-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-primary-600" />
              Basic Information
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="mobile-grid-responsive gap-6">
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={basicProfile.first_name}
                  onChange={(e) => setBasicProfile({ ...basicProfile, first_name: e.target.value })}
                  className="form-input-glass w-full"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={basicProfile.last_name}
                  onChange={(e) => setBasicProfile({ ...basicProfile, last_name: e.target.value })}
                  className="form-input-glass w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-secondary-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={basicProfile.phone}
                onChange={(e) => setBasicProfile({ ...basicProfile, phone: e.target.value })}
                className="form-input-glass w-full"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-secondary-700 mb-2">
                Bio
              </label>
              <textarea
                value={basicProfile.bio}
                onChange={(e) => setBasicProfile({ ...basicProfile, bio: e.target.value })}
                rows={3}
                className="form-input-glass w-full"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client-specific Profile with glass effect */}
      {user.role === 'client' && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-semibold text-secondary-900 flex items-center">
                <HomeIcon className="h-6 w-6 mr-2 text-primary-600" />
                Client Preferences
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="mobile-grid-responsive gap-6">
                <div>
                  <label className="block text-base font-medium text-secondary-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={clientProfile.property_type}
                    onChange={(e) => setClientProfile({ ...clientProfile, property_type: e.target.value })}
                    className="form-input-glass w-full"
                  >
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-secondary-700 mb-2">
                    Property Size
                  </label>
                  <select
                    value={clientProfile.property_size}
                    onChange={(e) => setClientProfile({ ...clientProfile, property_size: e.target.value })}
                    className="form-input-glass w-full"
                  >
                    <option value="">Select property size</option>
                    {PROPERTY_SIZES.map(size => (
                      <option key={size} value={size.toLowerCase()}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-3">
                  Preferred Service Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SERVICE_TYPES.map(service => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer p-2 bg-white/[0.06] backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/[0.08] transition-all">
                      <input
                        type="checkbox"
                        checked={clientProfile.preferred_service_types.includes(service)}
                        onChange={() => handleArrayToggle(
                          clientProfile.preferred_service_types,
                          service,
                          (newArray: string[]) => setClientProfile({ ...clientProfile, preferred_service_types: newArray })
                        )}
                        className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                      />
                      <span className="text-base text-secondary-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-3">
                  Preferred Times
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PREFERRED_TIMES.map(time => (
                    <label key={time} className="flex items-center space-x-2 cursor-pointer p-2 bg-white/[0.06] backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/[0.08] transition-all">
                      <input
                        type="checkbox"
                        checked={clientProfile.preferred_times.includes(time)}
                        onChange={() => handleArrayToggle(
                          clientProfile.preferred_times,
                          time,
                          (newArray: string[]) => setClientProfile({ ...clientProfile, preferred_times: newArray })
                        )}
                        className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                      />
                      <span className="text-base text-secondary-700">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20">
                <input
                  type="checkbox"
                  id="pets"
                  checked={clientProfile.pets}
                  onChange={(e) => setClientProfile({ ...clientProfile, pets: e.target.checked })}
                  className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                />
                <label htmlFor="pets" className="flex items-center text-base text-secondary-700 cursor-pointer">
                  <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
                  I have pets (requires pet-friendly cleaning)
                </label>
              </div>
              
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-2">
                  Access Notes
                </label>
                <textarea
                  value={clientProfile.access_notes}
                  onChange={(e) => setClientProfile({ ...clientProfile, access_notes: e.target.value })}
                  rows={3}
                  className="form-input-glass w-full"
                  placeholder="Instructions for accessing your property (key location, buzzer code, etc.)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaner-specific Profile */}
      {user.role === 'cleaner' && (
        <div className="space-y-8">
          {/* Service Details with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-secondary-900 flex items-center">
                  <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Service Details
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      <CurrencyPoundIcon className="h-4 w-4 inline mr-1" />
                      Hourly Rate (£)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.50"
                      value={cleanerProfile.hourly_rate}
                      onChange={(e) => setCleanerProfile({ ...cleanerProfile, hourly_rate: parseFloat(e.target.value) || 0 })}
                      className="form-input-glass w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cleanerProfile.experience_years}
                      onChange={(e) => setCleanerProfile({ ...cleanerProfile, experience_years: parseInt(e.target.value) || 0 })}
                      className="form-input-glass w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-1" />
                      Service Radius (miles)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={cleanerProfile.radius_miles}
                      onChange={(e) => setCleanerProfile({ ...cleanerProfile, radius_miles: parseInt(e.target.value) || 5 })}
                      className="form-input-glass w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-secondary-700 mb-3">
                    Services Offered
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICE_TYPES.map(service => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer p-2 bg-white/[0.06] backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/[0.08] transition-all">
                        <input
                          type="checkbox"
                          checked={cleanerProfile.services_offered.includes(service)}
                          onChange={() => handleArrayToggle(
                            cleanerProfile.services_offered,
                            service,
                            (newArray: string[]) => setCleanerProfile({ ...cleanerProfile, services_offered: newArray })
                          )}
                          className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                        />
                        <span className="text-base text-secondary-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-secondary-700 mb-3">
                    Skills & Specializations
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CLEANER_SKILLS.map(skill => (
                      <label key={skill} className="flex items-center space-x-2 cursor-pointer p-2 bg-white/[0.06] backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/[0.08] transition-all">
                        <input
                          type="checkbox"
                          checked={cleanerProfile.skills.includes(skill)}
                          onChange={() => handleArrayToggle(
                            cleanerProfile.skills,
                            skill,
                            (newArray: string[]) => setCleanerProfile({ ...cleanerProfile, skills: newArray })
                          )}
                          className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                        />
                        <span className="text-base text-secondary-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer p-3 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20">
                      <input
                        type="checkbox"
                        checked={cleanerProfile.accepts_pets}
                        onChange={(e) => setCleanerProfile({ ...cleanerProfile, accepts_pets: e.target.checked })}
                        className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                      />
                      <span className="text-base text-secondary-700">Accept jobs with pets</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer p-3 bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/20">
                      <input
                        type="checkbox"
                        checked={cleanerProfile.eco_friendly}
                        onChange={(e) => setCleanerProfile({ ...cleanerProfile, eco_friendly: e.target.checked })}
                        className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                      />
                      <span className="text-base text-secondary-700">Eco-friendly products only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability with glass effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
            <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-secondary-900 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Availability
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center space-x-4 p-3 bg-white/[0.04] backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="w-24 font-medium text-secondary-700">{day}</div>
                      <div className="flex space-x-3">
                        {TIME_SLOTS.map(slot => (
                          <label key={slot} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(cleanerProfile.availability[day] || []).includes(slot)}
                              onChange={() => handleAvailabilityChange(day, slot)}
                              className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                            />
                            <span className="text-base text-secondary-700">{slot}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}