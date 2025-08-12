import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, SparklesIcon, ShieldCheckIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Professional Cleaning Services in London | neatly',
  description: 'Comprehensive cleaning services in London including regular cleaning, deep cleaning, move-in/out cleaning, and office cleaning. Professional, insured cleaners available same-day.',
  keywords: [
    'cleaning services London',
    'professional cleaners London', 
    'house cleaning London',
    'office cleaning London',
    'deep cleaning London',
    'regular cleaning London',
    'move in cleaning London',
    'domestic cleaning London',
    'commercial cleaning London'
  ],
  openGraph: {
    title: 'Professional Cleaning Services in London | neatly',
    description: 'Comprehensive cleaning services in London including regular cleaning, deep cleaning, move-in/out cleaning, and office cleaning. Professional, insured cleaners available same-day.',
    url: 'https://theneatlyapp.com/services',
  },
  alternates: {
    canonical: 'https://theneatlyapp.com/services',
  },
}

export default function ServicesPage() {
  const services = [
    {
      name: 'Regular Cleaning',
      slug: 'regular-cleaning',
      price: 'From £18/hour',
      description: 'Weekly or bi-weekly home cleaning to maintain a consistently spotless environment. Matched with vetted professional cleaners.',
      features: ['All surface dusting & wiping', 'Vacuum & mop all floors', 'Kitchen & bathroom deep clean', 'Bin emptying & liner replacement'],
      popular: true,
      icon: ClockIcon,
    },
    {
      name: 'Deep Cleaning',
      slug: 'deep-cleaning', 
      price: 'From £22/hour',
      description: 'Comprehensive one-time intensive cleaning covering every detail of your space. Perfect for spring cleaning or special occasions.',
      features: ['Inside oven & appliance cleaning', 'Detailed scrubbing of all surfaces', 'Window sills & frames cleaning', 'Skirting boards & light switches'],
      popular: false,
      icon: SparklesIcon,
    },
    {
      name: 'End of Tenancy',
      slug: 'end-of-tenancy-cleaning',
      price: 'From £25/hour', 
      description: 'Professional move-in/out cleaning service to guarantee deposit return or prepare your new home to perfection.',
      features: ['Full property deep clean', 'Inside all cupboards & drawers', 'Wall marks & scuff removal', 'Garden/balcony tidying included'],
      popular: false,
      icon: CheckCircleIcon,
    },
    {
      name: 'One-Off Clean',
      slug: 'one-off-cleaning',
      price: 'From £20/hour',
      description: 'Flexible cleaning service for any occasion - parties, events, or when you simply need a professional touch.',
      features: ['Same-day booking available', 'Custom cleaning checklist', 'Event preparation cleaning', 'Post-party cleanup service'],
      popular: false,
      icon: HeartIcon,
    },
  ]

  const whyChooseUs = [
    {
      icon: ShieldCheckIcon,
      title: 'Vetted Professional Cleaners',
      description: 'All cleaners are background checked, fully insured, and rated by real customers in our marketplace.'
    },
    {
      icon: ClockIcon,
      title: 'Instant Booking & Matching',
      description: 'Book online and get instantly matched with available cleaners in your area. Same-day service often available.'
    },
    {
      icon: HeartIcon,
      title: 'Quality Guaranteed',
      description: 'Secure payments via Stripe. Not satisfied? Our quality guarantee ensures we make it right.'
    }
  ]

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Professional Cleaning Services in{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                London
              </span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Connect with trusted, vetted cleaners in your area. Our marketplace platform matches you 
              with professional cleaners who deliver exceptional results across London.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary px-8 py-3">
                Get Started
              </Link>
              <Link href="/auth/register?role=cleaner" className="btn-secondary px-8 py-3">
                Join as a Cleaner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Choose Your Cleaning Service
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Book the right cleaning service for your needs. Get matched with professional cleaners instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={service.slug}
                className={`card-interactive relative overflow-hidden ${
                  service.popular ? 'ring-2 ring-primary-300 shadow-soft-lg' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {service.name}
                  </h3>
                  <div className="text-2xl font-bold text-primary-600 mb-3">
                    {service.price}
                  </div>
                  <p className="text-secondary-600 mb-4">
                    {service.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-secondary-600">
                      <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Book This Service
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-secondary-50/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose neatly?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              The trusted cleaning marketplace connecting London residents with professional cleaners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-secondary-600">
                  {item.description}
                </p>
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
              Ready to Find Your Perfect Cleaner?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
              Join the neatly marketplace. Get matched with professional cleaners, book instantly, and pay securely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="bg-white text-primary-600 hover:bg-secondary-50 font-medium py-4 px-8 rounded-xl transition-all duration-200"
              >
                Book a Cleaner
              </Link>
              <Link 
                href="/auth/register?role=cleaner" 
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-4 px-8 rounded-xl transition-all duration-200"
              >
                Become a Cleaner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}