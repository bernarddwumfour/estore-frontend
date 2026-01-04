'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/app/lib/store/cart-store';
import { Trash } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart is Empty</h1>
          <p className="text-lg text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart ({getTotalItems()})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-6 pb-6 border-b border-gray-100 last:border-0">
                    <div className="relative size-32 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      <Image
                        width={88}
                        height={88}
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.imageUrl}`}
                        alt={item.title}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Color: {'N/A'}</p>
                          <p className="text-sm font-medium text-gray-900 mt-2">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>

                        <p className="text-lg font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center gap-3 justify-between">
                        <div className="flex gap-3">
                          <button
                            className="h-9 w-9 border border-gray-300 rounded-sm text-lg font-medium hover:bg-gray-50"
                            onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="text-lg font-medium w-12 text-center">{item.quantity}</span>
                          <button
                            className="h-9 w-9 border border-gray-300 rounded-sm text-lg font-medium hover:bg-gray-50"
                            onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <Button
                          variant={"ghost"}
                          className='text-destructive hover:text-desctructive'
                          onClick={() => removeItem(item.sku)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </div>

                  </li>
                ))}
              </ul>

              <Button
                onClick={clearCart}
                variant={"ghost"}
                className='text-destructive hover:text-desctructive bg-destructive/10'
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-8 sticky top-32">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                {/* Add shipping/tax/discounts here later */}
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between text-xl font-bold text-gray-900 mb-8">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full py-7 text-lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="mt-6 text-center">
                <Link href="/products" className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}