'use client';

import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingCart, Minus, Plus, Check, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import  { useState, useEffect } from 'react';
import Product from '../Product';
import { products } from '@/constants/products';
import { useCartStore } from '@/app/lib/store/cart-store';

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id == Number(id))!;

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isMounted, setIsMounted] = useState(false);

  // Cart store
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const galleryImages = product.images;
  const suggestedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    // Always add to cart with selected quantity
    addItem({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      imageUrl: product.images[0],
      quantity: quantity,
      originalPrice: product.price,
    });
  };

  const handleCartQuantityChange = (delta: number) => {
    const cartItem = items.find(item => item.id === product.id.toString());
    if (cartItem) {
      const newQuantity = cartItem.quantity + delta;
      if (newQuantity <= 0) {
        removeItem(product.id.toString());
      } else {
        updateQuantity(product.id.toString(), newQuantity);
      }
    }
  };

  const handleRemoveFromCart = () => {
    removeItem(product.id.toString());
  };

  // Get cart status for this product
  const cartItem = isMounted ? items.find(item => item.id === product.id.toString()) : null;
  const cartQuantity = cartItem?.quantity || 0;
  const isInCart = !!cartItem;

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Large Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white border border-gray-100">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Small Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                    selectedImage === img ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>

              {/* Color Selector */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Color: {selectedColor}</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm transition ${
                        selectedColor === color 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>


              {/* Additional Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Other necessary details */}
              <div className="space-y-4 text-gray-600">
                <p><strong>Shipping:</strong> Free standard shipping on orders over $50. Estimated delivery: 3-5 business days.</p>
                <p><strong>Returns:</strong> 30-day return policy. Easy returns with free return shipping.</p>
                <p><strong>Warranty:</strong> 1-year limited warranty.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Add to Cart Button - Disabled when in cart */}
              <Button 
                size="lg" 
                className="w-max text-lg py-7"
                onClick={handleAddToCart}
                disabled={!isMounted || isInCart}
                variant={isInCart ? "secondary" : "default"}
              >
                {isInCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart ({quantity})
                  </>
                )}
              </Button>
              
              {/* Cart Quantity Controls (only show when in cart) */}
              {isInCart && (
                <div className="flex w-full items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCartQuantityChange(-1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <span className="text-lg font-medium block">{cartQuantity} in cart</span>
                     
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCartQuantityChange(1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                   <span className="text-sm text-gray-500">
                        ${(cartQuantity * product.price).toFixed(2)} total
                      </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFromCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash/>
                  </Button>
                </div>
              )}

              </div>
              {/* Secondary Actions */}
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1 py-7"
                  onClick={handleAddToCart}
                  disabled={!isMounted || isInCart}
                >
                  {isInCart ? 'Already in Cart' : 'Buy Now'}
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="p-7"
                  onClick={() => {
                    // Bookmark logic here
                  }}
                >
                  <Bookmark className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Continue Shopping Link */}
            <div className="text-center pt-4">
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 underline underline-offset-4 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        <div>
          <h2 className="text-3xl font-bold mb-8">You Might Also Like</h2>
          <ul className="mt-8 grid gap-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((product) => (
              <Product product={product} key={product.id} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}