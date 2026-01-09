// app/components/Product/Product.tsx
import Link from 'next/link'
import { BadgePercent, Sparkles, Star, Tag } from 'lucide-react'
import ProductActions from './(components)/ProductActions'
import { ProductType } from '@/types/productTypes'
import ProductImageCarousel from './(components)/ProductImageCarousel'

const Product = ({ product }: { product: ProductType }) => {
  const defaultVariant = product.default_variant
  const hasDefaultVariant = defaultVariant !== null
  const hasDiscount = hasDefaultVariant && defaultVariant.discounted_price < defaultVariant.price
  const discountPercentage = hasDefaultVariant && hasDiscount
    ? Math.round(((defaultVariant.price - defaultVariant.discounted_price) / defaultVariant.price) * 100)
    : 0

  // Get all images
  const images = hasDefaultVariant && defaultVariant.images?.length > 0
    ? defaultVariant.images
    : []

  // Get first image for ProductActions (static, not changing)
  const firstImage = images[0] || null

  return (
    <li className="group relative block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {product.is_new && (
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
          )}
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

        {/* Product Image Carousel - Client Component */}
        <ProductImageCarousel
          images={images}
          productTitle={product.title}
          isFeatured={product.is_featured}
          isBestseller={product.is_bestseller}
        />

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

      {/* Action Buttons - Client Component */}
      <ProductActions 
        product={product}
        defaultVariant={defaultVariant}
        hasDefaultVariant={hasDefaultVariant}
        mainImage={firstImage}
        hasDiscount={hasDiscount}
      />
    </li>
  )
}

export default Product