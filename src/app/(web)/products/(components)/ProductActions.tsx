// app/components/Product/ProductActions.tsx
'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useRouter } from "next/navigation"
import React, { useState } from 'react'
import { ProductType, ProductVariantImage } from '@/types/productTypes'
import BuyNowCartDialog from '@/components/storefront/BuyNowCartDialog'

interface ProductActionsProps {
  product: ProductType
  defaultVariant: ProductType['default_variant']
  hasDefaultVariant: boolean
  mainImage: ProductVariantImage | null
  hasDiscount: boolean
}

// Helper to check if variant is available for purchase
const isVariantAvailable = (variant: ProductType['default_variant']): boolean => {
  if (!variant) return false
  // Use is_in_stock flag (public) instead of stock count
  return variant.is_in_stock === true
}

// Helper to get disabled button text
const getDisabledButtonText = (variant: ProductType['default_variant'], hasDefaultVariant: boolean): string => {
  if (!hasDefaultVariant) return 'Unavailable'
  if (variant?.stock_status === 'out_of_stock') return 'Out of Stock'
  if (variant?.stock_status === 'low_stock') return 'Limited Stock'
  return 'Unavailable'
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

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const variantAvailable = isVariantAvailable(defaultVariant)
  const cartKey = defaultVariant?.id || defaultVariant?.sku || ''
  const inCart = isInCart(cartKey)
  const quantity = getItemQuantity(cartKey)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantAvailable || !defaultVariant) return

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

    if (!variantAvailable || !defaultVariant) return
    const hasOtherItems = items.some(item => item.variantId !== defaultVariant.id)
    handleAddToCart(e)
    if (hasOtherItems) setIsDialogOpen(true)
    else router.push("/checkout")
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant) return
    updateQuantity(defaultVariant.id || defaultVariant.sku, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant) return
    const key = defaultVariant.id || defaultVariant.sku
    if (quantity <= 1) {
      removeItem(key)
    } else {
      updateQuantity(key, quantity - 1)
    }
  }

  const disabledButtonText = getDisabledButtonText(defaultVariant, hasDefaultVariant)

  return (
    <div className="border-t border-gray-100 py-5">
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-3">
        {variantAvailable ? (
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
            <div className="flex items-center justify-between w-full bg-gray-50 rounded-full border border-gray-200 px-3 py-1">
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
            {disabledButtonText}
          </Button>
        )}

        {variantAvailable && <Button variant="outline" className="flex-shrink-0" onClick={handleBuyNow} aria-label="Buy now">Buy Now</Button>}
      </div>
      <BuyNowCartDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}

export default ProductActions
