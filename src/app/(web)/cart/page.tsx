'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/app/lib/store/cart-store';
import { Trash, Package, ChevronDown, ChevronUp, Gift, ShoppingCart, Home } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  const toggleBundle = (sku: string) => {
    setExpandedBundles(prev => ({ ...prev, [sku]: !prev[sku] }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full h-12 text-base">
                <Link href="/products"><Home className="mr-2 h-5 w-5" /> Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl space-y-4 pb-6">
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
            Your Cart ({getTotalItems()})
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Checkout These Items To{" "}
            <span className="text-slate-950 relative inline-block">
              Make A Purchase.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.sku} className="flex flex-col gap-4 pb-6 border-b border-gray-100 last:border-0">
                    {/* Main Item Row */}
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        <Image
                          width={96}
                          height={96}
                          src={item.imageUrl}
                          alt={item.title}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 text-base">
                                {item.title}
                              </h3>
                              {item.isBundle && (
                                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                  Bundle
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.attributes && Object.entries(item.attributes).length > 0
                                ? Object.entries(item.attributes).map(([key, val]) => `${key}: ${val}`).join(', ')
                                : 'Standard'
                              }
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>

                          <p className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls and Actions */}
                        <div className="mt-4 flex items-center gap-4 justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              className="h-8 w-8 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition"
                              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="font-medium w-12 text-center">{item.quantity}</span>
                            <button
                              className="h-8 w-8 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition"
                              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.sku)}
                          >
                            <Trash size={16} className="mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bundle Items Section */}
                    {item.isBundle && item.bundleItems && item.bundleItems.length > 0 && (
                      <div className="ml-6 sm:ml-28">
                        <button
                          onClick={() => toggleBundle(item.sku)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {expandedBundles[item.sku] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          <span>{item.bundleItems.length} items in this bundle</span>
                        </button>

                        {expandedBundles[item.sku] && (
                          <div className="mt-3 space-y-2 pl-3 border-l-2 border-amber-200">
                            {item.bundleItems.map((bundleItem, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-3">
                                  {bundleItem.imageUrl && (
                                    <img
                                      src={bundleItem.imageUrl}
                                      alt={bundleItem.title}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{bundleItem.title}</p>
                                    <p className="text-xs text-gray-500">Qty: {bundleItem.quantity}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {bundleItem.price > 0 ? (
                                    <p className="text-sm font-medium text-gray-900">
                                      ${(bundleItem.price * bundleItem.quantity).toFixed(2)}
                                    </p>
                                  ) : (
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      FREE
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex justify-start">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium text-gray-900">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between text-xl font-bold text-gray-900 mb-8">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-12 text-base">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="mt-6 text-center">
                <Link href="/products" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4">
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