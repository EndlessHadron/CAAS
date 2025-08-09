'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Redirect based on user role
    if (user?.role === 'admin') {
      router.push('/admin')
    } else if (user?.role === 'client') {
      router.push('/client')
    } else if (user?.role === 'cleaner') {
      router.push('/cleaner')
    } else {
      // Default fallback
      router.push('/client')
    }
  }, [isAuthenticated, user, router, loading])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}