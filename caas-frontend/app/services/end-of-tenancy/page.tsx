'use client'

import { useState } from 'react'
import { 
  HomeModernIcon,
  DocumentCheckIcon,
  TrophyIcon,
  BoltIcon,
  CurrencyPoundIcon,
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  WindowIcon,
  HomeIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function EndOfTenancyPage() {
  const [selectedArea, setSelectedArea] = useState(0)

  const cleaningAreas = [
    {
      title: 'Kitchen Excellence',
      items: [
        'Oven deep clean including racks and glass',
        'Hob degreasing and burner cap cleaning',
        'Extractor fan filter cleaning or replacement',
        'Fridge/freezer defrost and sanitization',
        'Dishwasher filter and seal cleaning',
        'All cupboards inside and out',
        'Sink descaling and tap polishing',
        'Washing machine drawer and seal cleaning',
        'Kitchen tiles and grout restoration',
        'Kickboards and plinths cleaning'
      ]
    },
    {
      title: 'Bathroom Perfection',
      items: [
        'Limescale removal from all surfaces',
        'Grout deep cleaning and mold treatment',
        'Shower screen/door descaling',
        'Toilet complete sanitization including behind',
        'Bath/shower resealing check',
        'Extractor fan dust removal',
        'Mirror and glass polishing',
        'Towel rail and radiator cleaning',
        'Floor deep clean including corners',
        'Cabinet interior and exterior cleaning'
      ]
    },
    {
      title: 'Living Spaces & Bedrooms',
      items: [
        'Carpet professional cleaning (if required)',
        'All windows inside cleaning',
        'Window sills and frames cleaning',
        'Curtain rail and blind cleaning',
        'Built-in wardrobe complete cleaning',
        'Radiator deep cleaning front and back',
        'Skirting boards and architraves',
        'Light fixtures and lamp shades',
        'Socket and switch plate cleaning',
        'Door cleaning including frames and handles'
      ]
    },
    {
      title: 'Often Forgotten Areas',
      items: [
        'Inside window tracks and mechanisms',
        'Top of door frames and picture rails',
        'Behind radiators and pipes',
        'Inside and on top of kitchen units',
        'Balcony or patio basic cleaning',
        'Entrance hallway and communal areas',
        'Storage cupboard and utility areas',
        'Garage or parking space (if applicable)',
        'Marks on walls and scuff removal',
        'Air vents and extractor grilles'
      ]
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-32 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/15 to-accent-400/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-96 right-1/3 w-80 h-80 bg-gradient-to-bl from-accent-500/15 to-primary-500/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-48 left-1/2 w-72 h-72 bg-gradient-to-tr from-primary-300/15 to-accent-300/20 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-md border border-primary-200/40 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-sm">
              <ShieldCheckIcon className="h-3 md:h-4 w-3 md:w-4 mr-2" />
              Deposit Protection Service
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              End of Tenancy Cleaning
            </h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8 px-2 md:px-0">
              Secure your deposit return with our comprehensive move-out cleaning service. 
              Our AI ensures every landlord requirement is met, matching you with specialists 
              who understand tenancy standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a href="/auth/register" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Book End of Tenancy Clean
              </a>
              <a href="/how-it-works" className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits - Full Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
              Why Landlords and Tenants Trust Us
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-primary-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CurrencyPoundIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Deposit Protection</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Thorough cleaning to help secure your deposit return
                  </p>
                </div>
              </div>
              
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Inventory Approved</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Meets all standard inventory check requirements
                  </p>
                </div>
              </div>
              
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrophyIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Agency Standard</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Trusted by leading London letting agencies
                  </p>
                </div>
              </div>
              
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BoltIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Fast Turnaround</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Same-day and next-day availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Checklist - Interactive Glass */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 text-center">
              Professional-Grade Checklist
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 text-center max-w-3xl mx-auto px-2 md:px-0">
              Our AI-powered system ensures nothing is missed. Every item on standard 
              inventory reports is thoroughly addressed, plus areas often overlooked.
            </p>
            
            {/* Area Selector */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
              {cleaningAreas.map((area, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedArea(idx)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                    selectedArea === idx
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  {area.title}
                </button>
              ))}
            </div>
            
            {/* Selected Area Details - Glass Effect */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:border-white/40 transition-all duration-300">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg flex items-center justify-center mr-3">
                    <DocumentCheckIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  {cleaningAreas[selectedArea].title}
                </h3>
                <div className="grid md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2">
                  {cleaningAreas[selectedArea].items.map((item, i) => (
                    <div key={i} className="flex items-start">
                      <span className="text-primary-500 mr-2">✓</span>
                      <span className="text-sm md:text-base text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process - Full Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
              Stress-Free Moving Process
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-6">
                {[
                  {
                    title: 'Property Analysis',
                    description: 'Our AI reviews your property details and any specific requirements from your tenancy agreement or inventory report.'
                  },
                  {
                    title: 'Team Assignment',
                    description: 'We match you with experienced teams who specialize in end of tenancy cleaning and understand landlord expectations.'
                  },
                  {
                    title: 'Thorough Execution',
                    description: 'Our team follows the comprehensive checklist, ensuring every detail meets professional inventory standards.'
                  },
                  {
                    title: 'Final Inspection',
                    description: 'Quality check against our AI-powered standards ensures your property is ready for final inspection.'
                  }
                ].map((step, idx) => (
                  <div key={idx} className="relative group hover:scale-[1.02] transition-transform">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="font-bold">{idx + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{step.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-70"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 border border-white/30">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <CheckBadgeIcon className="h-5 md:h-6 w-5 md:w-6 text-primary-600 mr-2" />
                    Our Commitment
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    We're committed to providing thorough, professional cleaning that meets 
                    inventory standards. Our experienced teams understand exactly what landlords 
                    and letting agents look for during inspections.
                  </p>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Quality Standards</p>
                    <p className="text-xs text-gray-600">Professional-grade cleaning following industry best practices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services - Full Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
              Complete Moving Solutions
            </h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <WindowIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Window Cleaning</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                    Add external window cleaning for a complete professional finish
                  </p>
                  <p className="text-primary-600 font-semibold">+£40</p>
                </div>
              </div>
              
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-primary-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <HomeModernIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Carpet Cleaning</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                    Professional carpet shampooing to remove stains and odors
                  </p>
                  <p className="text-primary-600 font-semibold">From £60</p>
                </div>
              </div>
              
              <div className="relative text-center group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-accent-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-xl p-5 border border-white/30 hover:border-white/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <HomeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Move-In Ready</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                    Prepare your new home with our sanitization service
                  </p>
                  <p className="text-primary-600 font-semibold">Same rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA - Full Glassmorphism */}
      <section className="py-12 md:py-16 relative">
        <div className="container-centered px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              Transparent, Fair Pricing
            </h2>
            
            <div className="relative mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-70"></div>
              <div className="relative bg-white/[0.08] backdrop-blur-xl rounded-2xl p-8 border border-white/30">
                <p className="text-xl md:text-2xl text-gray-900 mb-3 md:mb-4">
                  Starting from <span className="text-3xl md:text-4xl font-bold text-primary-600">£40</span> per hour
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-2 md:px-0">
                  Our AI calculates precise quotes based on property size, condition, and specific 
                  requirements. Most properties complete within 4-8 hours with our efficient teams.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                  {[
                    { type: 'Studio', duration: '3-4 hours', price: '£120-160' },
                    { type: '2 Bed Flat', duration: '5-6 hours', price: '£200-240' },
                    { type: '3 Bed House', duration: '7-8 hours', price: '£280-320' }
                  ].map((option, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900">{option.type}</p>
                      <p className="text-gray-600 text-sm">{option.duration}</p>
                      <p className="text-primary-600 font-bold">{option.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 px-2 md:px-0">
              Moving is stressful enough. Let our AI-powered service handle the cleaning 
              while you focus on your new beginning.
            </p>
            
            <a href="/auth/register" className="inline-flex items-center bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Secure Your Deposit Return
              <ArrowRightIcon className="h-4 md:h-5 w-4 md:w-5 ml-2" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}