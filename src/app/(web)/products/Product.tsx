'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus, Star, Tag, BadgePercent, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import React from 'react'
import Image from 'next/image'
import { ProductType } from '@/types/productTypes'


const Product = ({ product }: {product:ProductType}) => {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const isInCart = useCartStore((state) => state.isInCart)
  const getItemQuantity = useCartStore((state) => state.getItemQuantity)

  const defaultVariant = product.default_variant
  const hasDefaultVariant = defaultVariant !== null
  const hasDiscount = hasDefaultVariant && defaultVariant.discounted_price < defaultVariant.price
  const discountPercentage = hasDefaultVariant && hasDiscount
    ? Math.round(((defaultVariant.price - defaultVariant.discounted_price) / defaultVariant.price) * 100)
    : 0

  // Get the first/main image from default variant
  const mainImage = hasDefaultVariant && defaultVariant.images?.length > 0
    ? defaultVariant.images.find(img => img.type === 'main') || defaultVariant.images[0]
    : null

  const inCart = isInCart(product.default_variant?.sku!)
  const quantity = getItemQuantity(product.default_variant?.sku!)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!hasDefaultVariant || defaultVariant.stock <= 0) return

    addItem({
      id: product.id,
      slug: product.slug,
      sku: defaultVariant.sku,
      title: product.title,
      price: defaultVariant.discounted_price || defaultVariant.price,
      imageUrl: mainImage?.url || '', // Use the image URL
      quantity: 1,
      originalPrice: defaultVariant.price,
      attributes: defaultVariant.attributes,
      variantId : defaultVariant.id
    })
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    handleAddToCart(e)
    router.push("/checkout")
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.default_variant?.sku!, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity <= 1) {
      removeItem(product.default_variant?.sku!)
    } else {
      updateQuantity(product.default_variant?.sku!, quantity - 1)
    }
  }

  return (
    <li className="group relative block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {/* {product.is_new && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              <Sparkles className="h-3 w-3" />
              New
            </span>
          )}
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
              <Star className="h-3 w-3" />
              Featured
            </span>
          )}
          {product.is_bestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <Tag className="h-3 w-3" />
              Bestseller
            </span>
          )} */}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-white">
              <BadgePercent className="h-4 w-4" />
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {product.category.name}
          </span>
        </div>

        {/* Product Image */}
        <div className="relative  w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {mainImage && mainImage.url ? (
            <Image
              src={`${mainImage.url}`}
              alt={mainImage.alt_text || product.title}
              fill
              className="object-cover scale-100 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={product.is_featured || product.is_bestseller}
            />
          ) : (
            // Fallback when no image
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm text-gray-500">No Image</p>
              </div>
            </div>
          )}

          {/* Image count badge */}
          {hasDefaultVariant && defaultVariant.images?.length > 1 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              +{defaultVariant.images.length - 1}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Product Title & Save Amount */}
          <div className='flex justify-between w-full pb-2'>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {product.title}
            </h3>
            {hasDiscount && (
              <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                Save ${(defaultVariant.price - defaultVariant.discounted_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div>
            {hasDefaultVariant ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ${defaultVariant.discounted_price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    ${defaultVariant.price.toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No variants available
              </div>
            )}

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.average_rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-300 text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                {product.average_rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({product.total_reviews} reviews)
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-4">
            {hasDefaultVariant ? (
              product.total_stock > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    {product.total_stock} in stock
                  </span>
                </div>
              ) : (
                <p className="text-sm font-medium text-red-600">Out of stock</p>
              )
            ) : (
              <p className="text-sm font-medium text-amber-600">No stock available</p>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="border-t border-gray-100 p-5">
        <div className="flex items-center gap-3">
          {hasDefaultVariant && defaultVariant.stock > 0 ? (
            !inCart ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDecrement}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <span className="text-sm font-medium">{quantity} in cart</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleIncrement}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )
          ) : (
            <Button
              type="button"
              className="flex-1"
              disabled
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {hasDefaultVariant ? 'Out of Stock' : 'Unavailable'}
            </Button>
          )}

          {hasDefaultVariant && defaultVariant.stock > 0 && (
            <Button
              variant="outline"
              className="flex-shrink-0"
              onClick={handleBuyNow}
              aria-label="Buy now"
            >
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

export default Product