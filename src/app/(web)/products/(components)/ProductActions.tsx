// app/components/Product/ProductActions.tsx
'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus, Trash, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import React, { useState } from 'react' // Added useState
import { ProductType } from '@/types/productTypes'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import Image from 'next/image'
import Link from 'next/link'

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
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  // Added: State for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  // Added: Function to handle opening dialog with add to cart
  const handleOpenDialogWithAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // First add the product to cart
    handleAddToCart(e)
    
    // Then open the dialog
    setIsDialogOpen(true)
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
          <>
            {items.length == 0 ? <Button
              variant="outline"
              className="flex-shrink-0"
              onClick={handleBuyNow}
              aria-label="Buy now"
            >
              Buy Now
            </Button> :
              // Changed: Use state-controlled dialog
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    // Changed: Use new function that adds to cart then opens dialog
                    onClick={handleOpenDialogWithAddToCart}
                    aria-label="Buy now"
                  >
                    Buy Now
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[600px]'>
                  {/* Removed: AddProductToCart component */}
                  <DialogTitle>
                    You are about to Checkout with these items in cart.
                  </DialogTitle>
                  <DialogDescription>
                    Please check the products in you cart , edit them if needed and proceed to checkout once you're done.
                  </DialogDescription>
                  <>
                    <ul className="space-y-6">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-start gap-4">
                          <Link href={`/products/${item.slug}`} className="relative size-22 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                            <Image
                              width={88}
                              height={88}
                              src={`${item.imageUrl}`}
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
                              <Trash2 className='w-4'/>
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
                          href="/checkout"
                          className="block text-center rounded-sm bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
                        >
                          Checkout
                        </Link>

                        <DialogClose className='flex justify-center w-full'>
                          <button
                            className="block  cursor-pointer w-full text-center text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-600"
                          >
                            Continue shopping
                          </button>
                        </DialogClose>

                      </div>
                    </div></>
                </DialogContent>
              </Dialog>}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductActions