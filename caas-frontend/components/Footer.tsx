'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 relative z-20">
      {/* Main Footer Content */}
      <div className="container-centered py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start justify-items-center md:justify-items-start">
          
          {/* Company Info */}
          <div className="space-y-4 text-center md:text-left max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">n</span>
              </div>
              <h3 className="text-2xl font-bold text-white">neatly</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              London's premier on-demand cleaning service. Professional, trusted, and reliable 
              cleaning solutions for homes and businesses across the capital.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-accent-400" />
              <span>London, United Kingdom</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-white font-semibold text-lg">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/regular-cleaning" className="hover:text-accent-400 transition-colors">Regular Cleaning</Link></li>
              <li><Link href="/services/deep-cleaning" className="hover:text-accent-400 transition-colors">Deep Cleaning</Link></li>
              <li><Link href="/services/end-of-tenancy" className="hover:text-accent-400 transition-colors">End of Tenancy</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-white font-semibold text-lg">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-accent-400 transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-accent-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-white font-semibold text-lg">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-accent-400" />
                <a href="mailto:support@theneatlyapp.com" className="hover:text-accent-400 transition-colors">
                  support@theneatlyapp.com
                </a>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="pt-2">
              <div className="flex justify-center md:justify-start space-x-4">
                <div className="text-gray-400 hover:text-accent-400 transition-colors cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="text-gray-400 hover:text-accent-400 transition-colors cursor-pointer">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="text-gray-400 hover:text-accent-400 transition-colors cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C23.975 5.367 18.637.029 12.017.029zM18.68 16.678c0 1.14-.926 2.066-2.066 2.066H7.386c-1.14 0-2.066-.926-2.066-2.066V7.322c0-1.14.926-2.066 2.066-2.066h9.228c1.14 0 2.066.926 2.066 2.066v9.356z"/>
                    <circle cx="12.017" cy="12.017" r="3.708"/>
                    <circle cx="16.624" cy="7.41" r=".97"/>
                  </svg>
                </div>
                <div className="text-gray-400 hover:text-accent-400 transition-colors cursor-pointer">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Bar */}
      <div className="border-t border-gray-800">
        <div className="container-centered py-6 px-6">
          <div className="flex justify-center">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center items-center text-sm space-x-6">
              <Link href="/legal/privacy-policy" className="hover:text-accent-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="hover:text-accent-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/cookie-policy" className="hover:text-accent-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/legal/cancellation-policy" className="hover:text-accent-400 transition-colors">
                Cancellation Policy
              </Link>
              <Link href="/sitemap" className="hover:text-accent-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-centered py-4 px-6">
          <div className="text-center text-xs text-gray-500">
            <p>
              © {currentYear} neatly. All rights reserved.
            </p>
          </div>

          {/* Additional Legal Disclaimer */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-600 leading-relaxed">
            <p className="text-center">
              neatly is a technology platform that connects customers with independent cleaning contractors. 
              All cleaning services are provided by independent contractors who are not employees of neatly. 
              Prices displayed are indicative and may vary based on specific requirements. 
              All bookings are subject to availability and our Terms of Service.
            </p>
            <div className="flex flex-wrap justify-center items-center mt-3 space-x-4 text-xs">
              <a href="mailto:support@theneatlyapp.com" className="hover:text-accent-400 transition-colors flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                Report Security Issue
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}