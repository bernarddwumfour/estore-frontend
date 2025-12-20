'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Bookmark, ShoppingCart, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Product = ({ product }: { product: any }) => {
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const isInCart = useCartStore((state) => state.isInCart)
  const getItemQuantity = useCartStore((state) => state.getItemQuantity)

  const inCart = isInCart(product.id)
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.images[0],
      quantity: 1,
      originalPrice: product.originalPrice,
    })
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity <= 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Bookmark logic here
    console.log('Bookmarked:', product.id)
  }

  return (
    <li className="group relative block overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        {/* Wishlist Button */}
        <button
          className="absolute end-4 top-4 z-10 rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // Wishlist logic
          }}
          aria-label="Add to wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Product Image */}
        <Image
          width={400}
          height={400}
          src={product.images[0]}
          alt={product.title}
          className="h-[350px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[300px]"
        />

        {/* Card Content */}
        <div className="relative border border-gray-100 bg-white p-6">
          <p className="text-gray-700">
            ${product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="text-gray-400 line-through ml-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </p>
          <h3 className="mt-1.5 text-lg font-medium text-gray-900">{product.title}</h3>
          <p className="mt-1.5 line-clamp-3 text-gray-500 text-sm">{product.description}</p>
        </div>
      </Link>

      {/* Action Area - Outside the Link */}
      <div className="relative border border-gray-100 bg-white p-6 pt-0 -mt-6">
        <div className="mt-4 flex items-center gap-3">
          {/* Show Add to Cart Button if not in cart */}
          {!inCart ? (
            <Button
              type="button"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 size-4" />
              Add To Cart
            </Button>
          ) : (
            /* Quantity Controls when in cart */
            <div className="flex items-center justify-between w-full bg-gray-50 rounded-lg border border-gray-200 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleDecrement}
              >
                <Minus className="h34 w34" />
              </Button>

              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">{quantity} in cart</span>
                {/* <span className="text-xs text-gray-500">
                  ${(quantity * product.price).toFixed(2)}
                </span> */}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleIncrement}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={handleBookmark}
            aria-label="Bookmark"
          >
            <Bookmark className="size-5" />
          </Button>
        </div>
      </div>
    </li>
  )
}

export default Product