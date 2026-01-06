// app/(web)/products/[slug]/page.tsx
import { endpoints } from '@/constants/endpoints/endpoints'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import Product from '../Product'
import ProductDetailInteractive, { CartActions, ExpandableFeatures, ProductOptions } from './ProductDetailInteractive'
import { ReactNode } from 'react'

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

async function getProductDetail(slug: string): Promise<ProductDetailData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const apiPath = endpoints.products.getProductDetailsWeb.replace(":slug", slug)

    console.log(`${baseUrl.slice(0, -1)}${apiPath}`)
    const url = new URL(`${baseUrl.slice(0, -1)}${apiPath}`)

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 300,
        tags: [`product-${slug}`]
      }
    })

    console.log(response)


    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to load product')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductDetail(id)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">Product not found</p>
        </div>
      </div>
    )
  }

  const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0]

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Main Product Section - SEO Content */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-12 mb-20">
          {/* Left: Images (Interactive) */}
          <div className="lg:col-span-3">
            <ProductDetailInteractive
              variants={product.variants}
              defaultVariant={defaultVariant}
            />
          </div>

          {/* Right: Details (Static - SEO) */}
          <div className="flex flex-col justify-center space-y-8 lg:col-span-4">
            <div>
              <div className="flex justify-between flex-col md:flex-row">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>

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
                Category: <Link href={`/products/?category=${product.category.slug}`} className="text-blue-600 hover:underline">
                  {product.category.name}
                </Link>
              </p>

              {/* Price - Server rendered for SEO */}
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-xl md:text-3xl font-bold text-gray-900">
                  ${defaultVariant.discounted_price.toFixed(2)}
                </span>
                {defaultVariant.discount_amount > 0 && (
                  <>
                    <span className="md:text-xl text-gray-500 line-through">
                      ${defaultVariant.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      Save ${defaultVariant.discount_amount.toFixed(2)} ({defaultVariant.discount_percentage.toFixed(1)}%)
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-2">
                {product.description}
              </p>

              {/* Stock Status */}
              <p className={`mb-3 text-sm font-medium ${defaultVariant.is_in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {defaultVariant.is_in_stock
                  ? `In Stock (${defaultVariant.stock} available)`
                  : 'Out of Stock'}
                {defaultVariant.is_low_stock && defaultVariant.is_in_stock && (
                  <span className="text-amber-600 ml-2">• Low Stock</span>
                )}
              </p>

              <ProductOptions
                product={product}
                defaultVariant={defaultVariant}
              />

              <ExpandableFeatures
                features={product.features}
                Features={(<>
                  {/* Static Features (SEO) */}
                  {product.features.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-4">Key Features</h3>
                      <ul className="space-y-1 text-gray-700">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="mr-3 text-green-600">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </> as ReactNode)}
              />



            </div>

            {/* Interactive Client Components */}
            <CartActions
              product={product}
            />

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
                <Product product={relatedProduct} key={relatedProduct.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}