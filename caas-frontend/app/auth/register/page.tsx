'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useForm } from 'react-hook-form'
import { SparklesIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  phone: string
  role: 'client' | 'cleaner'
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register: registerUser } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'client',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        role: data.role,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow">
        <div className="card max-w-lg mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Join CAAS Today
            </h2>
            <p className="text-body">
              Create your account and start your cleaning journey
            </p>
          </div>
        
          {/* Role Selection Cards */}
          <div className="mb-8">
            <p className="form-label text-center mb-4">I want to:</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  {...register('role', { required: 'Please select your role' })}
                  type="radio"
                  value="client"
                  className="sr-only"
                />
                <div className={`card-compact text-center transition-all duration-200 ${
                  watch('role') === 'client' 
                    ? 'ring-2 ring-primary-300 bg-primary-50 border-primary-200' 
                    : 'hover:border-secondary-300'
                }`}>
                  <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-medium text-secondary-900 mb-1">Book Services</h3>
                  <p className="text-sm text-secondary-600">Find cleaning professionals</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  {...register('role', { required: 'Please select your role' })}
                  type="radio"
                  value="cleaner"
                  className="sr-only"
                />
                <div className={`card-compact text-center transition-all duration-200 ${
                  watch('role') === 'cleaner' 
                    ? 'ring-2 ring-primary-300 bg-primary-50 border-primary-200' 
                    : 'hover:border-secondary-300'
                }`}>
                  <StarIcon className="h-8 w-8 text-accent-600 mx-auto mb-3" />
                  <h3 className="font-medium text-secondary-900 mb-1">Provide Services</h3>
                  <p className="text-sm text-secondary-600">Join as a cleaner</p>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="form-error text-center mt-2">{errors.role.message}</p>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-5">

            <div>
              <label htmlFor="full_name" className="form-label">
                Full Name
              </label>
              <input
                {...register('full_name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                type="text"
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: 'Invalid phone number',
                  },
                })}
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
                type="password"
                className="form-input"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type="password"
                className="form-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}