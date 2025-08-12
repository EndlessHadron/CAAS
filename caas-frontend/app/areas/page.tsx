import { Metadata } from 'next'
import Link from 'next/link'
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'London Areas We Serve | Professional Cleaning Services | neatly',
  description: 'neatly provides professional cleaning services across all London areas including Central, North, South, East and West London. Same-day booking available in your area.',
  keywords: [
    'cleaning services London areas',
    'Central London cleaning',
    'North London cleaners',
    'South London cleaning',
    'East London cleaners', 
    'West London cleaning services',
    'London postcode cleaning',
    'local cleaners London'
  ],
  openGraph: {
    title: 'London Areas We Serve | Professional Cleaning Services | neatly',
    description: 'neatly provides professional cleaning services across all London areas including Central, North, South, East and West London. Same-day booking available in your area.',
    url: 'https://theneatlyapp.com/areas',
  },
  alternates: {
    canonical: 'https://theneatlyapp.com/areas',
  },
}

export default function AreasPage() {
  const londonAreas = [
    {
      name: 'Central London',
      slug: 'central-london',
      description: 'Professional cleaning services in the heart of London',
      postcodes: ['WC1', 'WC2', 'EC1', 'EC2', 'EC3', 'EC4'],
      popular: true,
    },
    {
      name: 'North London',
      slug: 'north-london', 
      description: 'Trusted cleaners serving North London communities',
      postcodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8'],
      popular: true,
    },
    {
      name: 'South London',
      slug: 'south-london',
      description: 'Quality cleaning services across South London',
      postcodes: ['SW1', 'SW2', 'SW3', 'SW4', 'SW5', 'SW6', 'SW7', 'SW8'],
      popular: true,
    },
    {
      name: 'East London',
      slug: 'east-london',
      description: 'Professional cleaners for East London residents',
      postcodes: ['E1', 'E2', 'E3', 'E14', 'E15', 'E16', 'E17', 'E18'],
      popular: true,
    },
    {
      name: 'West London',
      slug: 'west-london',
      description: 'Premium cleaning services in West London',
      postcodes: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      popular: true,
    },
    {
      name: 'Canary Wharf',
      slug: 'canary-wharf',
      description: 'Business district cleaning specialists',
      postcodes: ['E14'],
      popular: false,
    },
    {
      name: 'Shoreditch',
      slug: 'shoreditch',
      description: 'Creative district cleaning services',
      postcodes: ['EC1', 'EC2', 'N1'],
      popular: false,
    },
    {
      name: 'Camden',
      slug: 'camden',
      description: 'Vibrant Camden area cleaning services',
      postcodes: ['NW1', 'NW3'],
      popular: false,
    },
    {
      name: 'Kensington',
      slug: 'kensington',
      description: 'Luxury cleaning for Kensington homes',
      postcodes: ['SW5', 'SW7', 'W8', 'W11'],
      popular: false,
    },
    {
      name: 'Chelsea',
      slug: 'chelsea',
      description: 'Premium cleaning services in Chelsea',
      postcodes: ['SW1', 'SW3', 'SW10'],
      popular: false,
    },
  ]

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Professional Cleaning Services Across{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                London
              </span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Wherever you are in London, our vetted professional cleaners are ready to help. 
              Same-day booking available in all areas with trusted, insured cleaning professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary px-8 py-3">
                Book in Your Area
              </Link>
              <Link href="/services" className="btn-secondary px-8 py-3">
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Areas We Serve
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Professional cleaning services available across all London postcodes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {londonAreas.map((area, index) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className={`card-interactive group ${
                  area.popular ? 'ring-2 ring-primary-200' : ''
                }`}
              >
                {area.popular && (
                  <div className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mr-4">
                    <MapPinIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {area.description}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-secondary-500 mb-2">Postcodes covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {area.postcodes.slice(0, 4).map((postcode, pcIndex) => (
                      <span 
                        key={pcIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700"
                      >
                        {postcode}
                      </span>
                    ))}
                    {area.postcodes.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700">
                        +{area.postcodes.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-success-600">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Same-day booking available
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 bg-secondary-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Consistent Quality Across London
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              The same high standards and professional service, wherever you are in London
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-secondary-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-secondary-600">London Postcodes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9★</div>
              <div className="text-secondary-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">24hr</div>
              <div className="text-secondary-600">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="card text-center bg-gradient-to-br from-primary-500 to-accent-600 text-white py-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Book Your Local Cleaner Today
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
              Professional, vetted cleaners available in your area. Same-day booking and satisfaction guaranteed.
            </p>
            <Link 
              href="/auth/register" 
              className="bg-white text-primary-600 hover:bg-secondary-50 font-medium py-4 px-8 rounded-xl transition-all duration-200"
            >
              Find Cleaners Near You
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}