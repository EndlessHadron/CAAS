'use client'

import { useState } from 'react'
import { 
  HomeIcon, 
  SparklesIcon, 
  CalendarIcon, 
  WrenchScrewdriverIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function DeepCleaningPage() {
  const [selectedSituation, setSelectedSituation] = useState(0)

  const situations = [
    {
      title: 'Moving In or Out',
      icon: HomeIcon,
      description: 'Start fresh in your new home or leave your old one spotless for the next occupants'
    },
    {
      title: 'Special Events',
      icon: SparklesIcon,
      description: 'Prepare for important gatherings, celebrations, or hosting guests with confidence'
    },
    {
      title: 'Seasonal Refresh',
      icon: CalendarIcon,
      description: 'Spring cleaning or seasonal deep cleans to maintain a healthy, fresh environment'
    },
    {
      title: 'Post-Construction',
      icon: WrenchScrewdriverIcon,
      description: 'Remove dust, debris, and construction residue after renovations or repairs'
    },
    {
      title: 'First-Time Service',
      icon: BeakerIcon,
      description: 'Establish a pristine baseline before starting regular cleaning services'
    },
    {
      title: 'Neglected Spaces',
      icon: CheckCircleIcon,
      description: 'Restore areas that haven\'t received proper attention in months or years'
    }
  ]

  const cleaningAreas = [
    {
      title: 'Kitchen Deep Clean',
      items: [
        'Inside oven cleaning and degreasing',
        'Refrigerator interior and exterior cleaning',
        'Microwave deep clean and sanitization',
        'Cabinet fronts and inside cleaning',
        'Dishwasher cleaning and descaling',
        'Tile grout scrubbing and sealing',
        'Light fixtures and ceiling fan cleaning',
        'Behind and under appliances cleaning'
      ]
    },
    {
      title: 'Bathroom Intensive',
      items: [
        'Grout deep cleaning and mold removal',
        'Shower door descaling and polishing',
        'Toilet deep sanitization including base',
        'Exhaust fan cleaning and dust removal',
        'Medicine cabinet organization and cleaning',
        'Bathtub deep scrub and drain cleaning',
        'Wall tiles and fixtures polishing',
        'Under-sink cabinet deep cleaning'
      ]
    },
    {
      title: 'Living Areas & Bedrooms',
      items: [
        'Baseboards and crown molding cleaning',
        'Window cleaning inside and sills',
        'Carpet deep cleaning and spot treatment',
        'Upholstery vacuuming and spot cleaning',
        'Light switches and outlet cleaning',
        'Door frames and handles sanitization',
        'Under furniture and bed deep cleaning',
        'Wardrobe exterior and top dusting'
      ]
    },
    {
      title: 'Additional Areas',
      items: [
        'Hallway and entrance deep cleaning',
        'Staircase detailed cleaning including railings',
        'Air vent and register cleaning',
        'Ceiling cobweb removal throughout',
        'Radiator deep cleaning and dusting',
        'Skirting board detailed cleaning',
        'Light fixture and lampshade cleaning',
        'Waste bin deep cleaning and sanitization'
      ]
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-accent-400/15 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-96 right-1/3 w-80 h-80 bg-gradient-to-bl from-accent-500/12 to-primary-500/10 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-48 left-1/2 w-72 h-72 bg-gradient-to-tr from-primary-300/10 to-accent-300/12 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-md border border-primary-200/40 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-sm">
              <SparklesIcon className="h-3 md:h-4 w-3 md:w-4 mr-2" />
              Comprehensive Excellence
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Deep Cleaning Service
            </h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8 px-2 md:px-0">
              Transform your space with our comprehensive deep cleaning service. Our AI-selected 
              specialists tackle every corner, delivering a level of cleanliness that goes beyond 
              the surface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a href="/auth/register" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Book Deep Cleaning
              </a>
              <a href="/how-it-works" className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* When You Need Deep Cleaning - Interactive */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
              Perfect For Life's Important Moments
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {situations.map((situation, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSituation(idx)}
                  className={`relative group text-left ${
                    selectedSituation === idx ? 'ring-2 ring-primary-500 scale-105' : ''
                  }`}
                >
                  {/* Glass effect container */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                    selectedSituation === idx 
                      ? 'from-primary-500/30 to-accent-500/30' 
                      : 'from-primary-500/10 to-accent-500/10'
                  } rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className={`relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border ${
                    selectedSituation === idx 
                      ? 'border-primary-400/60' 
                      : 'border-white/30 hover:border-white/40'
                  } transition-all duration-300`}>
                    <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${
                      selectedSituation === idx 
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500' 
                        : 'bg-primary-100'
                    } rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <situation.icon className={`h-6 w-6 ${
                        selectedSituation === idx ? 'text-white' : 'text-primary-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{situation.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        {situation.description}
                      </p>
                    </div>
                  </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 text-center">
              Every Detail, Meticulously Cleaned
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 text-center max-w-3xl mx-auto px-2 md:px-0">
              Our deep cleaning service goes beyond regular maintenance, addressing areas 
              often overlooked in routine cleaning. Every surface, every corner, every detail.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {cleaningAreas.map((area, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    {area.title}
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

      {/* Process - Interactive Steps */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
              Our Intelligent Deep Cleaning Process
            </h2>
            
            <div className="space-y-8">
              {[
                {
                  title: 'AI Assessment',
                  description: 'Our AI analyzes your space requirements, identifying high-priority areas and estimating the time needed for thorough cleaning based on similar properties.'
                },
                {
                  title: 'Specialist Matching',
                  description: 'We match you with cleaners who specialize in deep cleaning, have experience with your property type, and carry the right equipment for intensive cleaning.'
                },
                {
                  title: 'Systematic Execution',
                  description: 'Our professionals follow AI-optimized cleaning sequences, ensuring no area is missed while maximizing efficiency. Real-time updates keep you informed.'
                },
                {
                  title: 'Quality Verification',
                  description: 'Post-cleaning, our AI-powered quality check ensures every item on the deep cleaning checklist is completed to our exacting standards.'
                }
              ].map((step, idx) => (
                <div key={idx} className="relative group hover:scale-[1.01] transition-transform">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm md:text-base text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Duration & Pricing - Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              Investment in Your Space
            </h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {[
                { size: 'Studio/1 Bed', duration: '4-6 hours', description: 'Comprehensive coverage of compact spaces' },
                { size: '2-3 Bed', duration: '6-8 hours', description: 'Full deep clean of family homes' },
                { size: '4+ Bed', duration: '8+ hours', description: 'Complete transformation of larger properties' }
              ].map((option, idx) => (
                <div key={idx} className="relative group hover:scale-105 transition-transform">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{option.size}</h3>
                  <p className="text-2xl md:text-3xl font-bold text-primary-600 mb-2">{option.duration}</p>
                  <p className="text-xs md:text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-70"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-8 border border-white/30">
              <p className="text-base md:text-xl text-gray-600 mb-2">
                Starting from <span className="text-2xl md:text-3xl font-bold text-primary-600">£35</span> per hour
              </p>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2 md:px-0">
                Our AI provides accurate quotes based on your specific requirements. Deep cleaning 
                is an investment in your health, comfort, and property value.
              </p>
              
              <a href="/auth/register" className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Schedule Your Deep Clean
                <ArrowRightIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: ShieldCheckIcon, title: 'Fully Insured', desc: 'Complete coverage for your peace of mind' },
                { icon: CheckCircleIcon, title: 'Satisfaction Guaranteed', desc: 'We\'re not done until you\'re happy' },
                { icon: ClockIcon, title: 'Flexible Timing', desc: 'Work around your schedule' }
              ].map((benefit, idx) => (
                <div key={idx} className="relative text-center group hover:scale-105 transition-transform">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}