'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { CheckCircle } from 'lucide-react'; // Optional icon for success

// In a real app, this data would come from params or context after checkout
const mockOrder = {
  orderNumber: "ORD-20251218-001234",
  date: "December 18, 2025",
  email: "customer@example.com",
  total: 209.97,
  items: [
    { title: "Wireless Headphones", quantity: 1, price: 49.99 },
    { title: "True Wireless Earbuds", quantity: 2, price: 79.99 },
  ],
  shippingAddress: {
    name: "John Doe",
    address: "123 Tech Street, Suite 100",
    city: "New York, NY 10001",
    country: "United States",
  },
  paymentMethod: "Credit Card ending in •••• 4242",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-xl text-gray-600">
            Your order has been successfully placed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">
            Order #{mockOrder.orderNumber}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Order Details</h3>
              <dl className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <dt>Order Date:</dt>
                  <dd>{mockOrder.date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Total Amount:</dt>
                  <dd className="font-medium">${mockOrder.total.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Payment Method:</dt>
                  <dd>{mockOrder.paymentMethod}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Shipping To</h3>
              <address className="not-italic text-gray-700">
                {mockOrder.shippingAddress.name}<br />
                {mockOrder.shippingAddress.address}<br />
                {mockOrder.shippingAddress.city}<br />
                {mockOrder.shippingAddress.country}
              </address>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Items Ordered</h3>
            <ul className="space-y-4">
              {mockOrder.items.map((item, idx) => (
                <li key={idx} className="flex justify-between py-4 border-t border-gray-100 first:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-900">
            <strong>We've sent a confirmation email</strong> to{' '}
            <span className="font-medium">{mockOrder.email}</span> with your order details and tracking information (when available).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <div className="text-sm text-gray-600">
            <p>
              Need help?{' '}
              <Link href="/contact" className="underline underline-offset-4 hover:text-gray-900">
                Contact us
              </Link>
            </p>
            <p className="mt-2">
              View your orders in{' '}
              <Link href="/account/orders" className="underline underline-offset-4 hover:text-gray-900">
                My Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}