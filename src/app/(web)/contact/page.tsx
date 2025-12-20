import { Button } from '@/components/ui/button';
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="py-6 pb-12">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-600">We'd love to hear from you. Whether you have a question about products, orders, or anything else, our team is ready to help.
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white border border-gray-100 rounded-lg p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Order inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full py-6 text-lg">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-12">
            {/* Contact Details */}
            <div className='py-6'>
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Get in touch</h2>
              <div className="space-y-6 grid grid-cols-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">
                    123 Tech Street , Suite 100<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>


                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">support@yourstore.com</p>
                  <p className="text-gray-600">sales@yourstore.com</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Mon–Fri: 9am–6pm EST</p>
                </div>


              </div>
            </div>

            {/* Optional: Simple Map Placeholder */}
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <div className="relative min-h-96 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Map Placeholder</p>
                {/* In real app, embed Google Maps or use an image */}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}