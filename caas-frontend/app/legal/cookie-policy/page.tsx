export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-GB')} <br />
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
          <div className="bg-blue-50 p-6 rounded-lg mb-4">
            <p className="text-gray-700">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences 
              and helping us understand how you use our service.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">🔧 Essential Cookies</h3>
              <p className="text-gray-700 mb-3">
                These cookies are necessary for the website to function properly. They enable core 
                functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Authentication tokens (keeping you logged in)</li>
                  <li>• Security cookies (preventing fraud)</li>
                  <li>• Load balancing cookies (website performance)</li>
                  <li>• Cookie consent preferences</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Legal Basis:</strong> Legitimate interest (essential for service provision)
                </p>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">📊 Analytics Cookies</h3>
              <p className="text-gray-700 mb-3">
                These cookies help us understand how visitors interact with our website by 
                collecting and reporting information anonymously.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Google Analytics (website usage statistics)</li>
                  <li>• Page view tracking</li>
                  <li>• Session duration measurement</li>
                  <li>• Error tracking and reporting</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Legal Basis:</strong> Consent (you can opt-out)
                </p>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">🎯 Functional Cookies</h3>
              <p className="text-gray-700 mb-3">
                These cookies enable enhanced functionality and personalization, such as 
                remembering your preferences and providing personalized content.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Language and region preferences</li>
                  <li>• Theme settings (dark/light mode)</li>
                  <li>• Recently viewed services</li>
                  <li>• Form data retention</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Legal Basis:</strong> Consent (you can disable these)
                </p>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">🛒 Marketing Cookies</h3>
              <p className="text-gray-700 mb-3">
                These cookies track your activity across websites to deliver more relevant 
                advertising and marketing messages.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Facebook Pixel (social media advertising)</li>
                  <li>• Google Ads conversion tracking</li>
                  <li>• Retargeting campaigns</li>
                  <li>• Email campaign tracking</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Legal Basis:</strong> Consent (you can opt-out at any time)
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use various third-party services that may set their own cookies. These services 
            have their own privacy policies governing the use of your information:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Google Services</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Google Analytics:</strong> Website analytics and reporting</li>
                <li>• <strong>Google Ads:</strong> Online advertising and conversion tracking</li>
                <li>• <strong>reCAPTCHA:</strong> Spam and abuse prevention</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">
                  Google Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Payment Processing</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Stripe:</strong> Secure payment processing</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline">
                  Stripe Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Social Media</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Facebook:</strong> Social media integration and advertising</li>
                <li>• <strong>Twitter:</strong> Social media sharing</li>
                <li>• <strong>LinkedIn:</strong> Professional networking features</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                Links to respective privacy policies available on each platform
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-3">🔧 Cookie Settings</h3>
              <p className="text-gray-700 mb-4">
                You can manage your cookie preferences at any time by clicking the "Cookie Settings" 
                button at the bottom of our website or using the button below:
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Manage Cookie Preferences
              </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-3">🌐 Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                You can also control cookies through your browser settings. Here's how to do it in popular browsers:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Desktop Browsers</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Chrome:</strong> Settings → Privacy → Cookies</li>
                    <li>• <strong>Firefox:</strong> Settings → Privacy → Cookies</li>
                    <li>• <strong>Safari:</strong> Preferences → Privacy</li>
                    <li>• <strong>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mobile Browsers</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>iOS Safari:</strong> Settings → Safari → Privacy</li>
                    <li>• <strong>Android Chrome:</strong> Settings → Site settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-3">⚠️ Important Note</h3>
              <p className="text-gray-700">
                Disabling certain cookies may impact the functionality of our website. Essential cookies 
                are required for the website to work properly and cannot be disabled without affecting 
                your ability to use our service.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-medium">Cookie Type</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Retention Period</th>
                  <th className="border border-gray-300 p-3 text-left font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">Session Cookies</td>
                  <td className="border border-gray-300 p-3">Until browser closes</td>
                  <td className="border border-gray-300 p-3">Temporary functionality</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 p-3">Authentication</td>
                  <td className="border border-gray-300 p-3">30 days</td>
                  <td className="border border-gray-300 p-3">Keep you logged in</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">Analytics</td>
                  <td className="border border-gray-300 p-3">2 years</td>
                  <td className="border border-gray-300 p-3">Usage analysis</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 p-3">Marketing</td>
                  <td className="border border-gray-300 p-3">1 year</td>
                  <td className="border border-gray-300 p-3">Advertising optimization</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">Preferences</td>
                  <td className="border border-gray-300 p-3">1 year</td>
                  <td className="border border-gray-300 p-3">Remember your settings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">
            Under UK GDPR and other applicable privacy laws, you have the following rights regarding cookies:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Consent</h4>
              <p className="text-sm text-gray-700">Give or withdraw consent for non-essential cookies</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔍 Access</h4>
              <p className="text-sm text-gray-700">Know what cookies are stored on your device</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🗑️ Deletion</h4>
              <p className="text-sm text-gray-700">Delete cookies from your browser at any time</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📝 Information</h4>
              <p className="text-sm text-gray-700">Receive clear information about our cookie use</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our use of cookies 
            or applicable laws. When we make significant changes, we will notify you by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Updating the "Last Updated" date at the top of this policy</li>
            <li>Displaying a notification on our website</li>
            <li>Sending an email notification (for registered users)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:support@theneatlyapp.com" className="text-blue-600">support@theneatlyapp.com</a></p>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-600 text-center">
            This Cookie Policy was last updated on {new Date().toLocaleDateString('en-GB')}.
            <br />
            For more information about how we protect your privacy, please see our 
            <a href="/legal/privacy-policy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}