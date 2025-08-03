import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ClientProvider } from '@/components/ClientProvider'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CAAS - Cleaning as a Service',
  description: 'Connect with professional cleaning contractors in London',
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
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
              <Navigation />
              <main className="container-centered py-6 md:py-12">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  )
}