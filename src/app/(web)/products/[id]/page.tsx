// app/(web)/products/[slug]/page.tsx
import { endpoints } from '@/constants/endpoints/endpoints'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ThumbsUp, CheckCircle } from 'lucide-react'
import Product from '../Product'
import ProductDetailInteractive, { CartActions, ExpandableFeatures, ProductOptions } from './ProductDetailInteractive'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import ReviewComponent from './ReviewComponent'

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
  related_products: any[];
}

// Dummy review data structure
interface ReviewData {
  id: string;
  user: {
    id: string;
    name: string;
    initials: string;
    is_verified_purchase: boolean;
  };
  rating: number;
  title: string;
  comment: string;
  helpful_yes: number;
  helpful_no: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// Dummy reviews data
const dummyReviews: ReviewData[] = [
  {
    id: "1",
    user: {
      id: "user-1",
      name: "Alex Johnson",
      initials: "AJ",
      is_verified_purchase: true
    },
    rating: 5,
    title: "Absolutely Amazing!",
    comment: "This product exceeded all my expectations. The quality is outstanding and it arrived earlier than expected. I've been using it for a week now and it performs perfectly.",
    helpful_yes: 24,
    helpful_no: 1,
    is_edited: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    user: {
      id: "user-2",
      name: "Sam Wilson",
      initials: "SW",
      is_verified_purchase: true
    },
    rating: 4,
    title: "Great value for money",
    comment: "Good quality product with excellent features. The only reason I'm giving 4 stars instead of 5 is because the instructions could be clearer. Otherwise, very satisfied!",
    helpful_yes: 12,
    helpful_no: 0,
    is_edited: true,
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-12T09:15:00Z"
  },
  {
    id: "3",
    user: {
      id: "user-3",
      name: "Taylor Morgan",
      initials: "TM",
      is_verified_purchase: false
    },
    rating: 3,
    title: "Decent but could be better",
    comment: "It works as described but I expected better build quality. For the price, it's okay but there are some minor issues with the finish.",
    helpful_yes: 5,
    helpful_no: 2,
    is_edited: false,
    created_at: "2024-01-05T08:45:00Z",
    updated_at: "2024-01-05T08:45:00Z"
  },
  {
    id: "4",
    user: {
      id: "user-4",
      name: "Jordan Lee",
      initials: "JL",
      is_verified_purchase: true
    },
    rating: 5,
    title: "Perfect for daily use",
    comment: "I use this product every day and it has been reliable. The design is sleek and it's very user-friendly. Highly recommend!",
    helpful_yes: 18,
    helpful_no: 0,
    is_edited: false,
    created_at: "2024-01-02T16:10:00Z",
    updated_at: "2024-01-02T16:10:00Z"
  },
  {
    id: "5",
    user: {
      id: "user-5",
      name: "Casey Smith",
      initials: "CS",
      is_verified_purchase: true
    },
    rating: 4,
    title: "Good with minor issues",
    comment: "Overall a great product. The performance is good but I wish the battery lasted longer. Customer service was helpful when I had questions.",
    helpful_yes: 8,
    helpful_no: 1,
    is_edited: false,
    created_at: "2023-12-28T11:25:00Z",
    updated_at: "2023-12-28T11:25:00Z"
  }
];

// Review component
function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-medium">{review.user.initials}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{review.user.name}</h4>
              {review.user.is_verified_purchase && (
                <span className="inline-flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-300 text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {review.is_edited && (
                <span className="text-xs text-gray-400 ml-2">(Edited)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
      <p className="text-gray-700 mb-4">{review.comment}</p>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Was this review helpful?
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{review.helpful_yes}</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <ThumbsUp className="h-4 w-4 mr-1 rotate-180" />
            <span>{review.helpful_no}</span>
          </button>
        </div>
      </div>
    </div>
  );
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


async function getProductReviews(slug: string): Promise<ReviewData[] | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const apiPath = endpoints.products.getReviews.replace(":slug", slug)

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
      throw new Error(`Failed to fetch product reviews: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to load product reviews')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching product reviews:', error)
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
  const reviews = await (getProductReviews(id))

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

        {/* Product Reviews Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.average_rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-300 text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {product.average_rating.toFixed(1)} out of 5
                  </span>
                </div>
                <span className="text-gray-600">
                  {product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>


           <ReviewComponent slug={product?.slug} title={product?.title}/>
          </div>

          {/* Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Rating Breakdown</h3>
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = Math.floor(Math.random() * 30) + 70; // Dummy percentage
                return (
                  <div key={rating} className="flex items-center mb-2">
                    <span className="w-8 text-sm text-gray-600">{rating} star</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-400 h-2 rounded-full"
                          style={{ width: `${rating === 5 ? 85 : rating === 4 ? 10 : 5}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-10 text-sm text-gray-600 text-right">
                      {rating === 5 ? '85%' : rating === 4 ? '10%' : '5%'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Review Highlights</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">93% of customers recommend this product</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Verified purchases only</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Most helpful reviews first</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Filter Reviews</h3>
              <div className="space-y-3">
                {['5 stars', '4 stars', '3 stars', 'With images', 'Verified Purchase'].map((filter) => (
                  <label key={filter} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{filter}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviews && reviews.length > 0 && 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {reviews?.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          }

          {/* Load More Reviews */}
          <div className="text-center">
            <Button variant={"ghost"}>
              Load More Reviews
            </Button>
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