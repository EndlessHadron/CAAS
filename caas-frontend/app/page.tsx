'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon, StarIcon, SparklesIcon, ShieldCheckIcon, HeartIcon, CpuChipIcon, BoltIcon, MagnifyingGlassIcon, CalendarIcon, MapPinIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [selectedService, setSelectedService] = useState('deep')
  const [selectedHours, setSelectedHours] = useState(3)
  const [selectedFrequency, setSelectedFrequency] = useState('one-time')
  const [livePrice, setLivePrice] = useState(105)
  const [cleanersOnline, setCleanersOnline] = useState(47)
  const [bookingsToday, setBookingsToday] = useState(23)
  const [aiMatchScore, setAiMatchScore] = useState(96)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCleanersOnline(prev => prev + Math.floor(Math.random() * 3) - 1)
      setBookingsToday(prev => prev + Math.floor(Math.random() * 2))
      setAiMatchScore(prev => 94 + Math.floor(Math.random() * 6))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate live pricing
  useEffect(() => {
    const basePrices: { [key: string]: number } = { regular: 25, deep: 35, moveout: 40, oneTime: 30 }
    const frequencyMultipliers: { [key: string]: number } = { 'one-time': 1, weekly: 0.9, biweekly: 0.95 }
    const basePrice = basePrices[selectedService] || 35
    const multiplier = frequencyMultipliers[selectedFrequency] || 1
    setLivePrice(Math.round(basePrice * selectedHours * multiplier))
  }, [selectedService, selectedHours, selectedFrequency])

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified & Insured',
      description: 'All our cleaners are background checked, fully insured, and rated by the community for your peace of mind.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: ClockIcon,
      title: 'Flexible Scheduling',
      description: 'Book for today, tomorrow, or weeks ahead. Same-day availability and easy rescheduling when plans change.',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: HeartIcon,
      title: 'Quality Guarantee',
      description: 'Not happy with your clean? We\'ll make it right with our satisfaction guarantee and quality standards.',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
  ]

  const services = [
    { 
      name: 'Regular Cleaning', 
      price: '£25/hour', 
      description: 'Weekly or bi-weekly cleaning to keep your space spotless',
      popular: false,
    },
    { 
      name: 'Deep Cleaning', 
      price: '£35/hour', 
      description: 'Thorough one-time cleaning for that fresh start',
      popular: true,
    },
    { 
      name: 'Move In/Out', 
      price: '£40/hour', 
      description: 'Complete cleaning for moving transitions',
      popular: false,
    },
    { 
      name: 'One-Time Service', 
      price: '£30/hour', 
      description: 'Perfect for special occasions or events',
      popular: false,
    },
  ]

  return (
    <div className="space-y-16 md:space-y-24 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-32 left-16 w-80 h-80 bg-gradient-to-br from-primary-400/8 to-accent-400/12 rounded-full blur-3xl"></div>
        <div className="absolute top-64 right-24 w-96 h-96 bg-gradient-to-bl from-accent-500/10 to-primary-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-tr from-primary-300/8 to-accent-300/10 rounded-full blur-3xl"></div>
        
        {/* Clean geometric accents */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-primary-200/20 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/5 w-16 h-16 bg-accent-300/10 rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-32 animate-fade-in relative">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200/40 rounded-full text-primary-700 text-base font-medium mb-8 shadow-sm backdrop-blur-sm">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
                AI-Powered Cleaning Service • London's Most Trusted
              </div>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-hero mb-8">
              <span className="block text-secondary-900">
                Spotless Homes,
              </span>
              <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                Trusted Cleaners
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-subtitle mb-12 max-w-3xl mx-auto text-secondary-600">
              Our AI intelligently matches you with London's top-rated cleaning professionals based on your preferences, location, and needs. 
              From smart scheduling to automated quality checks, we use AI throughout the entire process to ensure perfect results, every time.
            </p>

            {/* Service Quality Stats */}
            <div className="grid grid-cols-2 gap-12 mb-12 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-light text-accent-600">4.9★</div>
                <div className="text-sm text-secondary-500 font-light">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-success-600">500+</div>
                <div className="text-sm text-secondary-500 font-light">Happy Customers</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center w-full">
              <Link href="/auth/register" className="btn-primary text-lg px-12 py-4 font-medium">
                Book Your Cleaner
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">neatly</span>?
            </h2>
            <p className="text-subtitle max-w-2xl mx-auto text-secondary-600">
              Professional cleaning made simple, reliable, and stress-free
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-interactive text-center group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Our Services
            </h2>
            <p className="text-subtitle max-w-2xl mx-auto">
              Professional cleaning solutions tailored to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`card-compact group relative overflow-hidden ${
                  service.popular ? 'ring-2 ring-primary-300 shadow-soft-lg' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary-600 mb-3">
                    {service.price}
                  </p>
                  <p className="text-body flex-grow">
                    {service.description}
                  </p>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-subtitle max-w-2xl mx-auto">
              Real stories from real customers across London
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                title: "Marketing Manager",
                location: "Shoreditch",
                rating: 5,
                text: "neatly has been a game-changer for my work-life balance. The cleaners are reliable, thorough, and I love how easy the app is to use. Worth every penny!",
                service: "Regular Cleaning"
              },
              {
                name: "Michael Chen",
                title: "Software Engineer", 
                location: "Canary Wharf", 
                rating: 5,
                text: "As someone who works long hours, coming home to a spotless flat is amazing. The booking process is super smooth and the quality is consistently excellent.",
                service: "Weekly Clean"
              },
              {
                name: "Emma Williams",
                title: "Teacher",
                location: "Camden",
                rating: 5,
                text: "I was nervous about letting someone into my home, but neatly made me feel completely comfortable. Professional, trustworthy, and my place has never looked better.",
                service: "Deep Clean"
              }
            ].map((testimonial, index) => (
              <div key={index} className="card-interactive relative">
                <div className="absolute top-6 right-6 opacity-10">
                  <StarIcon className="h-12 w-12 text-accent-500" />
                </div>
                
                <div className="relative">
                  <div className="flex items-start mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-soft">
                      {testimonial.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900 text-lg">{testimonial.name}</h3>
                      <p className="text-sm font-medium text-accent-600">{testimonial.title}</p>
                      <p className="text-xs text-secondary-500 mt-1">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-accent-500 fill-current" />
                    ))}
                    <span className="ml-3 text-xs font-medium text-secondary-600 bg-secondary-100 px-3 py-1 rounded-full">
                      {testimonial.service}
                    </span>
                  </div>
                  
                  <blockquote className="text-secondary-700 font-medium leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Happy Customers", icon: HeartIcon },
              { number: "2,500+", label: "Cleans Completed", icon: CheckCircleIcon },
              { number: "4.9★", label: "Average Rating", icon: StarIcon },
              { number: "24hr", label: "Average Response", icon: ClockIcon }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mb-2">{stat.number}</div>
                  <div className="text-secondary-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="card text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 opacity-95"></div>
            <div className="relative z-10 text-white py-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Experience Clean?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                Join hundreds of satisfied customers across London who trust neatly for their cleaning needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth/register" 
                  className="bg-white text-primary-600 hover:bg-secondary-50 font-medium py-4 px-8 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg hover:scale-105 active:scale-95"
                >
                  Book Your First Clean
                </Link>
                <Link 
                  href="/auth/login" 
                  className="text-white hover:text-primary-100 font-medium py-4 px-8 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </div>
            
            {/* Enhanced Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-accent-400/20 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-8 w-3 h-3 bg-white/30 rounded-full animate-bounce-gentle"></div>
            <div className="absolute top-1/3 right-12 w-2 h-2 bg-accent-300/40 rounded-full animate-pulse-soft"></div>
          </div>
        </div>
      </section>
    </div>
  )
}