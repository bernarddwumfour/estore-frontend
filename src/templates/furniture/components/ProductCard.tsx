// Furniture store product card — matches the furniture mockup (green discount
// badge, hover action stack, category + rating, price). Same data + shared
// cart/wishlist behaviour as the default store; only the presentation differs.
// Props match the contract so ProductsGrid is unchanged.
import Link from "next/link";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { ProductCardProps } from "../../contract";
import ProductMedia from "./ProductMedia";

export default function ProductCard({ product, isMinimal = false }: ProductCardProps) {
  const defaultVariant = product.default_variant || product.variants[0];
  const hasDefaultVariant = defaultVariant != null;
  const hasDiscount =
    hasDefaultVariant && defaultVariant.discounted_price < defaultVariant.price;
  const discountPercentage =
    hasDefaultVariant && hasDiscount
      ? Math.round(
          ((defaultVariant.price - defaultVariant.discounted_price) /
            defaultVariant.price) *
            100
        )
      : 0;

  const images =
    hasDefaultVariant && defaultVariant.images?.length > 0
      ? defaultVariant.images
      : [];
  const rating = product.average_rating ?? 0;

  return (
    <li className="group list-none flex flex-col">
      {/* Image area */}
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-3xl bg-[#f4f1ea] ${
          isMinimal ? "aspect-[12/7] p-3" : "aspect-square p-6"
        }`}
      >
        {hasDiscount && !isMinimal && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#3f4d2c] px-3.5 py-1.5 text-xs font-bold text-white">
            {discountPercentage}% off
          </span>
        )}

        <ProductMedia
          product={product}
          defaultVariant={defaultVariant}
          images={images}
          minimal={isMinimal}
        />
      </div>

      {/* Meta */}
      <Link href={`/products/${product.slug}`} className="block px-1 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#a6a08f]">
            {product.category?.name ?? "Furniture"}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-[#f5b21a] text-[#f5b21a]" />
            <span className="text-sm font-bold text-[#2b2b22]">
              {rating.toFixed(1)}
            </span>
          </span>
        </div>

        <h3 className="mt-1 line-clamp-1 text-lg font-bold tracking-tight text-[#2b2b22] group-hover:text-[#3f4d2c]">
          {product.title}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          {hasDefaultVariant ? (
            <>
              <span className="text-lg font-extrabold text-[#2b2b22]">
                {formatCurrency(defaultVariant.discounted_price ?? defaultVariant.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm font-medium text-[#a6a08f] line-through">
                  {formatCurrency(defaultVariant.price)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-medium italic text-[#a6a08f]">
              No variants available
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
