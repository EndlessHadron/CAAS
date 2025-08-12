export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-GB')} <br />
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. About These Terms</h2>
          <div className="bg-blue-50 p-6 rounded-lg mb-4">
            <p className="text-gray-700 mb-2">
              <strong>Welcome to neatly!</strong> These Terms of Service govern your use of our platform 
              and the cleaning services provided by independent contractors through our marketplace.
            </p>
            <p className="text-sm text-gray-600">
              By using neatly, you agree to these terms. If you don't agree, please don't use our service.
            </p>
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Key Information</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Service Provider:</strong> neatly (business registration in progress)</li>
            <li><strong>Contact:</strong> <a href="mailto:support@theneatlyapp.com" className="text-blue-600">support@theneatlyapp.com</a></li>
            <li><strong>Platform:</strong> Web application at theneatlyapp.com</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Our Service</h2>
          
          <div className="border-l-4 border-blue-500 pl-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">What We Do</h4>
            <p className="text-gray-700">
              neatly operates a digital marketplace that connects customers with independent cleaning 
              contractors in London. We facilitate bookings, payments, and communications between 
              customers and cleaners.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">What We Don't Do</h4>
            <p className="text-gray-700">
              We do not directly provide cleaning services. All cleaning is performed by independent 
              contractors who set their own schedules, rates, and service standards. We are not 
              responsible for the quality of cleaning services provided.
            </p>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Service Areas</h3>
          <p className="text-gray-700 mb-4">
            Our services are currently available within Greater London. Service availability 
            depends on cleaner availability in your specific area.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Account Creation</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>You must be at least 18 years old to create an account</li>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Account Types</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Customer Accounts</h4>
              <p className="text-sm text-gray-700">Book cleaning services, manage appointments, make payments</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Cleaner Accounts</h4>
              <p className="text-sm text-gray-700">Provide cleaning services, manage availability, receive payments</p>
            </div>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Account Responsibilities</h3>
          <p className="text-gray-700">
            You are responsible for all activities under your account. Keep your login credentials 
            secure and do not share your account with others.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Booking & Payment Terms</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Booking Process</h3>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
            <li>Select cleaning service type and requirements</li>
            <li>Choose date, time, and duration</li>
            <li>Review and confirm booking details</li>
            <li>Make payment via our secure payment system</li>
            <li>Receive confirmation and cleaner assignment</li>
          </ol>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Pricing</h3>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Prices are set by individual cleaning contractors</li>
              <li>• All prices include VAT where applicable</li>
              <li>• Platform fee may be added to the total cost</li>
              <li>• Prices displayed are indicative and may vary based on specific requirements</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Payment</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Payment is processed securely via Stripe</li>
            <li>Payment is due at the time of booking</li>
            <li>We accept major credit/debit cards and digital wallets</li>
            <li>Refunds are subject to our cancellation policy</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation & Refunds</h2>
          
          <div className="space-y-4">
            <div className="border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Free Cancellation</h4>
              <p className="text-sm text-gray-700">Cancel up to 24 hours before your appointment for a full refund</p>
            </div>
            
            <div className="border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Late Cancellation</h4>
              <p className="text-sm text-gray-700">Cancellations within 24 hours may incur a 50% fee</p>
            </div>
            
            <div className="border border-red-200 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">❌ No-Show</h4>
              <p className="text-sm text-gray-700">Failure to provide access or be present may result in full charge</p>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            Refunds are processed within 5-10 business days to your original payment method.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Acceptable Use</h3>
          <p className="text-gray-700 mb-4">When using our platform, you agree to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Treat cleaners with respect and professionalism</li>
            <li>Provide accurate service requirements and property access</li>
            <li>Maintain a safe and appropriate work environment</li>
            <li>Use the platform only for legitimate cleaning services</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Prohibited Activities</h3>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-medium mb-2">You may not:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Use the platform for illegal or inappropriate purposes</li>
              <li>• Harass, discriminate against, or abuse cleaning contractors</li>
              <li>• Attempt to circumvent payment through the platform</li>
              <li>• Share account credentials or create multiple accounts</li>
              <li>• Interfere with the platform's operation or security</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Liability & Insurance</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Our Liability</h3>
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <p className="text-gray-700 mb-4">
              <strong>Platform Service:</strong> Our liability is limited to the platform service we provide. 
              We are not liable for the quality, safety, or legality of cleaning services provided by contractors.
            </p>
            <p className="text-sm text-gray-600">
              Our total liability for any claim is limited to the amount you paid for the specific booking in question, 
              up to a maximum of £500 per incident.
            </p>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Cleaner Insurance</h3>
          <p className="text-gray-700 mb-4">
            All cleaning contractors on our platform are required to maintain appropriate public 
            liability insurance. However, you should verify coverage details directly with your assigned cleaner.
          </p>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Your Responsibilities</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Ensure property is safe for cleaning services</li>
            <li>Secure or remove valuable items before service</li>
            <li>Provide clear access instructions and requirements</li>
            <li>Report any issues immediately after service completion</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The neatly platform, including its design, features, content, and trademarks, 
            is owned by neatly Limited and protected by intellectual property laws.
          </p>
          <p className="text-gray-700">
            You may use our platform for its intended purpose but may not reproduce, 
            distribute, or create derivative works without our written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Protection</h2>
          <p className="text-gray-700 mb-4">
            Your privacy is important to us. Please review our 
            <a href="/legal/privacy-policy" className="text-blue-600 hover:underline"> Privacy Policy</a> 
            for details on how we collect, use, and protect your personal information.
          </p>
          <p className="text-gray-700">
            By using our service, you consent to the collection and use of your information 
            as described in our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Dispute Resolution</h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">Customer Service</h3>
          <p className="text-gray-700 mb-4">
            For any issues or disputes, first contact our customer service team at 
            <a href="mailto:support@theneatlyapp.com" className="text-blue-600"> support@theneatlyapp.com</a>. 
            We aim to resolve issues within 48 hours.
          </p>

          <h3 className="text-xl font-medium text-gray-900 mb-3">Governing Law</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              These terms are governed by English law. Any disputes will be subject to the 
              exclusive jurisdiction of the courts of England and Wales. For qualifying disputes, 
              you may also use the Online Dispute Resolution platform provided by the European Commission.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to These Terms</h2>
          <p className="text-gray-700 mb-4">
            We may update these terms from time to time to reflect changes in our service, 
            legal requirements, or business practices. We will notify you of significant 
            changes via email or platform notification.
          </p>
          <p className="text-gray-700">
            Continued use of the platform after changes take effect constitutes acceptance 
            of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Get in Touch</h4>
            <div className="space-y-2 text-gray-700">
              <p><strong>General Inquiries:</strong> <a href="mailto:info@theneatlyapp.com" className="text-blue-600">info@theneatlyapp.com</a></p>
              <p><strong>Customer Support:</strong> <a href="mailto:support@theneatlyapp.com" className="text-blue-600">support@theneatlyapp.com</a></p>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-600 text-center">
            These Terms of Service were last updated on {new Date().toLocaleDateString('en-GB')}. 
            <br />
            Thank you for choosing neatly for your cleaning needs.
          </p>
        </div>
      </div>
    </div>
  )
}