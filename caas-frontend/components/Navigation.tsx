'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { UserIcon, CalendarIcon, ArrowRightOnRectangleIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <nav className="bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-700/30 sticky top-0 z-50 relative">
      {/* Premium overlay with subtle AI-tech feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-accent-500/5 to-primary-600/10 pointer-events-none"></div>
      <div className="container-centered relative">
        {/* Logo - Mobile: larger and positioned left, Desktop: centered unchanged */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 pointer-events-none z-10">
          <Link href="/" className="group pointer-events-auto">
            <img 
              src="/neatly_logo_resized.png" 
              alt="neatly - Premium Cleaning Services" 
              className="h-24 sm:h-28 md:h-32 lg:h-40 w-auto group-hover:scale-105 transition-all duration-300 mix-blend-screen opacity-90"
            />
          </Link>
        </div>

        <div className="flex items-center justify-between h-20 md:h-20">
          {/* Left side - Reserve space for mobile logo, Desktop navigation */}
          <div className="flex items-center space-x-6">
            {/* Mobile: Reserve space for larger logo (invisible spacer) */}
            <div className="w-32 sm:w-36 md:hidden"></div>
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
                  <Link href="/about" className="nav-link">
                    About Us
                  </Link>
                  <Link href="/auth/login" className="nav-link">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="btn-primary interactive-scale">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile navigation - direct buttons without hamburger menu */}
            <div className="md:hidden flex items-center space-x-1.5">
              {!isAuthenticated ? (
                // Not logged in: Show About Us + Sign In + Get Started buttons
                <>
                  <Link
                    href="/about"
                    className="px-2.5 py-2.5 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all duration-300 min-h-[40px] flex items-center whitespace-nowrap"
                  >
                    About
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-3 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-all duration-300 min-h-[40px] flex items-center whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-all duration-300 min-h-[40px] flex items-center whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                // Logged in: Show Dashboard button only
                <Link
                  href={user?.role === 'client' ? '/client' : user?.role === 'cleaner' ? '/cleaner' : user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-all duration-300 min-h-[40px] flex items-center whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Hidden since we use direct buttons */}
        {/* Removed mobile menu as we now use direct buttons in the header */}
      </div>
    </nav>
  )
}