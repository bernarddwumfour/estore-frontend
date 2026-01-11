export default function ReturnsPolicy() {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 ">Returns & Refunds Policy</h1>
          <div className="bg-white border border-gray-100 rounded-lg p-8 md:p-12 prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 25, 2025</p>
  
            <p className="mb-6">
              We want you to love your purchase! If you're not completely satisfied, we're here to help.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">30-Day Return Window</h2>
            <p className="mb-6">
              You have 30 days from the date of delivery to return most items for a full refund.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Item must be unused, in original packaging, with tags attached</li>
              <li>Original proof of purchase required</li>
              <li>Final sale items are not eligible for return</li>
            </ul>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Free Return Shipping</h2>
            <p className="mb-6">
              We provide a prepaid return label for all eligible returns within the US.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Refund Process</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Refunds issued to original payment method</li>
              <li>Processing time: 5-10 business days after we receive the item</li>
              <li>Original shipping fees are non-refundable</li>
            </ul>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Exchanges</h2>
            <p className="mb-6">
              We do not offer direct exchanges. Please return the item and place a new order.
            </p>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">How to Return</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 mb-6">
              <li>Log into your account and go to Order History</li>
              <li>Select the item(s) you wish to return</li>
              <li>Print the prepaid return label</li>
              <li>Drop off at your nearest carrier location</li>
            </ol>
  
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Contact Us</h2>
            <p>
              Need help? Email{' '}
              <a href="mailto:returns@shophub.com" className="text-blue-600 hover:underline">
                returns@shophub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }