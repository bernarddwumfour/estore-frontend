// app/(web)/products/[slug]/ProductDetailInteractive.tsx
'use client';

import { useState, useEffect, useMemo, ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingCart, Minus, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/app/lib/store/cart-store';

// Image Gallery Component
export function ProductImageGallery({ 
  variants,
  defaultVariant 
}: { 
  variants: any[];
  defaultVariant: any;
}) {
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(defaultVariant.images[0]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-gray-100">
        {selectedImage ? (
          <Image
            src={selectedImage.url || '/placeholder.jpg'}
            alt={selectedImage.alt_text}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-sm text-gray-500">Product Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {selectedVariant && selectedVariant.images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {selectedVariant.images.map((img: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${selectedImage === img
                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                : 'border-gray-200 hover:border-gray-400'
                }`}
            >
              <Image src={img.url} alt={img.alt_text} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Product Options Component (with own state)
export function ProductOptions({ 
  product,
  defaultVariant,
  onVariantChange
}: { 
  product: any;
  defaultVariant: any;
  onVariantChange?: (variant: any) => void;
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    defaultVariant.attributes || {}
  );

  // Current selected variant based on options
  const selectedVariant = useMemo(() => {
    return (
      product.variants.find((variant: any) =>
        Object.keys(selectedOptions).every(key => variant.attributes[key] === selectedOptions[key])
      ) || defaultVariant
    );
  }, [selectedOptions, product, defaultVariant]);

  // Notify parent when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // Handle option change
  const handleOptionChange = (optionKey: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  // Check option availability
  const isOptionAvailable = (optionKey: string, value: string) => {
    const testOptions = { ...selectedOptions, [optionKey]: value };
    return product.variants.some((variant: any) =>
      Object.keys(testOptions).every(key => variant.attributes[key] === testOptions[key])
    );
  };

  if (!product.options || Object.keys(product.options).length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 mb-5 py-2">
      <h3 className="text-lg font-medium mb-2">Options</h3>

      {Object.entries(product.options).map(([optionKey, values]) => (
        <div key={optionKey}>
          <h3 className="text-sm font-medium capitalize mb-4">
            {optionKey}:
            <span className="ml-2 font-normal text-gray-700">
              {selectedOptions[optionKey]}
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {(values as string[]).map(value => {
              const available = isOptionAvailable(optionKey, value);
              const selected = selectedOptions[optionKey] === value;

              return (
                <label
                  key={value}
                  className={`
                    px-2 py-1 border rounded-lg text-xs font-medium cursor-pointer transition-all
                    ${selected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : available
                        ? 'border-gray-300 hover:border-gray-500 hover:shadow-sm'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={optionKey}
                    value={value}
                    checked={selected}
                    onChange={() => handleOptionChange(optionKey, value)}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Cart Actions Component (self-contained)
export function CartActions({ 
  product,
  selectedVariant: externalVariant,
  onVariantChange
}: { 
  product: any;
  selectedVariant?: any;
  onVariantChange?: (variant: any) => void;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Internal state for variant if not provided externally
  const [internalSelectedOptions, setInternalSelectedOptions] = useState<Record<string, string>>(
    product.variants.find((v: any) => v.is_default)?.attributes || product.variants[0]?.attributes || {}
  );

  // Determine which variant to use
  const selectedVariant = useMemo(() => {
    // Use external variant if provided
    if (externalVariant) return externalVariant;
    
    // Otherwise calculate from internal state
    return (
      product.variants.find((variant: any) =>
        Object.keys(internalSelectedOptions).every(key => variant.attributes[key] === internalSelectedOptions[key])
      ) || product.variants.find((v: any) => v.is_default) || product.variants[0]
    );
  }, [externalVariant, internalSelectedOptions, product]);

  // Cart store
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cart status for current variant
  const cartItem = isMounted && selectedVariant
    ? items.find(item => item.sku === selectedVariant.sku)
    : null;

  const cartQuantity = cartItem?.quantity || 0;
  const isInCart = cartQuantity > 0;
  const inStock = selectedVariant?.stock > 0;

  // Add to cart
  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return;

    addItem({
      id: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
      title: product.title,
      price: selectedVariant.discounted_price,
      imageUrl: selectedVariant.images[0]?.url || '/placeholder-product.jpg',
      quantity: 1,
      originalPrice: selectedVariant.discount_amount > 0 ? selectedVariant.price : undefined,
      attributes: selectedVariant.attributes,
      variantId: selectedVariant.id
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // Quantity controls
  const handleCartQuantityChange = (delta: number) => {
    if (!selectedVariant) return;

    const newQuantity = cartQuantity + delta;
    if (newQuantity <= 0) {
      removeItem(selectedVariant.sku);
    } else {
      updateQuantity(selectedVariant.sku, newQuantity);
    }
  };

  const handleRemoveFromCart = () => {
    if (!selectedVariant) return;
    removeItem(selectedVariant.sku);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {!isInCart ? (
        <Button
          size="lg"
          className="w-full py-8 text-lg font-medium"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          <ShoppingCart className="mr-3 h-6 w-6" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      ) : (
        <div className="flex w-full items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCartQuantityChange(-1)}
              className="h-10 w-10"
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {cartQuantity} in cart
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCartQuantityChange(1)}
              className="h-10 w-10"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <span className="text-gray-900 font-medium">
            Total: ${selectedVariant ? (cartQuantity * selectedVariant.discounted_price).toFixed(2) : '0.00'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFromCart}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 py-7 cursor-pointer"
          onClick={handleBuyNow}
          disabled={!inStock || !selectedVariant}
        >
          Buy Now
        </Button>
        <Button size="lg" variant="outline" className="p-7">
          <Bookmark className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

// Combined Interactive Component (Options + Cart Actions)
export function ProductInteractive({ 
  product,
  defaultVariant 
}: { 
  product: any;
  defaultVariant: any;
}) {
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  return (
    <>
      <ProductOptions
        product={product}
        defaultVariant={defaultVariant}
        onVariantChange={setSelectedVariant}
      />
      
      <CartActions
        product={product}
        selectedVariant={selectedVariant}
      />
    </>
  );
}

// Collapsible Features Component
export function ExpandableFeatures({ features,Features }: { features: string[],Features:ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className='relative'>
      <div className={`mb-4 ${!isExpanded ? "max-h-[210px] overflow-hidden" : "max-h-auto"}`}>
          {
            Features
          }
      </div>

      {features.length > 3 && (
        <div 
          onClick={() => setIsExpanded(prev => !prev)} 
          className={`${!isExpanded ? "bg-white/80 -bottom-2 " : "-bottom-8"} py-2 absolute cursor-pointer flex justify-center right-0 w-full`}
        >
          <p className="text-center text-sm text-gray-500">
            {!isExpanded ? "See more" : "See Less"}
          </p>
        </div>
      )}
    </div>
  );
}

// Main Interactive Component (for backward compatibility)
export default function ProductDetailInteractive({ 
  variants,
  defaultVariant 
}: { 
  variants: any[];
  defaultVariant: any;
}) {
  return (
    <>
      <ProductImageGallery 
        variants={variants} 
        defaultVariant={defaultVariant} 
      />
    </>
  );
}

// Attach all components for easy imports
// ProductDetailInteractive.ProductImageGallery = ProductImageGallery;
// ProductDetailInteractive.ProductOptions = ProductOptions;
// ProductDetailInteractive.CartActions = CartActions;
// ProductDetailInteractive.ProductInteractive = ProductInteractive;
// ProductDetailInteractive.ExpandableFeatures = ExpandableFeatures;