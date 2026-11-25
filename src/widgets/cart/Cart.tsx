'use client'

import { storefrontTheme } from '@/templates/storefront-theme'
import { storefrontProductName } from '@/templates/product-name'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/app/lib/store/cart-store'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface CartProps {
  cartopen: boolean
  setcartopen: (open: boolean) => void
}

export default function Cart({ cartopen, setcartopen }: CartProps) {
  const cartRef = useRef<HTMLDivElement>(null)
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({})

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore()

  // Toggle bundle expansion
  const toggleBundle = (sku: string) => {
    setExpandedBundles(prev => ({ ...prev, [sku]: !prev[sku] }))
  }

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setcartopen(false)
      }
    }

    if (cartopen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [cartopen, setcartopen])

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (cartopen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [cartopen])

  if (!cartopen) return null

  const fashion = storefrontTheme === 'fashion-surface'

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" />
      <div data-storefront-theme={storefrontTheme} ref={cartRef} className={`absolute top-12 sm:-right-0 -right-35 w-screen max-w-md border border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8 z-50 ${storefrontTheme === "fashion-surface" ? "rounded-xl shadow-xl" : ""}`}
        aria-modal="true"
        role="dialog">
        {/* Close button */}
        <button
          className="absolute end-4 top-4 text-gray-600 transition hover:scale-110"
          onClick={() => setcartopen(false)}
        >
          <span className="sr-only">Close cart</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className={`mt-8 max-h-[65vh] overflow-y-auto ${fashion ? "pr-1" : ""}`}>
          {fashion && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ad8a60]">Your selection</p>}
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className={`text-lg font-medium text-gray-900 ${fashion ? "!text-2xl !font-semibold tracking-tight" : ""}`}>
              Your Cart ({getTotalItems()})
            </h2>
            {items.length > 0 && <button type="button" onClick={() => { clearCart(); setcartopen(false) }} className="shrink-0 cursor-pointer text-xs font-medium text-gray-500 underline underline-offset-4 transition hover:text-red-600">Clear Cart</button>}
          </div>

          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={() => setcartopen(false)}
                className="mt-4 cursor-pointer text-sm text-gray-600 underline underline-offset-4 transition hover:text-gray-900"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.variantId || item.sku} className={`flex items-start gap-4 ${fashion ? "rounded-lg border border-[#eee9e2] bg-[#faf8f5] p-3" : ""}`}>
                    <Link href={!item.isBundle ? `/products/${item.slug}` : `/promotions/${item.slug}`} className="relative size-22 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      <Image
                        width={88}
                        height={88}
                        src={`${item.imageUrl}`}
                        alt={storefrontProductName(item.title, item.attributes)}
                        className="object-cover h-full w-full"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {storefrontProductName(item.title, item.attributes)}
                        </h3>
                        {item.isBundle && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                            Bundle
                          </span>
                        )}
                      </div>

                      <dl className="mt-1 space-y-1 text-xs text-gray-600">
                        <div>
                          <dt className="inline font-medium">Price:</dt>
                          <dd className="inline ml-1">{formatCurrency(item.price)}</dd>
                        </div>
                        {item.quantity > 1 && <div>
                          <dt className="inline font-medium">Total:</dt>
                          <dd className="inline ml-1 font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</dd>
                        </div>}
                      </dl>

                      {/* Bundle Items Section */}
                      {item.isBundle && item.bundleItems && item.bundleItems.length > 0 && (
                        <div className="mt-2 pt-2">
                          <button
                            onClick={() => toggleBundle(item.sku)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {expandedBundles[item.sku] ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                            <span>{item.bundleItems.length} items in bundle</span>
                          </button>

                          {expandedBundles[item.sku] && (
                            <div className="mt-2 space-y-2 pl-2 border-l-2 border-amber-200">
                              {item.bundleItems.map((bundleItem, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    {bundleItem.imageUrl && (
                                      <img
                                        src={bundleItem.imageUrl}
                                        alt={bundleItem.title}
                                        className="w-6 h-6 object-cover rounded"
                                      />
                                    )}
                                    <span className="text-gray-600">
                                      {bundleItem.title} x{bundleItem.quantity}
                                    </span>
                                  </div>
                                  {bundleItem.price > 0 && (
                                    <span className="text-gray-500">
                                      {formatCurrency(bundleItem.price * bundleItem.quantity)}
                                    </span>
                                  )}
                                  {bundleItem.price === 0 && (
                                    <span className="text-emerald-600 text-xs font-medium">FREE</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-1">
                        <button
                          className="h-5 w-5 border border-gray-300 rounded-sm text-sm font-medium transition hover:bg-gray-50"
                          onClick={() => updateQuantity(item.variantId || item.sku, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="h-5 w-5 border border-gray-300 rounded-sm text-sm font-medium transition hover:bg-gray-50"
                          onClick={() => updateQuantity(item.variantId || item.sku, item.quantity + 1)}
                        >
                          +
                        </button>
                      <button
                        className="ml-auto cursor-pointer text-gray-600 transition hover:text-red-600"
                          onClick={() => removeItem(item.variantId || item.sku)}
                      >
                        <span className="sr-only">Remove item</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                        </svg>
                      </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Total & Actions */}
              <div className="mt-4 border-t border-gray-200 pt-2">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
                  <p>Subtotal</p>
                  <p>{formatCurrency(getTotalPrice())}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                  <Link
                    href="/cart"
                    className={`block shrink-0 text-center rounded-sm border border-gray-600 px-5 py-3 text-sm text-gray-600 transition hover:bg-gray-50 ${fashion ? "!rounded-md !border-[#d9cfc2] !text-[#24211f] hover:!bg-[#f2eee8]" : ""}`}
                    onClick={() => setcartopen(false)}
                  >
                    View my cart ({getTotalItems()})
                  </Link>

                  <Link
                    href="/checkout"
                    className={`block min-w-0 flex-1 text-center rounded-sm bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600 ${fashion ? "!rounded-md !bg-[#ad8a60] !font-semibold !text-white hover:!bg-[#92704a]" : ""}`}
                    onClick={() => setcartopen(false)}
                  >
                    Checkout
                  </Link>

                  </div>

                  <button
                    onClick={() => setcartopen(false)}
                    className="block w-full cursor-pointer text-center text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-600"
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
