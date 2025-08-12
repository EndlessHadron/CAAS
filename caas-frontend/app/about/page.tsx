'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronRightIcon, SparklesIcon, CpuChipIcon, ShieldCheckIcon, BoltIcon, BeakerIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  const [activeVision, setActiveVision] = useState(0)

  const visionPoints = [
    {
      title: 'Intelligent Matching',
      description: 'Our AI analyzes hundreds of factors to pair you with the perfect cleaner for your specific needs and preferences.',
      icon: CpuChipIcon,
    },
    {
      title: 'Predictive Scheduling',
      description: 'Machine learning anticipates when you\'ll need service, suggesting bookings before you even think to ask.',
      icon: BoltIcon,
    },
    {
      title: 'Quality Evolution',
      description: 'Every interaction teaches our system, creating a feedback loop that continuously elevates service quality.',
      icon: SparklesIcon,
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-32 left-16 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-accent-400/15 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-64 right-24 w-80 h-80 bg-gradient-to-bl from-accent-500/12 to-primary-500/10 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-tr from-primary-300/10 to-accent-300/12 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-md border border-primary-200/40 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-sm">
              <BeakerIcon className="h-3 md:h-4 w-3 md:w-4 mr-2" />
              Innovation Lab
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Reimagining Service Excellence Through AI
            </h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed px-2 md:px-0">
              At neatly, we're building the future of home services—where artificial intelligence 
              doesn't replace human connection, but amplifies it to create experiences that were 
              never before possible.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section - Interactive */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                  Our Vision: AI That Understands You
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                  We believe the true potential of AI isn't in automation alone—it's in creating 
                  deeply personalized experiences that adapt and evolve with every interaction. 
                  Our platform learns your preferences, anticipates your needs, and continuously 
                  improves to deliver service that feels almost telepathic.
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
                  Imagine a cleaning service that remembers you prefer eco-friendly products, 
                  knows your pet's favorite hiding spots, and automatically adjusts scheduling 
                  around your life's rhythms. This isn't the distant future—it's what we're 
                  building today.
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {visionPoints.map((point, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveVision(index)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                        activeVision === index
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {point.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="card-interactive group">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {visionPoints[activeVision].icon && 
                        React.createElement(visionPoints[activeVision].icon, { className: "h-6 w-6 text-white" })
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {visionPoints[activeVision].title}
                      </h3>
                      <p className="text-gray-600">
                        {visionPoints[activeVision].description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">AI Confidence Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                            style={{width: `${85 + activeVision * 5}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{85 + activeVision * 5}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Philosophy */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Technology With Purpose
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2 md:px-0">
                We're not just digitizing an old industry—we're fundamentally rethinking 
                how services should work in an intelligent, connected world.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div className="card-interactive group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <RocketLaunchIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Empowering Professionals
                  </h3>
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  Our AI doesn't replace cleaners—it empowers them with intelligent routing, 
                  automated admin tasks, and insights that help them deliver exceptional service 
                  while building thriving businesses.
                </p>
              </div>
              <div className="card-interactive group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <BeakerIcon className="h-5 w-5 text-accent-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Transparent Intelligence
                  </h3>
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  We believe AI should be explainable. You'll always understand why we make 
                  recommendations, how we match you with cleaners, and what data drives our decisions.
                </p>
              </div>
              <div className="card-interactive group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Privacy-First Design
                  </h3>
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  Advanced encryption and privacy-preserving AI techniques ensure your data 
                  is used to improve your experience—and nothing else. Your trust is our 
                  foundation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision - Interactive Timeline */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
              The Future We're Building
            </h2>
            <div className="card-interactive mb-6 md:mb-8">
              <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                We envision a world where booking any home service is as intuitive as having 
                a conversation with a trusted friend. Where AI orchestrates perfect experiences 
                behind the scenes, while humans focus on what they do best—genuine care and 
                craftsmanship.
              </p>
              <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-primary-50/50 to-accent-50/50 backdrop-blur-sm p-4 rounded-lg border border-primary-200/40">
                  <h4 className="font-semibold text-gray-900 mb-2">Today</h4>
                  <p className="text-sm text-gray-600">
                    Starting with cleaning services in London, learning from every interaction
                  </p>
                </div>
                <div className="bg-gradient-to-br from-accent-50/50 to-primary-50/50 backdrop-blur-sm p-4 rounded-lg border border-accent-200/40">
                  <h4 className="font-semibold text-gray-900 mb-2">Tomorrow</h4>
                  <p className="text-sm text-gray-600">
                    Transforming all service delivery globally with intelligent orchestration
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Join Us in Shaping Tomorrow
                </h3>
                <p className="text-base md:text-lg mb-4 md:mb-6 text-gray-600 max-w-2xl px-2 md:px-0">
                  Whether you're a customer seeking effortless service or a professional ready 
                  to grow your business with AI, you're not just using a platform—you're 
                  pioneering the future of the service economy.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a 
                    href="/auth/register" 
                    className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Get Started Today
                    <ChevronRightIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
                  </a>
                  <a 
                    href="/how-it-works" 
                    className="inline-flex items-center bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:border-primary-400 hover:bg-white/90 transition-all duration-300"
                  >
                    See How It Works
                    <ChevronRightIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-interactive">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                Built by Innovators, For Everyone
              </h2>
              <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6 px-2 md:px-0">
                Our team is passionate about leveraging technology to transform 
                the cleaning industry. We're constantly exploring new ways to make 
                home services more efficient and accessible.
              </p>
              <div className="flex justify-center space-x-4 md:space-x-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600">Growing</div>
                  <div className="text-xs md:text-sm text-gray-500">Team Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-accent-600">Always</div>
                  <div className="text-xs md:text-sm text-gray-500">Innovating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-xs md:text-sm text-gray-500">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}