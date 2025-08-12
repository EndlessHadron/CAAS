import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEO & Performance Monitoring | neatly Internal',
  description: 'Internal monitoring dashboard for SEO performance and analytics',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MonitoringPage() {
  return (
    <div className="container-narrow py-16">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">
        SEO & Performance Monitoring
      </h1>
      
      <div className="space-y-8">
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Quick SEO Checks</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>Robots.txt</span>
              <a href="/robots.txt" target="_blank" className="text-primary-600 hover:text-primary-700">
                View →
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>XML Sitemap</span>
              <a href="/sitemap.xml" target="_blank" className="text-primary-600 hover:text-primary-700">
                View →
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>Schema Validation</span>
              <a href="https://search.google.com/test/rich-results" target="_blank" className="text-primary-600 hover:text-primary-700">
                Test →
              </a>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Performance Tools</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>PageSpeed Insights</span>
              <a 
                href={`https://pagespeed.web.dev/analysis/https-theneatlyapp-com/form_factor=desktop`}
                target="_blank" 
                className="text-primary-600 hover:text-primary-700"
              >
                Test →
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>Core Web Vitals</span>
              <a 
                href={`https://search.google.com/search-console/core-web-vitals`}
                target="_blank" 
                className="text-primary-600 hover:text-primary-700"
              >
                View →
              </a>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded">
              <span>Mobile Friendly Test</span>
              <a 
                href={`https://search.google.com/test/mobile-friendly?url=https://theneatlyapp.com`}
                target="_blank" 
                className="text-primary-600 hover:text-primary-700"
              >
                Test →
              </a>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">SEO Checklist</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Meta titles and descriptions optimized</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Structured data implemented (LocalBusiness, Service, FAQ)</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>XML sitemap generated and submitted</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Robots.txt configured</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Location-specific landing pages created</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Open Graph and Twitter Card meta tags</span>
            </div>
            <div className="flex items-center">
              <span className="text-success-500 mr-3">✓</span>
              <span>Image optimization and alt text</span>
            </div>
            <div className="flex items-center">
              <span className="text-warning-500 mr-3">○</span>
              <span>Google Analytics 4 integration (pending setup)</span>
            </div>
            <div className="flex items-center">
              <span className="text-warning-500 mr-3">○</span>
              <span>Google Search Console verification (pending setup)</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-secondary-700">
            <li>Set up Google Analytics 4 tracking</li>
            <li>Verify Google Search Console</li>
            <li>Submit sitemap to search engines</li>
            <li>Create additional location pages (North London, South London, etc.)</li>
            <li>Build out service-specific landing pages</li>
            <li>Set up automated SEO monitoring alerts</li>
            <li>Implement A/B testing for key landing pages</li>
          </ol>
        </section>
      </div>
    </div>
  )
}