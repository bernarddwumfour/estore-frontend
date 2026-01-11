export default function PrivacyPolicy() {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 ">Privacy Policy</h1>
          <div className="bg-white border border-gray-100 rounded-lg p-8 md:p-12 prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 25, 2025</p>
  
            <p className="mb-6">
              At ShopHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Personal information you provide (name, email, shipping address, phone number, payment details)</li>
              <li>Automatically collected data (IP address, browser type, device information, cookies)</li>
              <li>Order and browsing history</li>
            </ul>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your purchases and account</li>
              <li>To improve our website and customer experience</li>
              <li>To send promotional emails (you can opt out anytime)</li>
              <li>To prevent fraud and enhance security</li>
            </ul>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Data Security</h2>
            <p className="mb-6">
              We use industry-standard encryption (SSL) and secure payment processors (Stripe) to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Third-Party Sharing</h2>
            <p className="mb-6">
              We do not sell your personal information. We may share data with trusted partners for shipping, payment processing, and analytics.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Access, update, or delete your personal data</li>
              <li>Opt out of marketing emails</li>
              <li>Request data portability</li>
            </ul>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Cookies</h2>
            <p className="mb-6">
              We use cookies to improve your experience, remember cart items, and analyze traffic. You can disable cookies in your browser settings.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Contact Us</h2>
            <p>
              If you have questions about this policy, please contact us at{' '}
              <a href="mailto:privacy@shophub.com" className="text-blue-600 hover:underline">
                privacy@shophub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }