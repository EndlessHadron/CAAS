'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useForm } from 'react-hook-form'
import { bookingsApi } from '@/lib/api-client'

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
  const [error, setError] = useState('')
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
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
      await bookingsApi.createBooking({
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
      })
      
      router.push('/bookings?success=1')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book a Cleaning Service</h1>
        <p className="text-gray-600 mt-2">
          Fill out the form below to schedule your cleaning service in London.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Service Type */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceTypes.map(service => (
              <label key={service.value} className="cursor-pointer">
                <input
                  {...register('service_type', { required: 'Please select a service type' })}
                  type="radio"
                  value={service.value}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 transition-colors ${
                  selectedServiceType === service.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <h3 className="font-semibold text-gray-900">{service.label}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <p className="text-lg font-bold text-primary-600 mt-2">£{service.price}/hour</p>
                </div>
              </label>
            ))}
          </div>
          {errors.service_type && (
            <p className="mt-2 text-sm text-red-600">{errors.service_type.message}</p>
          )}
        </div>

        {/* Date, Time, Duration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Date</label>
              <input
                {...register('date', { required: 'Date is required' })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Time</label>
              <input
                {...register('time', { required: 'Time is required' })}
                type="time"
                className="form-input"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Duration (hours)</label>
              <select
                {...register('duration', { required: 'Duration is required' })}
                className="form-input"
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

        {/* Address */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Address</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Address Line 1</label>
              <input
                {...register('address_line1', { required: 'Address is required' })}
                type="text"
                className="form-input"
                placeholder="Street address"
              />
              {errors.address_line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Address Line 2 (Optional)</label>
              <input
                {...register('address_line2')}
                type="text"
                className="form-input"
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">City</label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="form-input"
                  placeholder="London"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">Postcode</label>
                <input
                  {...register('postcode', { 
                    required: 'Postcode is required',
                    pattern: {
                      value: /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i,
                      message: 'Please enter a valid UK postcode'
                    }
                  })}
                  type="text"
                  className="form-input"
                  placeholder="SW1A 1AA"
                />
                {errors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Requirements (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {specialRequirements.map(requirement => (
              <label key={requirement} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRequirements.includes(requirement)}
                  onChange={() => toggleRequirement(requirement)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">{requirement}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Instructions and Notes */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Access Instructions (Optional)</label>
              <textarea
                {...register('instructions')}
                className="form-input"
                rows={3}
                placeholder="How should the cleaner access your property? Gate codes, key location, etc."
              />
            </div>
            <div>
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                {...register('notes')}
                className="form-input"
                rows={3}
                placeholder="Any additional information or special requests"
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {selectedServiceType && duration && (
          <div className="card bg-primary-50 border-primary-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service Type:</span>
                <span className="font-medium">
                  {serviceTypes.find(s => s.value === selectedServiceType)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-primary-200 pt-2">
                <span>Total:</span>
                <span className="text-primary-600">£{calculatePrice().toFixed(2)}</span>
              </div>
              {duration >= 4 && (
                <p className="text-sm text-green-600">
                  Discount applied for {duration >= 6 ? '6+' : '4+'} hour booking!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Booking...' : 'Book Service'}
          </button>
        </div>
      </form>
    </div>
  )
}