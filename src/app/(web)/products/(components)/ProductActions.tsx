// app/components/Product/ProductActions.tsx
'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useRouter } from "next/navigation"
import React from 'react'
import { ProductType } from '@/types/productTypes'

interface ProductActionsProps {
  product: ProductType
  defaultVariant: ProductType['default_variant']
  hasDefaultVariant: boolean
  mainImage: any
  hasDiscount: boolean
}

const ProductActions = ({ 
  product, 
  defaultVariant, 
  hasDefaultVariant, 
  mainImage 
}: ProductActionsProps) => {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const isInCart = useCartStore((state) => state.isInCart)
  const getItemQuantity = useCartStore((state) => state.getItemQuantity)
  const items = useCartStore((state) => state.items)


  const inCart = isInCart(defaultVariant?.sku || '')
  const quantity = getItemQuantity(defaultVariant?.sku || '')

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!hasDefaultVariant || !defaultVariant || defaultVariant.stock <= 0) return

    addItem({
      id: product.id,
      slug: product.slug,
      sku: defaultVariant.sku,
      title: product.title,
      price: defaultVariant.discounted_price || defaultVariant.price,
      imageUrl: mainImage?.url || '',
      quantity: 1,
      originalPrice: defaultVariant.price,
      attributes: defaultVariant.attributes,
      variantId: defaultVariant.id
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
    if (!defaultVariant?.sku) return
    updateQuantity(defaultVariant.sku, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant?.sku) return
    if (quantity <= 1) {
      removeItem(defaultVariant.sku)
    } else {
      updateQuantity(defaultVariant.sku, quantity - 1)
    }
  }

  return (
    <div className="border-t border-gray-100 p-5">
      <div className="flex items-center gap-3">
        {hasDefaultVariant && defaultVariant && defaultVariant.stock > 0 ? (
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

        {hasDefaultVariant && defaultVariant && defaultVariant.stock > 0 && (
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
  )
}

export default ProductActions