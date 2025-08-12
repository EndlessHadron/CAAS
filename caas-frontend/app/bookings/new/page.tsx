'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useForm } from 'react-hook-form'
import { bookingsApi, usersApi } from '@/lib/api-client'
import { 
  CalendarIcon, 
  ClockIcon, 
  HomeIcon, 
  MapPinIcon, 
  SparklesIcon,
  UserIcon,
  CurrencyPoundIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface BookingForm {
  service_type: string
  date: string
  time: string
  duration: number
  address_line1: string
  address_line2: string
  city: string
  postcode: string
  instructions: string
  special_requirements: string[]
  notes: string
}

const serviceTypes = [
  { value: 'regular', label: 'Regular Cleaning', price: 25, description: 'Weekly or bi-weekly cleaning' },
  { value: 'deep', label: 'Deep Cleaning', price: 35, description: 'Thorough one-time cleaning' },
  { value: 'move_in', label: 'Move In Cleaning', price: 40, description: 'Cleaning for new home' },
  { value: 'move_out', label: 'Move Out Cleaning', price: 40, description: 'Cleaning before moving out' },
  { value: 'one_time', label: 'One-Time Service', price: 30, description: 'Occasional cleaning service' },
]

const specialRequirements = [
  'Pet-friendly products',
  'Eco-friendly products only',
  'Deep carpet cleaning',
  'Window cleaning',
  'Oven cleaning',
  'Refrigerator cleaning',
  'Inside cabinets',
  'Garage cleaning',
]

export default function NewBookingPage() {
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [availableCleaners, setAvailableCleaners] = useState<any[]>([])
  const [selectedCleaner, setSelectedCleaner] = useState<string>('')
  const [showCleanerSelection, setShowCleanerSelection] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    defaultValues: {
      duration: 2,
      city: 'London',
    },
  })

  const selectedServiceType = watch('service_type')
  const duration = watch('duration')

  useEffect(() => {
    if (user && user.role === 'client') {
      loadClientProfile()
    }
  }, [user])

  const loadClientProfile = async () => {
    try {
      const profileData = await usersApi.getProfile()
      setClientProfile(profileData.client_profile)
      
      // Pre-populate special requirements from client profile
      if (profileData.client_profile?.special_requirements) {
        setSelectedRequirements(profileData.client_profile.special_requirements)
      }
    } catch (error) {
      console.error('Failed to load client profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const searchCleaners = async (postcode: string, serviceType: string) => {
    if (!postcode || !serviceType) return
    
    try {
      const cleanersData = await usersApi.searchCleaners({
        postcode,
        service_type: serviceType,
        radius_miles: 10,
        limit: 10
      })
      setAvailableCleaners(cleanersData.cleaners || [])
      setShowCleanerSelection(true)
    } catch (error) {
      console.error('Failed to search cleaners:', error)
    }
  }

  const calculatePrice = () => {
    if (!selectedServiceType || !duration) return 0
    const service = serviceTypes.find(s => s.value === selectedServiceType)
    if (!service) return 0
    
    let baseRate = service.price
    
    // Apply duration discounts
    if (duration >= 6) {
      baseRate *= 0.9 // 10% discount for 6+ hours
    } else if (duration >= 4) {
      baseRate *= 0.95 // 5% discount for 4+ hours
    }
    
    return baseRate * duration
  }

  const toggleRequirement = (requirement: string) => {
    setSelectedRequirements(prev => 
      prev.includes(requirement)
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    )
  }

  const onSubmit = async (data: BookingForm) => {
    if (!user || user.role !== 'client') {
      setError('You must be logged in as a client to book services.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await bookingsApi.createBooking({
        service_type: data.service_type,
        date: data.date,
        time: data.time,
        duration: data.duration,
        address: {
          line1: data.address_line1,
          line2: data.address_line2,
          city: data.city,
          postcode: data.postcode,
          country: 'UK',
        },
        instructions: data.instructions,
        special_requirements: selectedRequirements,
        notes: data.notes,
        preferred_cleaner_id: selectedCleaner || undefined,
      })
      
      // Redirect to payment page to complete booking with payment
      router.push(`/bookings/pay/${response.booking_id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
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
        <p className="text-gray-600">You must be logged in as a client to book services.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with glass effect */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-50"></div>
        <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 lg:p-8 border border-white/30">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 flex items-center">
            <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary-600" />
            Book a Cleaning Service
          </h1>
          <p className="text-secondary-600 mt-2 text-base sm:text-lg">
            Schedule your <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> cleaning service in London
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl"></div>
            <div className="relative bg-red-50/60 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {/* Service Type */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center">
                <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-600" />
                Service Type
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceTypes.map(service => (
              <label key={service.value} className="cursor-pointer">
                <input
                  {...register('service_type', { required: 'Please select a service type' })}
                  type="radio"
                  value={service.value}
                  className="sr-only"
                />
                <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                  selectedServiceType === service.value
                    ? 'border-primary-500/50 bg-primary-500/10 backdrop-blur-sm'
                    : 'border-white/20 bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-sm'
                }`}>
                  <h3 className="text-sm sm:text-base font-semibold text-secondary-900">{service.label}</h3>
                  <p className="text-xs sm:text-sm text-secondary-600">{service.description}</p>
                  <p className="text-base sm:text-lg font-bold text-primary-600 mt-2">£{service.price}/hour</p>
                </div>
              </label>
            ))}
              </div>
              {errors.service_type && (
                <p className="mt-2 text-sm text-red-600">{errors.service_type.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Date, Time, Duration */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-600" />
                Schedule
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Date</label>
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input-glass"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Time</label>
                  <input
                    {...register('time', { required: 'Time is required' })}
                    type="time"
                    className="form-input-glass"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Duration (hours)</label>
                  <select
                    {...register('duration', { required: 'Duration is required' })}
                    className="form-input-glass"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hour => (
                  <option key={hour} value={hour}>{hour} hour{hour > 1 ? 's' : ''}</option>
                ))}
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center">
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-600" />
                Service Address
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Address Line 1</label>
                <input
                  {...register('address_line1', { required: 'Address is required' })}
                  type="text"
                  className="form-input-glass"
                placeholder="Street address"
              />
              {errors.address_line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
              )}
            </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Address Line 2 (Optional)</label>
                <input
                  {...register('address_line2')}
                  type="text"
                  className="form-input-glass"
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">City</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className="form-input-glass"
                  placeholder="London"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-secondary-700 mb-2">Postcode</label>
                  <input
                    {...register('postcode', { 
                      required: 'Postcode is required',
                      pattern: {
                        value: /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i,
                        message: 'Please enter a valid UK postcode'
                      }
                    })}
                    type="text"
                    className="form-input-glass"
                  placeholder="SW1A 1AA"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">Special Requirements (Optional)</h2>
            </div>
            <div className="p-4 sm:p-6">
              {clientProfile?.special_requirements?.length > 0 && (
                <div className="mb-4 p-3 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl">
                  <p className="text-sm text-blue-700 mb-2">From your profile preferences:</p>
                  <div className="flex flex-wrap gap-2">
                    {clientProfile.special_requirements.map((req: string, idx: number) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-500/20 text-blue-700 backdrop-blur-sm rounded-full border border-blue-400/30">
                    {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialRequirements.map(requirement => (
                  <label key={requirement} className="flex items-center space-x-2 cursor-pointer p-2 bg-white/[0.06] backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/[0.08] transition-all">
                    <input
                      type="checkbox"
                      checked={selectedRequirements.includes(requirement)}
                      onChange={() => toggleRequirement(requirement)}
                      className="text-primary-600 focus:ring-primary-500 bg-white/10 border-white/20"
                    />
                    <span className="text-sm sm:text-base text-secondary-700">{requirement}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cleaner Selection */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-600" />
                  <span className="hidden sm:inline">Choose Your Cleaner (Optional)</span>
                  <span className="sm:hidden">Choose Cleaner</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const postcode = watch('postcode')
                    const serviceType = watch('service_type')
                    if (postcode && serviceType) {
                      searchCleaners(postcode, serviceType)
                    } else {
                      setError('Please fill in postcode and service type first to search for cleaners')
                    }
                  }}
                  className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Find Cleaners Near Me
                </button>
              </div>
          
          {showCleanerSelection && (
            <div className="space-y-4">
              {availableCleaners.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {availableCleaners.map((cleaner) => (
                      <label key={cleaner.uid} className="cursor-pointer">
                        <input
                          type="radio"
                          name="cleaner"
                          value={cleaner.uid}
                          checked={selectedCleaner === cleaner.uid}
                          onChange={(e) => setSelectedCleaner(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border-2 rounded-lg p-4 transition-colors ${
                          selectedCleaner === cleaner.uid
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {cleaner.profile?.first_name} {cleaner.profile?.last_name}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                {cleaner.cleaner_profile?.rating && (
                                  <span className="flex items-center text-sm text-gray-600">
                                    ⭐ {cleaner.cleaner_profile.rating.toFixed(1)}
                                  </span>
                                )}
                                {cleaner.cleaner_profile?.experience_years && (
                                  <span className="text-sm text-secondary-600">
                                    {cleaner.cleaner_profile.experience_years} years exp.
                                  </span>
                                )}
                                <span className="text-sm text-secondary-600">
                                  {cleaner.cleaner_profile?.total_jobs || 0} jobs completed
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {cleaner.profile?.bio || 'Professional cleaning service'}
                              </p>
                              {cleaner.cleaner_profile?.services_offered && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {cleaner.cleaner_profile.services_offered.slice(0, 3).map((service: string, idx: number) => (
                                    <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                      {service}
                                    </span>
                                  ))}
                                  {cleaner.cleaner_profile.services_offered.length > 3 && (
                                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                      +{cleaner.cleaner_profile.services_offered.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-primary-600">
                                £{cleaner.cleaner_profile?.hourly_rate || 25}/hour
                              </p>
                              {cleaner.location?.distance && (
                                <p className="text-xs text-gray-500">
                                  {cleaner.location.distance} miles away
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCleaner('')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Let us assign any available cleaner
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No cleaners found in your area.</p>
                  <p className="text-sm mt-1">Don't worry, we'll find the best available cleaner for you!</p>
                </div>
              )}
            </div>
          )}
          
              {!showCleanerSelection && (
                <p className="text-secondary-500 text-base">
                  Click "Find Cleaners Near Me" to see available cleaners in your area, or leave this blank and we'll assign the best available cleaner.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions and Notes */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-transparent rounded-2xl"></div>
          <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/30">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-semibold text-secondary-900">Additional Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-2">Access Instructions (Optional)</label>
                <textarea
                  {...register('instructions')}
                  className="form-input-glass"
                rows={3}
                placeholder="How should the cleaner access your property? Gate codes, key location, etc."
                />
              </div>
              <div>
                <label className="block text-base font-medium text-secondary-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  className="form-input-glass"
                  rows={3}
                  placeholder="Any additional information or special requests"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {selectedServiceType && duration && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-lg"></div>
            <div className="relative bg-primary-500/10 backdrop-blur-xl rounded-2xl border border-primary-400/30 p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <CurrencyPoundIcon className="h-6 w-6 mr-2 text-primary-600" />
                Price Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-secondary-600">Service Type:</span>
                  <span className="font-medium text-secondary-900">
                  {serviceTypes.find(s => s.value === selectedServiceType)?.label}
                </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-secondary-600">Duration:</span>
                  <span className="font-medium text-secondary-900">{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-primary-400/30 pt-3 mt-3">
                  <span>Total:</span>
                  <span className="text-primary-600">£{calculatePrice().toFixed(2)}</span>
                </div>
                {duration >= 4 && (
                  <p className="text-sm text-green-600 flex items-center mt-2">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Discount applied for {duration >= 6 ? '6+' : '4+'} hour booking!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 text-sm sm:text-base font-normal rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"
          >
            {loading ? 'Creating Booking...' : 'Book Service'}
          </button>
        </div>
      </form>
    </div>
  )
}