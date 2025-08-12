/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000'),
  },
  images: {
    domains: ['localhost', 'theneatlyapp.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      // Static assets
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts
      {
        source: '/(.*)\\.(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async rewrites() {
    // In production, proxy /api/* requests to the backend service
    if (process.env.NODE_ENV === 'production') {
      return [
        // When accessed via caas-frontend URL, route to caas-backend URL
        {
          source: '/api/:path*',
          destination: 'https://caas-backend-102964896009.us-central1.run.app/api/:path*',
          has: [
            {
              type: 'host',
              value: 'caas-frontend-102964896009.us-central1.run.app',
            },
          ],
        },
        // Default routing for production domain
        {
          source: '/api/:path*',
          destination: 'https://caas-backend-102964896009.us-central1.run.app/api/:path*',
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig