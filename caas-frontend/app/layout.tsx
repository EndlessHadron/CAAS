import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ClientProvider } from '@/components/ClientProvider'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'neatly - Premium Cleaning Services',
  description: 'Connect with professional cleaning contractors in London',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/neatly_logo_more_gradient.png', sizes: '32x32', type: 'image/png' },
      { url: '/neatly_logo_more_gradient.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/neatly_logo_more_gradient.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ClientProvider>
          <AuthProvider>
            <div className="min-h-screen relative bg-transparent">
              {/* Floating geometric elements for subtle visual interest */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary-300/20 rounded-full animate-bounce-gentle"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent-400/30 rounded-full animate-pulse-soft" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary-400/25 rounded-full animate-bounce-gentle" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-accent-300/35 rounded-full animate-pulse-soft" style={{animationDelay: '3s'}}></div>
              </div>
              
              <Navigation />
              <main className="container-centered py-6 md:py-12 relative z-10">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  )
}