import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://theneatlyapp.com'
  
  // Define your static pages
  const staticPages = [
    '',
    '/services',
    '/about',
    '/contact',
    '/booking',
    '/auth/login',
    '/auth/register',
  ]

  // Define service pages for different cleaning types
  const servicePages = [
    '/services/regular-cleaning',
    '/services/deep-cleaning',
    '/services/move-in-out-cleaning',
    '/services/one-time-cleaning',
    '/services/office-cleaning',
  ]

  // Define location pages for London areas
  const locationPages = [
    '/areas/central-london',
    '/areas/north-london',
    '/areas/south-london',
    '/areas/east-london',
    '/areas/west-london',
    '/areas/canary-wharf',
    '/areas/shoreditch',
    '/areas/camden',
    '/areas/kensington',
    '/areas/chelsea',
  ]

  const currentDate = new Date().toISOString()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticPages, ...servicePages, ...locationPages]
  .map(page => {
    const url = `${baseUrl}${page}`
    const isHomePage = page === ''
    const isServicePage = page.includes('/services/')
    const isLocationPage = page.includes('/areas/')
    
    // Set priority based on page type
    let priority = '0.5'
    let changefreq = 'monthly'
    
    if (isHomePage) {
      priority = '1.0'
      changefreq = 'weekly'
    } else if (isServicePage || isLocationPage) {
      priority = '0.8'
      changefreq = 'weekly'
    }

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  })
}