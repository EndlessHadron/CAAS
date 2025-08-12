import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ClientProvider } from '@/components/ClientProvider'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'neatly - Premium Cleaning Services in London | Trusted Professional Cleaners',
    template: '%s | neatly - London Cleaning Services'
  },
  description: 'Book trusted, vetted cleaning professionals in London. From regular cleaning to deep cleans, move-in/out services. 4.9★ rated, insured cleaners. Same-day booking available.',
  keywords: [
    'cleaning services London',
    'house cleaning London',
    'professional cleaners London',
    'domestic cleaning London',
    'deep cleaning London',
    'regular cleaning London',
    'move in cleaning London',
    'office cleaning London',
    'cleaning contractors London',
    'home cleaning services',
    'trusted cleaners',
    'insured cleaning services'
  ],
  authors: [{ name: 'neatly Team' }],
  creator: 'neatly',
  publisher: 'neatly',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://theneatlyapp.com',
    title: 'neatly - Premium Cleaning Services in London | Trusted Professional Cleaners',
    description: 'Book trusted, vetted cleaning professionals in London. From regular cleaning to deep cleans, move-in/out services. 4.9★ rated, insured cleaners. Same-day booking available.',
    siteName: 'neatly',
    images: [
      {
        url: 'https://theneatlyapp.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'neatly - Premium Cleaning Services in London',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'neatly - Premium Cleaning Services in London',
    description: 'Book trusted, vetted cleaning professionals in London. 4.9★ rated, insured cleaners. Same-day booking available.',
    images: ['https://theneatlyapp.com/og-image.png'],
    creator: '@neatlyapp',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://theneatlyapp.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/neatly_logo_more_gradient.png', sizes: '32x32', type: 'image/png' },
      { url: '/neatly_logo_more_gradient.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/neatly_logo_more_gradient.png',
  },
  category: 'business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className="scroll-smooth" prefix="og: http://ogp.me/ns#">
      <head>
      </head>
      <body className={inter.className}>
        <ClientProvider>
          <AuthProvider>
            <div className="min-h-screen relative bg-transparent flex flex-col">
              {/* Floating geometric elements for subtle visual interest */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary-300/20 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent-400/30 rounded-full animate-pulse-soft" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary-400/25 rounded-full animate-bounce-gentle" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-accent-300/35 rounded-full animate-pulse-soft" style={{animationDelay: '3s'}}></div>
              </div>
              
              <Navigation />
              <main className="container-centered py-6 md:py-12 relative z-10 flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  )
}