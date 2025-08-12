export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-GB')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Who We Are</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            neatly operates a digital platform connecting customers with independent cleaning contractors in London.
            Business registration is currently in progress.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p><strong>Data Controller:</strong> neatly</p>
            <p><strong>Contact:</strong> <a href="mailto:support@theneatlyapp.com" className="text-blue-600">support@theneatlyapp.com</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Name, email address, and phone number</li>
            <li>Service address and access instructions</li>
            <li>Payment information (processed securely via Stripe)</li>
            <li>Service preferences and special requirements</li>
            <li>Communication records and feedback</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Information</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>IP address and browser information</li>
            <li>Device type and operating system</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We process your personal data for the following purposes:</p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Service Provision (Contract)</h4>
              <p className="text-gray-700">To provide cleaning services, match you with cleaners, process payments, and manage bookings.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Communication (Legitimate Interest)</h4>
              <p className="text-gray-700">To send service updates, booking confirmations, and customer support.</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-gray-900">Legal Compliance (Legal Obligation)</h4>
              <p className="text-gray-700">To comply with taxation, accounting, and regulatory requirements.</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Marketing (Consent)</h4>
              <p className="text-gray-700">To send promotional offers and newsletters (only with your explicit consent).</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-700 mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Cleaning Contractors:</strong> Name, contact details, and service requirements</li>
            <li><strong>Payment Processors:</strong> Stripe (for secure payment processing)</li>
            <li><strong>Service Providers:</strong> Cloud hosting, analytics, and communication tools</li>
            <li><strong>Legal Authorities:</strong> When required by law or court order</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights Under UK GDPR</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Access</h4>
              <p className="text-sm text-gray-700">Request copies of your personal data</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Rectification</h4>
              <p className="text-sm text-gray-700">Correct inaccurate information</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Erasure</h4>
              <p className="text-sm text-gray-700">Request deletion of your data</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Portability</h4>
              <p className="text-sm text-gray-700">Export your data in a structured format</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Object</h4>
              <p className="text-sm text-gray-700">Object to processing for marketing</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Withdraw Consent</h4>
              <p className="text-sm text-gray-700">Withdraw consent at any time</p>
            </div>
          </div>
          <p className="text-gray-700 mt-4">
            To exercise your rights, contact us at <a href="mailto:privacy@theneatlyapp.com" className="text-blue-600">privacy@theneatlyapp.com</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security & Retention</h2>
          <div className="bg-green-50 p-6 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2">🔒 Security Measures</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• SSL encryption for all data transmission</li>
              <li>• Secure cloud infrastructure (Google Cloud Platform)</li>
              <li>• Regular security audits and updates</li>
              <li>• Access controls and staff training</li>
            </ul>
          </div>
          
          <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Account data: Retained while your account is active</li>
            <li>Booking history: 7 years (for tax and legal purposes)</li>
            <li>Marketing data: Until consent is withdrawn</li>
            <li>Legal disputes: Until resolution + 6 years</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to improve your experience. See our 
            <a href="/legal/cookie-policy" className="text-blue-600 hover:underline"> Cookie Policy</a> 
            for detailed information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this privacy policy periodically. Significant changes will be communicated 
            via email or website notification. The effective date at the top indicates when this policy was last updated.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              For any privacy-related questions or to exercise your rights, contact:
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong> <a href="mailto:support@theneatlyapp.com" className="text-blue-600">support@theneatlyapp.com</a></p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) 
              at <a href="https://ico.org.uk" className="text-blue-600">ico.org.uk</a> if you believe we have 
              mishandled your personal data.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}