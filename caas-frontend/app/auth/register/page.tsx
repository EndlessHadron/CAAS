'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { EyeIcon, EyeSlashIcon, UserGroupIcon, BriefcaseIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'client'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        role: formData.role as 'client' | 'cleaner',
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || undefined
      })
      
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Premium glass card with texture matching login page */}
        <div className="relative">
          {/* Soft ambient glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-[2rem] blur-xl opacity-70"></div>
          
          {/* Main glass card with frosted texture */}
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Glass texture layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.18] via-white/[0.12] to-white/[0.08]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] via-white/[0.10] to-white/[0.15]"></div>
            
            {/* Noise texture for realistic glass */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-screen">
              <svg width="100%" height="100%">
                <filter id="noiseFilter">
                  <feTurbulence type="turbulence" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
              </svg>
            </div>
            
            {/* Main content container */}
            <div className="relative bg-white/[0.08] backdrop-blur-xl p-10 border border-white/30">
              {/* Top edge highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mb-4 shadow-lg">
                    <SparklesIcon className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-3xl font-semibold text-secondary-900">Create your account</h1>
                  <p className="text-secondary-600 mt-2 text-base">Join <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span> to start booking cleanings</p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-3 bg-error-50/60 backdrop-blur-sm border border-error-200/50 rounded-xl">
                    <p className="text-sm text-error-600 text-center">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      I want to...
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'client'})}
                        className={`p-4 rounded-xl border-2 transition-all backdrop-blur-sm min-h-[60px] sm:min-h-[80px] ${
                          formData.role === 'client'
                            ? 'border-primary-500/50 bg-primary-50/40'
                            : 'border-secondary-200/30 hover:border-secondary-300/50 bg-white/10'
                        }`}
                      >
                        <UserGroupIcon className={`h-6 w-6 mx-auto mb-2 ${
                          formData.role === 'client' ? 'text-primary-600' : 'text-secondary-500'
                        }`} />
                        <div className={`text-base font-medium ${
                          formData.role === 'client' ? 'text-primary-900' : 'text-secondary-700'
                        }`}>Book Cleaning</div>
                        <div className="text-sm text-secondary-500 mt-1">I need a cleaner</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'cleaner'})}
                        className={`p-4 rounded-xl border-2 transition-all backdrop-blur-sm min-h-[60px] sm:min-h-[80px] ${
                          formData.role === 'cleaner'
                            ? 'border-primary-500/50 bg-primary-50/40'
                            : 'border-secondary-200/30 hover:border-secondary-300/50 bg-white/10'
                        }`}
                      >
                        <BriefcaseIcon className={`h-6 w-6 mx-auto mb-2 ${
                          formData.role === 'cleaner' ? 'text-primary-600' : 'text-secondary-500'
                        }`} />
                        <div className={`text-base font-medium ${
                          formData.role === 'cleaner' ? 'text-primary-900' : 'text-secondary-700'
                        }`}>Offer Services</div>
                        <div className="text-sm text-secondary-500 mt-1">I want to clean</div>
                      </button>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-base font-medium text-secondary-700 mb-2">
                        First name
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input-glass"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-secondary-700 mb-2">
                        Last name
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input-glass"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      Email address
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input-glass"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      Phone number <span className="text-secondary-400">(optional)</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input-glass"
                      placeholder="+44 20 1234 5678"
                      autoComplete="tel"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-base font-medium text-secondary-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input-glass pr-10"
                          placeholder="••••••"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors p-1"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-secondary-700 mb-2">
                        Confirm
                      </label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-input-glass pr-10"
                          placeholder="••••••"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors p-1"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-white/20 rounded mt-0.5 bg-white/10"
                    />
                    <label htmlFor="terms" className="ml-2 block text-base text-secondary-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit button - exactly like landing page */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Creating account...' : (formData.role === 'client' ? 'Start booking' : 'Start earning')}
                  </button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-secondary-200/30"></div>
                    </div>
                    <div className="relative flex justify-center text-base">
                      <span className="px-2 bg-white/[0.02] text-secondary-500">Already have an account?</span>
                    </div>
                  </div>
                </div>

                {/* Login link - glass button style */}
                <div className="mt-6">
                  <Link 
                    href="/auth/login" 
                    className="w-full block text-center bg-white/[0.08] hover:bg-white/[0.12] text-secondary-700 font-normal py-3 px-6 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40 hover:scale-[1.02] active:scale-95"
                  >
                    Sign in instead
                  </Link>
                </div>
              </div>
              
              {/* Bottom edge highlight */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}