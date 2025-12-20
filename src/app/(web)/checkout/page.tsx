'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Home, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/app/lib/store/cart-store';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Get cart state from Zustand
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax example
  const total = subtotal + shipping + tax;

  // Empty cart state
  if (isMounted && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/products">
                  <Home className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Page Header with Cart Link */}
        <div className="py-6 pb-12">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-12">
            {/* Billing Information */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Billing Information</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </form>

              {/* Shipping same as billing checkbox */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3 h-5 w-5 rounded border-gray-300" />
                  <span className="text-gray-700">Shipping address is the same as billing</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <p className="text-gray-600">Secure payment powered by Stripe</p>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                  <p className="text-gray-700 font-medium">Credit/Debit Card</p>
                  <div className="mt-4 space-y-3">
                    <input placeholder="Card number" className="w-full px-4 py-3 rounded-sm border border-gray-300" />
                    <div className="grid grid-cols-3 gap-3">
                      <input placeholder="MM/YY" className="px-4 py-3 rounded-sm border border-gray-300" />
                      <input placeholder="CVC" className="px-4 py-3 rounded-sm border border-gray-300" />
                      <input placeholder="ZIP" className="px-4 py-3 rounded-sm border border-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-8 sticky top-32">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Link to go back to cart */}
              <div className="mt-4 mb-6">
                <Link
                  href="/cart"
                  className="block w-full text-center text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 transition"
                >
                  ← Return to Cart
                </Link>
              </div>

              <Button size="lg" className="w-full mt-4 py-7 text-lg">
                Place Order
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Secure checkout • 30-day returns • Free shipping on orders over $100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}