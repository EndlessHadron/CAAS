'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { UserIcon, CalendarIcon, ArrowRightOnRectangleIcon, Bars3Icon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-700/30 sticky top-0 z-50 relative">
      {/* Premium overlay with subtle AI-tech feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-accent-500/5 to-primary-600/10 pointer-events-none"></div>
      <div className="container-centered relative">
        {/* Logo - Mobile: positioned left but with proper spacing, Desktop: centered */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 pointer-events-none z-10">
          <Link href="/" className="group pointer-events-auto">
            <img 
              src="/neatly_logo_resized.png" 
              alt="neatly - Premium Cleaning Services" 
              className="h-16 sm:h-20 md:h-32 lg:h-40 w-auto group-hover:scale-105 transition-all duration-300 mix-blend-screen opacity-90"
            />
          </Link>
        </div>

        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left side - Reserve space for mobile logo, Desktop navigation */}
          <div className="flex items-center space-x-6">
            {/* Mobile: Reserve space for logo (invisible spacer) */}
            <div className="w-24 md:hidden"></div>
            {/* Desktop: Empty left side - logo is centered */}
            <div className="hidden md:flex"></div>
          </div>

          {/* Right side - Mobile nav buttons + Desktop navigation */}
          <div className="flex items-center space-x-3">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center justify-end space-x-6">
              {isAuthenticated ? (
                <>
                  {user?.role === 'client' && (
                    <Link href="/client" className="nav-link flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {user?.role === 'cleaner' && (
                    <Link href="/cleaner" className="nav-link flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="nav-link flex items-center space-x-2">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-4 pl-4 border-l border-slate-600/60">
                    <Link href="/profile" className="nav-link flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-xl flex items-center justify-center border border-accent-400/30">
                        <UserIcon className="h-5 w-5 text-accent-300" />
                      </div>
                      <span className="max-w-32 truncate font-medium text-slate-200">{user?.profile?.first_name || user?.email}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-300 p-2 rounded-lg hover:bg-red-900/30"
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

            {/* Mobile navigation - sign in button + menu (positioned right) */}
            <div className="md:hidden flex items-center space-x-2">
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 hover:text-white text-sm font-medium rounded-lg transition-all duration-300 min-h-[40px] flex items-center"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Toggle mobile menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - improved touch targets */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-600/60 animate-slide-up bg-slate-800/50 backdrop-blur-lg">
            <div className="flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="nav-link py-4 min-h-[44px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'client' && (
                    <Link
                      href="/bookings"
                      className="nav-link flex items-center space-x-2 py-4 min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  )}
                  {user?.role === 'cleaner' && (
                    <Link
                      href="/jobs"
                      className="nav-link flex items-center space-x-2 py-4 min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>Available Jobs</span>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="nav-link flex items-center space-x-2 py-4 min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="nav-link flex items-center space-x-2 py-4 min-h-[44px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{user?.profile?.first_name || user?.email}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2 py-4 min-h-[44px]"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="nav-link py-4 min-h-[44px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary w-full text-center py-4 min-h-[44px] flex items-center justify-center"
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