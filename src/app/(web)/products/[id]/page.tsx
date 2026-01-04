'use client';

import { Button } from '@/components/ui/button';
import { Bookmark, ShoppingCart, Minus, Plus, Trash, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Product from '../Product';
import { useCartStore } from '@/app/lib/store/cart-store';
import { endpoints } from '@/constants/endpoints/endpoints';
import unAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';

interface ProductDetailData {
  id: string;
  title: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  features: string[];
  options: Record<string, string[]>;
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    discount_amount: number;
    discounted_price: number;
    discount_percentage: number;
    stock: number;
    is_default: boolean;
    is_in_stock: boolean;
    is_low_stock: boolean;
    images: { url: string, alt_text: string, type: string }[];
    dimensions: {
      weight: number | null;
      height: number | null;
      width: number | null;
      depth: number | null;
    };
  }>;
  related_products: any[]
}

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams(); // Get all params
  const slug = params.id as string; // Access slug from params object
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Default variant
  const defaultVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find(v => v.is_default) || product.variants[0];
  }, [product]);

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Selected image (starts with first image of default variant)
  const [selectedImage, setSelectedImage] = useState<{ url: string, alt_text: string, type: string } | undefined>(undefined);

  // Cart store
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  useEffect(() => {
    setIsMounted(true);
    fetchProductDetail(slug as string);
  }, [slug]);

  const fetchProductDetail = async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await unAuthenticatedAxios.get(endpoints.products.getProductDetailsWeb.replace(":slug", slug));

      if (response.data.success) {
        const productData = response.data.data;
        setProduct(productData);

        // Initialize selected options from default variant
        const defaultVariant = productData.variants.find((v: any) => v.is_default) || productData.variants[0];
        if (defaultVariant) {
          setSelectedOptions(defaultVariant.attributes);
          if (defaultVariant.images.length > 0) {
            setSelectedImage(defaultVariant.images[0]);
          }
        }
      } else {
        setError(response.data.error || 'Failed to load product');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error?.response?.data?.error || 'Failed to fetch product');
    } finally {
      setIsLoading(false);
    }
  };

  // Current selected variant
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find(variant =>
        Object.keys(selectedOptions).every(key => variant.attributes[key] === selectedOptions[key])
      ) || defaultVariant
    );
  }, [selectedOptions, product, defaultVariant]);

  // Update selected image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.images.length > 0) {
      setSelectedImage(selectedVariant.images[0]);
    }
  }, [selectedVariant]);

  // Cart status for current variant (by SKU)
  const cartItem = isMounted && selectedVariant
    ? items.find(item => item.sku === selectedVariant.sku)
    : null;

  const cartQuantity = cartItem?.quantity || 0;
  const isInCart = cartQuantity > 0;

  // Handle option change
  const handleOptionChange = (optionKey: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    addItem({
      id: product!.id,
      slug: product!.slug,
      sku: selectedVariant.sku,
      title: product!.title,
      price: selectedVariant.discounted_price,
      imageUrl: selectedVariant.images[0].url || '/placeholder-product.jpg',
      quantity: 1,
      originalPrice: selectedVariant.discount_amount > 0 ? selectedVariant.price : undefined,
      attributes: selectedVariant.attributes,
      variantId : selectedVariant.id
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

  const inStock = selectedVariant?.stock! > 0;

  // Check option availability
  const isOptionAvailable = (optionKey: string, value: string) => {
    if (!product) return false;
    const testOptions = { ...selectedOptions, [optionKey]: value };
    return product.variants.some(variant =>
      Object.keys(testOptions).every(key => variant.attributes[key] === testOptions[key])
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Product not found'}</p>
          <Button onClick={() => fetchProductDetail}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-12 mb-20">
          {/* Left: Images */}
          <div className="space-y-4  lg:col-span-3 ">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-gray-100">
              {selectedImage ? (
                <Image
                  src={selectedImage?.url
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedImage.url}`
                    : '/placeholder.jpg'
                  }
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
                {selectedVariant.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${selectedImage === img
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <Image src={`http://localhost:8000${img?.url}`} alt={img.alt_text} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center space-y-8  lg:col-span-4">
            <div>
              <div className="flex justify-between flex-col md:flex-row">

                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

                {/* Product Badges */}
                <div className="flex gap-2 mb-4 flex-none h-fit">
                  {product.is_new && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      New
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Featured
                    </span>
                  )}
                  {product.is_bestseller && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Bestseller
                    </span>
                  )}
                </div>

              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
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
                <span className="text-sm text-gray-600">
                  {product.average_rating.toFixed(1)} ({product.total_reviews} reviews)
                </span>
              </div>

              {/* Category */}
              <p className="text-gray-600 mb-4">
                Category: <Link href={`/category/${product.category.slug}`} className="text-blue-600 hover:underline">
                  {product.category.name}
                </Link>
              </p>

              {/* Price */}
              {selectedVariant && (
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-xl md:text-3xl font-bold text-gray-900">
                    ${selectedVariant.discounted_price.toFixed(2)}
                  </span>
                  {selectedVariant.discount_amount > 0 && (
                    <>
                      <span className="md:text-xl text-gray-500 line-through">
                        ${selectedVariant.price.toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        Save ${selectedVariant.discount_amount.toFixed(2)} ({selectedVariant.discount_percentage.toFixed(1)}%)
                      </span>
                    </>
                  )}
                </div>
              )}

              <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-2">{product.description}</p>

              {/* Stock Status */}
              {selectedVariant && (
                <p className={`mb-3 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {inStock
                    ? `In Stock (${selectedVariant.stock} available)`
                    : 'Out of Stock'}
                  {selectedVariant.is_low_stock && inStock && (
                    <span className="text-amber-600 ml-2">• Low Stock</span>
                  )}
                </p>
              )}

              {/* Variant Options */}
              {Object.keys(product.options).length > 0 && (
                <div className="space-y-2 mb-5">
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
                                // disabled={!available}
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
              )}

              <Features features={product.features} />

            </div>

            {/* Action Buttons */}
            <div className="space-y-6">
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

            <div className="text-center pt-8">
              <Link
                href="/products"
                className="text-gray-600 hover:text-gray-900 underline underline-offset-4 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-10 text-center">You Might Also Like</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {product.related_products.map((relatedProduct) => (
                <Product product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Features({ features }: { features: any[] }) {
  const [isExpanded, setIsExpnded] = useState(false)
  return (
    <div className='relative'>

      {/* Features */}
      {features.length > 0 && (
        <div className={`mb-4 ${!isExpanded ? "max-h-[210px] overflow-hidden" : "max-h-auto"}`}>
          <h3 className="text-lg font-medium mb-4">Key Features</h3>
          <ul className="space-y-1 text-gray-700">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm">
                <span className="mr-3 text-green-600">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div onClick={()=>setIsExpnded(prev=>!prev)} className={`${!isExpanded?"bg-white/80 -bottom-2 ":"-bottom-8"} py-2 absolute cursor-pointer flex justify-center right-0 w-full`}>
        <p className="text-center text-sm text-gray-500">{!isExpanded?"See more":"See Less"}</p></div>
    </div>
  )
}