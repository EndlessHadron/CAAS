'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('from') || null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      
      // Check if there's a return URL
      if (returnUrl) {
        router.push(returnUrl)
      } else if (user?.role) {
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/admin')
        } else if (user.role === 'client') {
          router.push('/client')
        } else if (user.role === 'cleaner') {
          router.push('/cleaner')
        } else {
          router.push('/')
        }
      } else {
        // Fallback if no user data - just go to home
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Premium glass card with texture */}
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
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mb-4 shadow-lg">
                    <SparklesIcon className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-3xl font-semibold text-secondary-900">
                    Welcome back
                  </h1>
                  <p className="text-secondary-600 mt-2 text-base">Sign in to continue to <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent font-medium">neatly</span></p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-3 bg-error-50/60 backdrop-blur-sm border border-error-200/50 rounded-xl">
                    <p className="text-sm text-error-600 text-center">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input-glass"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-secondary-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input-glass pr-12"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-white/20 rounded bg-white/10"
                      />
                      <span className="ml-2 text-base text-secondary-700">Remember me</span>
                    </label>
                  </div>

                  {/* Primary button exactly like landing page */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-secondary-200/30"></div>
                    </div>
                    <div className="relative flex justify-center text-base">
                      <span className="px-2 bg-white/[0.02] text-secondary-500">or</span>
                    </div>
                  </div>
                </div>

                {/* Google sign in with same style as secondary button */}
                <button
                  type="button"
                  className="btn-secondary w-full mt-6 flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Register link */}
                <div className="mt-6 text-center">
                  <p className="text-base text-secondary-600">
                    Don't have an account?{' '}
                    <Link 
                      href="/auth/register" 
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}