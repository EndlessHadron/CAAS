import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, StarIcon, SparklesIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Cleaners',
      description: 'All our cleaning professionals are thoroughly background-checked and verified for your peace of mind.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: ClockIcon,
      title: 'Flexible Scheduling',
      description: 'Book cleaning services at times that work perfectly with your busy schedule.',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: HeartIcon,
      title: 'Quality Guaranteed',
      description: 'We ensure exceptional service quality with our comprehensive rating and review system.',
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
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 animate-fade-in">
        <div className="container-narrow">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              London's Premier Cleaning Service
            </div>
          </div>
          
          <h1 className="text-hero mb-6">
            <span className="block">Sparkling Clean Spaces</span>
            <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-subtitle mb-10 max-w-3xl mx-auto">
            Connect with verified cleaning professionals across London. 
            Book, manage, and enjoy professional cleaning services—all from one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 interactive-scale">
              Start Your Journey
            </Link>
            <Link href="/auth/login" className="btn-ghost text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
          
          <div className="mt-12 text-caption">
            <span className="inline-flex items-center space-x-2">
              <StarIcon className="h-4 w-4 text-accent-500" />
              <span>Trusted by 500+ happy customers in London</span>
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose CAAS?
            </h2>
            <p className="text-subtitle max-w-2xl mx-auto">
              Experience the difference with our carefully curated cleaning services
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
                Join hundreds of satisfied customers across London who trust CAAS for their cleaning needs.
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
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-accent-400/20 rounded-full blur-lg"></div>
          </div>
        </div>
      </section>
    </div>
  )
}