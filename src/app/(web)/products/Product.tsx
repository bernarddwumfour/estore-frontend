// app/components/Product/Product.tsx
import Link from 'next/link'
import { ArrowUpRight, BadgePercent, Star } from 'lucide-react'
import ProductActions from './(components)/ProductActions'
import { ProductType } from '@/types/productTypes'
import ProductImageCarousel from './(components)/ProductImageCarousel'

interface ProductProps {
  product: ProductType
  isMinimal?: boolean
}

const Product = ({ product, isMinimal = false }: ProductProps) => {
  const defaultVariant = product.default_variant || product.variant
  const hasDefaultVariant = defaultVariant !== null
  const hasDiscount = hasDefaultVariant && defaultVariant.discounted_price < defaultVariant.price
  const discountPercentage = hasDefaultVariant && hasDiscount
    ? Math.round(((defaultVariant.price - defaultVariant.discounted_price) / defaultVariant.price) * 100)
    : 0

  // Get all images
  const images = hasDefaultVariant && defaultVariant.images?.length > 0
    ? defaultVariant.images
    : []

  // Get first image for ProductActions
  const firstImage = images[0] || null

  return (
    <li className="group relative list-none flex flex-col justify-between bg-white overflow-hidden transition-all duration-300">

      {/* Upper Content and Image Structure */}
      <Link href={`/products/${product.slug}`} className="block w-full">

        {/* Top Section: Media Container (Reduced bounds if isMinimal is active) */}
        <div className={`relative bg-[#f8f9fa] rounded-[2rem] overflow-hidden border border-slate-100/50 transition-all duration-300 group-hover:bg-[#f1f3f5] flex items-center justify-center
          ${isMinimal ? 'p-3 aspect-[12/7]' : 'p-6 aspect-square'}`}
        >

          {/* Badges - Hidden in minimal mode */}
          {!isMinimal && (
            <>
              {/* Top Left: Discount Percentage Badge */}
              {hasDiscount && (
                <div className="absolute scale-80 lg:scale-100 left-2 md:left-4 top-2 md:top-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    <BadgePercent className="h-3.5 w-3.5" />
                    -{discountPercentage}%
                  </span>
                </div>
              )}

              {/* Top Right: Category Tag */}
              <div className="absolute scale-80 lg:scale-100 right-2 md:right-4 top-2 md:top-4 z-10">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm border border-slate-100">
                  {product.category.name}
                </span>
              </div>
            </>
          )}

          {/* Carousel Viewport Wrapper */}
          <div className="w-full h-full max-h-[95%] max-w-[95%] flex items-center justify-center mix-blend-multiply transition-transform duration-500">
            <ProductImageCarousel
              images={images}
              productTitle={product.title}
              isFeatured={product.is_featured}
              isBestseller={product.is_bestseller}
              variantId={defaultVariant?.id!}
            />
          </div>

          {/* <div className="w-full h-full max-h-[95%] max-w-[95%] flex items-center justify-center mix-blend-multiply transition-transform duration-500 group-hover:scale-102">
            <ProductImageCarousel
              images={images}
              productTitle={product.title}
              isFeatured={product.is_featured}
              isBestseller={product.is_bestseller}
              variantId={defaultVariant?.id!}
            />
          </div> */}
        </div>

        {/* Lower Section: Meta Typography Info */}
        <div className={`px-1 ${isMinimal ? 'pt-2 pb-1' : 'pt-4 pb-2'}`}>

          {/* Row 1: Title and Rating Stars */}
          <div className="flex items-center justify-between gap-3 w-full">
            <h3 className="font-bold text-slate-900 tracking-tight text-sm line-clamp-1 group-hover:text-slate-800">
              {product.title}
            </h3>

            {/* Minimal Inline Rating */}
            <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-700">
                {product.average_rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Row 2: Price Tiers and Savings Options */}
          <div className="flex items-baseline flex-wrap gap-2 justify-between mt-1 w-full">
            <div>
              {hasDefaultVariant ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-slate-950">
                    ${defaultVariant.discounted_price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ${defaultVariant.price.toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic font-medium">
                  No variants available
                </div>
              )}
            </div>

            {/* Savings Badge - Hidden in minimal mode */}
            {hasDiscount && !isMinimal && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Save ${(defaultVariant.price - defaultVariant.discounted_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Row 3: Stock Footnote Metrics - Hidden in minimal mode */}
          {!isMinimal && (
            <div className="mt-2 text-[11px] font-medium border-t border-slate-50 pt-2">
              {hasDefaultVariant ? (
                product.total_stock > 0 ? (
                  <span className="text-emerald-600">
                    {product.total_stock} in stock
                  </span>
                ) : (
                  <span className="text-destructive font-semibold">Out of stock</span>
                )
              ) : (
                <span className="text-amber-600 font-semibold">No stock available</span>
              )}
              <span className="text-slate-300 mx-1.5">•</span>
              <span className="text-slate-400 font-normal">
                {product.total_reviews} reviews
              </span>
            </div>
          )}

        </div>
      </Link>

      {/* Action Tray Placement - Maintains full client functions */}
      {
        !isMinimal && <div className="px-1 pb-1">
          <ProductActions
            product={product}
            defaultVariant={defaultVariant}
            hasDefaultVariant={hasDefaultVariant}
            mainImage={firstImage}
            hasDiscount={hasDiscount}
          />
        </div>
      }


    </li>
  )
}

export default Product