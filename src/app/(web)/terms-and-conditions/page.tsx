export default function TermsOfService() {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 ">Terms & Conditions</h1>
          <div className="bg-white border border-gray-100 rounded-lg p-8 md:p-12 prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 25, 2025</p>
  
            <p className="mb-6">
              Welcome to ShopHub. By accessing or using our website, you agree to be bound by these Terms & Conditions.
            </p>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Use of Our Site</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>You must be 18 years or older to make a purchase</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the site for any unlawful purpose</li>
            </ul>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Orders & Payment</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>All prices are in USD and include applicable taxes</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Payment is processed securely via Stripe</li>
            </ul>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Product Information</h2>
            <p className="mb-6">
              We strive for accuracy in product descriptions and images, but cannot guarantee they are error-free. Colors may vary due to monitor settings.
            </p>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Intellectual Property</h2>
            <p className="mb-6">
              All content on this site (images, text, logos) is owned by ShopHub or licensed to us and is protected by copyright laws.
            </p>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Limitation of Liability</h2>
            <p className="mb-6">
              ShopHub is not liable for any indirect, incidental, or consequential damages arising from use of our site or products.
            </p>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Governing Law</h2>
            <p className="mb-6">
              These terms are governed by the laws of the United States.
            </p>
  
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:support@shophub.com" className="text-blue-600 hover:underline">
                support@shophub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }