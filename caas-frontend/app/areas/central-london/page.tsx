import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { MapPinIcon, CheckCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline'
import { generateLocalBusinessSchema, generateServiceSchema, schemaToJsonLd } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Professional Cleaning Services Central London | Same-Day Booking | neatly',
  description: 'Professional cleaning services in Central London (WC1, WC2, EC1-EC4). Same-day booking available. Vetted, insured cleaners. £25-40/hour. Book your Central London cleaner today!',
  keywords: [
    'cleaning services Central London',
    'cleaners Central London', 
    'house cleaning WC1 WC2',
    'office cleaning EC1 EC2 EC3 EC4',
    'professional cleaners Central London',
    'same day cleaning Central London',
    'domestic cleaning Central London',
    'Central London cleaning company'
  ],
  openGraph: {
    title: 'Professional Cleaning Services Central London | Same-Day Booking | neatly',
    description: 'Professional cleaning services in Central London (WC1, WC2, EC1-EC4). Same-day booking available. Vetted, insured cleaners. £25-40/hour. Book your Central London cleaner today!',
    url: 'https://theneatlyapp.com/areas/central-london',
  },
  alternates: {
    canonical: 'https://theneatlyapp.com/areas/central-london',
  },
}

export default function CentralLondonPage() {
  const localBusinessData = {
    name: 'neatly - Central London Cleaning Services',
    description: 'Professional cleaning services in Central London including regular cleaning, deep cleaning, and office cleaning. Same-day booking available.',
    url: 'https://theneatlyapp.com/areas/central-london',
    address: {
      addressLocality: 'Central London',
      addressRegion: 'London', 
      addressCountry: 'GB',
    },
    priceRange: '£25-£40',
    aggregateRating: {
      ratingValue: '4.9',
      ratingCount: '150',
    },
  }

  const serviceData = {
    name: 'Central London Cleaning Services',
    description: 'Professional residential and commercial cleaning services covering all Central London postcodes including WC1, WC2, EC1, EC2, EC3, and EC4.',
    serviceType: 'Professional Cleaning Services',
    areaServed: 'Central London',
    priceRange: '£25-£40',
  }

  const localBusinessSchema = generateLocalBusinessSchema(localBusinessData)
  const serviceSchema = generateServiceSchema(serviceData)

  const postcodes = ['WC1A', 'WC1B', 'WC1E', 'WC1H', 'WC1N', 'WC1R', 'WC1V', 'WC1X', 'WC2A', 'WC2B', 'WC2E', 'WC2H', 'WC2N', 'WC2R', 'EC1A', 'EC1M', 'EC1N', 'EC1R', 'EC1V', 'EC1Y', 'EC2A', 'EC2M', 'EC2N', 'EC2R', 'EC2V', 'EC2Y', 'EC3A', 'EC3M', 'EC3N', 'EC3R', 'EC3V', 'EC4A', 'EC4M', 'EC4N', 'EC4R', 'EC4V', 'EC4Y']

  const landmarks = [
    'Covent Garden', 'Holborn', 'Bloomsbury', 'King\'s Cross', 'Farringdon', 
    'Barbican', 'Liverpool Street', 'Bank', 'Monument', 'London Bridge Area'
  ]

  return (
    <>
      <Script
        id="central-london-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonLd(localBusinessSchema)
        }}
      />
      <Script
        id="central-london-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonLd(serviceSchema)
        }}
      />

      <div className="space-y-16 md:space-y-24">
        {/* Hero Section */}
        <section className="py-16">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200/40 rounded-full text-primary-700 text-sm font-medium mb-8">
                  <MapPinIcon className="h-4 w-4 mr-2 text-primary-600" />
                  Central London • WC1, WC2, EC1-EC4
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
                Professional Cleaning Services in{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  Central London
                </span>
              </h1>
              
              <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
                Trusted cleaning professionals serving Central London's business district and residential areas. 
                From Covent Garden to Bank, our vetted cleaners deliver exceptional results with same-day booking available.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/auth/register" className="btn-primary px-8 py-3">
                  Book Central London Cleaner
                </Link>
                <Link href="/services" className="btn-secondary px-8 py-3">
                  View Services & Pricing
                </Link>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">150+</div>
                  <div className="text-sm text-secondary-600">Central London Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">4.9★</div>
                  <div className="text-sm text-secondary-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">Same Day</div>
                  <div className="text-sm text-secondary-600">Booking Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">£25-40</div>
                  <div className="text-sm text-secondary-600">Per Hour</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services for Central London */}
        <section className="py-16 bg-secondary-50/50">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Cleaning Services in Central London
              </h2>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                Residential and commercial cleaning solutions for Central London's unique needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Residential Cleaning',
                  price: '£25-35/hour',
                  description: 'Professional house cleaning for Central London apartments, flats, and homes.',
                  features: ['Regular weekly/bi-weekly service', 'One-time deep cleans', 'Move in/out cleaning', 'Same-day availability']
                },
                {
                  name: 'Office Cleaning',
                  price: '£28-35/hour', 
                  description: 'Commercial cleaning for Central London businesses, co-working spaces, and offices.',
                  features: ['After-hours cleaning', 'Desk and workspace sanitization', 'Kitchen and restroom cleaning', 'Flexible scheduling']
                },
                {
                  name: 'Serviced Apartments',
                  price: '£30-40/hour',
                  description: 'Specialized cleaning for short-term rentals and serviced apartments in Central London.',
                  features: ['Turnover cleaning', 'Guest-ready standards', 'Inventory management', 'Same-day turnaround']
                }
              ].map((service, index) => (
                <div key={index} className="card-interactive">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {service.name}
                  </h3>
                  <div className="text-2xl font-bold text-primary-600 mb-3">
                    {service.price}
                  </div>
                  <p className="text-secondary-600 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-secondary-600">
                        <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Areas We Cover */}
        <section className="py-16">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Central London Postcodes We Cover
              </h2>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                Professional cleaning services available across all Central London postcodes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-6">All Postcodes Covered:</h3>
                <div className="grid grid-cols-6 gap-2">
                  {postcodes.slice(0, 24).map((postcode, index) => (
                    <div key={index} className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary-50 text-primary-700 font-medium">
                        {postcode}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <span className="text-sm text-secondary-500">+ {postcodes.length - 24} more postcodes</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-6">Popular Areas:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {landmarks.map((landmark, index) => (
                    <div key={index} className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-primary-600 mr-2" />
                      <span className="text-secondary-700">{landmark}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-secondary-50/50">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                What Central London Customers Say
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  name: 'James Wilson',
                  area: 'Covent Garden, WC2',
                  rating: 5,
                  text: 'Perfect service for my flat in Covent Garden. The cleaner was professional, thorough, and worked around my busy schedule. Highly recommend for Central London residents.',
                  service: 'Regular Cleaning'
                },
                {
                  name: 'Sarah Mitchell', 
                  area: 'Bank, EC3',
                  rating: 5,
                  text: 'Our office near Bank station has never looked better. Professional, reliable service that works perfectly with our business needs. Great value for Central London.',
                  service: 'Office Cleaning'
                }
              ].map((testimonial, index) => (
                <div key={index} className="card-interactive">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900">{testimonial.name}</h3>
                      <p className="text-sm text-secondary-600">{testimonial.area}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-accent-500 fill-current" />
                    ))}
                    <span className="ml-3 text-xs font-medium text-secondary-600 bg-secondary-100 px-2 py-1 rounded-full">
                      {testimonial.service}
                    </span>
                  </div>
                  
                  <blockquote className="text-secondary-700 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container-narrow">
            <div className="card text-center bg-gradient-to-br from-primary-500 to-accent-600 text-white py-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Book Your Central London Cleaner
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                Professional, vetted cleaners available across all Central London postcodes. 
                Same-day booking and satisfaction guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth/register" 
                  className="bg-white text-primary-600 hover:bg-secondary-50 font-medium py-4 px-8 rounded-xl transition-all duration-200"
                >
                  Book Now - Central London
                </Link>
                <Link 
                  href="/areas" 
                  className="text-white hover:text-primary-100 font-medium py-4 px-8 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200"
                >
                  View All London Areas
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}