'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useForm } from 'react-hook-form'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    try {
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow">
        <div className="card max-w-md mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-body">
              Sign in to access your CAAS account
            </p>
          </div>
        
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
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
                  className={errors.email ? 'form-input-error' : 'form-input'}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
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
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className={errors.password ? 'form-input-error' : 'form-input'}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full relative"
              >
                {loading && (
                  <div className="loading-spinner absolute left-4"></div>
                )}
                <span className={loading ? 'ml-6' : ''}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
              <Link
                href="/auth/register"
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}