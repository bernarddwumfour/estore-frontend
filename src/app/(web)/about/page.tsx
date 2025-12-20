import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe great technology should be accessible, reliable, and beautifully designed. 
            That's why we curate and offer only the best gadgets and accessories that make your everyday life better.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Quality First</h3>
              <p className="text-gray-600">
                Every product we carry is carefully tested and selected to meet the highest standards of performance and durability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Customer Focused</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We offer fast shipping, easy returns, and real human support whenever you need it.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">Innovation Driven</h3>
              <p className="text-gray-600">
                We stay ahead of the curve, bringing you the latest and most innovative tech that enhances your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Founded in 2020, we started as a small team of tech enthusiasts frustrated with the overwhelming choices and inconsistent quality in the online gadget market.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We set out to change that — to create a store where customers could find only the very best products, backed by honest reviews, clear information, and exceptional service.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, we've grown into a trusted destination for thousands of customers looking for premium headphones, smartwatches, gaming gear, and everyday tech essentials — all with the same commitment to quality and care.
              </p>
            </div>

            <div className="relative h-96 lg:h-full min-h-96 rounded-lg overflow-hidden border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                alt="Our team working together"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team / Closing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built for You</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            We're more than just a store — we're your partner in discovering great technology. 
            Thank you for trusting us with your tech needs. We're excited to continue growing with you.
          </p>
          <Button size="lg" asChild>
            <a href="/products">Shop Our Products</a>
          </Button>
        </div>
      </section>
    </div>
  );
}