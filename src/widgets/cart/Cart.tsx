'use client'


import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/app/lib/store/cart-store'

interface CartProps {
  cartopen: boolean
  setcartopen: (open: boolean) => void
}

export default function Cart({ cartopen, setcartopen }: CartProps) {
  const cartRef = useRef<HTMLDivElement>(null)
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore()


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

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" />
      <div ref={cartRef} className="absolute top-12 sm:right-0 -right-18 w-screen max-w-md border border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8 z-50"
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

        <div className="mt-8 max-h-[60vh] overflow-y-scroll">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Your Cart ({getTotalItems()})
          </h2>

          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={() => setcartopen(false)}
                className="mt-4 text-sm text-gray-600 underline underline-offset-4 transition hover:text-gray-900"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-4">
                    <Link href={`/products/${item.id}`} className="relative size-22 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      <Image
                        width={88}
                        height={88}
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover h-full w-full"
                      />
                    </Link>

                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <dl className="mt-1 space-y-1 text-xs text-gray-600">
                        <div>
                          <dt className="inline font-medium">Price:</dt>
                          <dd className="inline ml-1">${item.price.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Total:</dt>
                          <dd className="inline ml-1 font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </dd>
                        </div>
                      </dl>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-1">
                        <button
                          className="h-5 w-5 border border-gray-300 rounded-sm text-sm font-medium transition hover:bg-gray-50"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="h-5 w-5 border border-gray-300 rounded-sm text-sm font-medium transition hover:bg-gray-50"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        className="mt-2 text-gray-600 transition hover:text-red-600"
                        onClick={() => removeItem(item.sku)}
                      >
                        <span className="sr-only">Remove item</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Total & Actions */}
              <div className="mt-4 border-t border-gray-200 pt-2">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
                  <p>Subtotal</p>
                  <p>${getTotalPrice().toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/cart"
                    className="block text-center rounded-sm border border-gray-600 px-5 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
                    onClick={() => setcartopen(false)}
                  >
                    View my cart ({getTotalItems()})
                  </Link>

                  <Link
                    href="/checkout"
                    className="block text-center rounded-sm bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
                    onClick={() => setcartopen(false)}
                  >
                    Checkout
                  </Link>

                  <button
                    onClick={() => {
                      clearCart()
                      setcartopen(false)
                    }}
                    className="w-full text-center rounded-sm border border-red-200 px-5 py-3 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Clear Cart
                  </button>

                  <button
                    onClick={() => setcartopen(false)}
                    className="block w-full text-center text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-600"
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