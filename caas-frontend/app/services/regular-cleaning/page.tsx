'use client'

import { useState } from 'react'
import { CheckIcon, ClockIcon, CalendarIcon, SparklesIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function RegularCleaningPage() {
  const [selectedFrequency, setSelectedFrequency] = useState('weekly')

  const frequencies = [
    { id: 'weekly', name: 'Weekly', description: 'Perfect for busy households', discount: '10%' },
    { id: 'biweekly', name: 'Bi-Weekly', description: 'Great balance', discount: '5%' },
    { id: 'monthly', name: 'Monthly', description: 'Light touch maintenance', discount: '0%' }
  ]

  const areas = [
    { name: 'Living Areas', items: ['Dusting all surfaces', 'Vacuuming carpets', 'Mopping floors', 'Cleaning mirrors', 'Emptying bins'] },
    { name: 'Kitchen', items: ['Cleaning countertops', 'Wiping appliances', 'Cleaning sink', 'Mopping floors', 'Cleaning hob'] },
    { name: 'Bathrooms', items: ['Sanitizing surfaces', 'Cleaning sinks', 'Polishing mirrors', 'Mopping floors', 'Removing limescale'] },
    { name: 'Bedrooms', items: ['Making beds', 'Dusting surfaces', 'Vacuuming floors', 'Organizing areas', 'Cleaning mirrors'] }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-32 left-16 w-96 h-96 bg-gradient-to-br from-primary-400/15 to-accent-400/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-32 right-24 w-80 h-80 bg-gradient-to-bl from-accent-500/15 to-primary-500/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-tr from-primary-300/15 to-accent-300/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-md border border-primary-200/40 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-6 md:mb-8">
              <CalendarIcon className="h-3 md:h-4 w-3 md:w-4 mr-2" />
              Scheduled Excellence
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">Regular Cleaning Service</h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8 px-2 md:px-0">
              Maintain a consistently pristine home with our intelligent regular cleaning service. 
              Let our AI-matched professionals handle the cleaning while you focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a href="/auth/register" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">Book Regular Cleaning</a>
              <a href="/how-it-works" className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">Learn How It Works</a>
            </div>
          </div>
        </div>
      </section>

      {/* Frequency Selection - Glass Effect */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Choose Your Perfect Schedule</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {frequencies.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`relative group ${
                    selectedFrequency === freq.id ? 'scale-105' : ''
                  }`}
                >
                  {/* Glass effect container */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                    selectedFrequency === freq.id 
                      ? 'from-primary-500/30 to-accent-500/30' 
                      : 'from-primary-500/10 to-accent-500/10'
                  } rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className={`relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border ${
                    selectedFrequency === freq.id 
                      ? 'border-primary-400/60' 
                      : 'border-white/30 hover:border-white/40'
                  } transition-all duration-300 text-left`}>
                    {freq.discount !== '0%' && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        Save {freq.discount}
                      </div>
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{freq.name}</h3>
                    <p className="text-sm md:text-base text-gray-600">{freq.description}</p>
                    {selectedFrequency === freq.id && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <CheckIcon className="h-5 w-5 text-primary-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Glass Effect */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">Comprehensive Cleaning, Every Time</h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {areas.map((area, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg flex items-center justify-center mr-3">
                        <CheckIcon className="h-4 w-4 text-primary-600" />
                      </div>
                      {area.name}
                    </h3>
                    <ul className="space-y-2 text-sm md:text-base text-gray-600">
                      {area.items.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-primary-500 mr-2">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Glass Effect */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">Why Choose Our Regular Service</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: SparklesIcon, title: 'AI-Matched Pros', desc: 'Same trusted cleaner who knows your preferences' },
                { icon: ClockIcon, title: 'Flexible Scheduling', desc: 'Easy rescheduling through our intelligent system' },
                { icon: ShieldCheckIcon, title: 'Quality Guaranteed', desc: 'Consistent excellence monitored by AI' }
              ].map((benefit, idx) => (
                <div key={idx} className="relative group hover:scale-105 transition-transform">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <benefit.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-gray-900">{benefit.title}</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA - Glass Effect */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-70"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/30 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Simple, Transparent Pricing</h2>
                <p className="text-base md:text-xl text-gray-600 mb-2">
                  Starting from <span className="text-2xl md:text-3xl font-bold text-primary-600">£25</span> per hour
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2 md:px-0">
                  Our AI calculates exact pricing based on your home size. Regular bookings receive automatic loyalty discounts.
                </p>
                <a href="/auth/register" className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all">
                  Get Your Personalized Quote
                  <ArrowRightIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}