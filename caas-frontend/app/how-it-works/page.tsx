'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleBottomCenterTextIcon, 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  SparklesIcon,
  ChartBarIcon,
  CloudIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Tell Us What You Need',
      icon: ChatBubbleBottomCenterTextIcon,
      color: 'from-primary-500 to-accent-500',
      features: [
        'Natural language processing understands your preferences',
        'Pattern recognition identifies unstated needs',
        'Contextual learning remembers past interactions',
        'Preference modeling builds your unique profile'
      ]
    },
    {
      title: 'AI Finds Your Perfect Match',
      icon: MagnifyingGlassIcon,
      color: 'from-accent-500 to-primary-500',
      features: [
        'Skill alignment matching expertise to needs',
        'Availability optimization for perfect timing',
        'Proximity intelligence reducing travel time',
        'Performance scoring selecting top professionals'
      ]
    },
    {
      title: 'Seamless Booking & Scheduling',
      icon: CalendarDaysIcon,
      color: 'from-primary-500 to-accent-500',
      features: [
        'Traffic pattern analysis for accurate arrivals',
        'Weather-based scheduling recommendations',
        'Automatic conflict resolution and rescheduling',
        'Proactive service reminders and suggestions'
      ]
    },
    {
      title: 'Service That Evolves',
      icon: SparklesIcon,
      color: 'from-accent-500 to-primary-500',
      features: [
        'Every clean improves our understanding',
        'Your input shapes future experiences',
        'Identifying what works best for you',
        'Anticipating future needs automatically'
      ]
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/8 to-accent-400/12 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-64 right-1/3 w-80 h-80 bg-gradient-to-bl from-accent-500/10 to-primary-500/8 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/2 w-72 h-72 bg-gradient-to-tr from-primary-300/8 to-accent-300/10 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-md border border-primary-200/40 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-sm">
              <BoltIcon className="h-3 md:h-4 w-3 md:w-4 mr-2" />
              Powered by Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Intelligence Meets Simplicity
            </h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed px-2 md:px-0">
              Behind every seamless booking lies sophisticated AI orchestration. 
              Here's how we transform complex technology into effortless experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Process Steps */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Step Selector */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`group relative px-3 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-base font-medium transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg scale-105'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-primary-300 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <step.icon className="h-4 md:h-5 w-4 md:w-5" />
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.title.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  {activeStep === index && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Progress Timeline */}
            <div className="relative h-2 mb-8">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
              {/* Step dots */}
              <div className="absolute inset-0 flex justify-between">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      index <= activeStep
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 scale-110'
                        : 'bg-gray-300'
                    }`}
                    style={{ transform: 'translateY(-25%)' }}
                  />
                ))}
              </div>
            </div>

            {/* Active Step Content */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="card-interactive">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${steps[activeStep].color} text-white rounded-2xl flex items-center justify-center mr-4`}>
                      <span className="text-2xl font-bold">{activeStep + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {steps[activeStep].title}
                      </h2>
                      <p className="text-sm md:text-base text-gray-500">Step {activeStep + 1} of 4</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {steps[activeStep].features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                        </div>
                        <p className="text-sm md:text-base text-gray-600">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">AI Processing Power</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000"
                            style={{width: `${75 + (activeStep * 5)}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{75 + (activeStep * 5)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="relative">
                  <div className="card-interactive">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Live Intelligence Metrics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Pattern Recognition</span>
                          <span className="text-gray-900 font-medium">{90 + activeStep * 2}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                            style={{width: `${90 + activeStep * 2}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Match Accuracy</span>
                          <span className="text-gray-900 font-medium">{85 + activeStep * 3}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-accent-500 to-primary-500 rounded-full transition-all duration-700"
                            style={{width: `${85 + activeStep * 3}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Learning Progress</span>
                          <span className="text-gray-900 font-medium">{88 + activeStep * 2}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                            style={{width: `${88 + activeStep * 2}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-xl animate-pulse-soft"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-xl animate-pulse-soft" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                The Intelligence Advantage
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2 md:px-0">
                Our AI doesn't just make booking easier—it fundamentally transforms 
                what's possible in service delivery.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="card-compact group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <ChartBarIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    Precision Matching
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  99.2% customer satisfaction through intelligent pairing algorithms
                </p>
              </div>
              
              <div className="card-compact group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                    <BoltIcon className="h-5 w-5 text-accent-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    Time Optimization
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Save 30 minutes per booking with automated scheduling
                </p>
              </div>
              
              <div className="card-compact group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <SparklesIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    Quality Assurance
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  AI-powered quality checks ensure consistent excellence
                </p>
              </div>
              
              <div className="card-compact group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <CloudIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    Predictive Service
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  Anticipate needs before they become urgent
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-interactive">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                Experience the Future Today
              </h2>
              <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto px-2 md:px-0">
                Join thousands of Londoners who've discovered how AI can transform 
                mundane tasks into delightful experiences. Your perfectly clean home 
                is just one intelligent booking away.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <a 
                  href="/auth/register" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Intelligent Journey
                  <ArrowPathIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
                </a>
                <a 
                  href="/services" 
                  className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:border-primary-400 transition-all duration-300"
                >
                  Explore Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}