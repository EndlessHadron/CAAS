'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { UserIcon, CalendarIcon, ArrowRightOnRectangleIcon, Bars3Icon, SparklesIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-soft border-b border-secondary-100 sticky top-0 z-50">
      <div className="container-centered">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              CAAS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {user?.role === 'client' && (
                  <Link href="/bookings" className="nav-link flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                )}
                {user?.role === 'cleaner' && (
                  <Link href="/jobs" className="nav-link flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Available Jobs</span>
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="flex items-center space-x-4 pl-4 border-l border-secondary-200">
                  <Link href="/profile" className="nav-link flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="max-w-32 truncate">{user?.full_name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-secondary-500 hover:text-error-600 transition-colors duration-200 p-2 rounded-lg hover:bg-error-50"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-link">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary interactive-scale">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-100 animate-slide-up">
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="nav-link py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'client' && (
                    <Link
                      href="/bookings"
                      className="nav-link flex items-center space-x-2 py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  )}
                  {user?.role === 'cleaner' && (
                    <Link
                      href="/jobs"
                      className="nav-link flex items-center space-x-2 py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>Available Jobs</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="nav-link flex items-center space-x-2 py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{user?.full_name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-error-600 hover:text-error-700 transition-colors flex items-center space-x-2 py-3"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="nav-link py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary w-full text-center py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}