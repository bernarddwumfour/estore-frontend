"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Eye, Images, ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCartStore } from "@/app/lib/store/cart-store";
import AddToWishList from "@/app/(web)/products/(components)/AddToWishList";
import type { ProductCardProps } from "../../contract";

export default function ProductCard({ product, isMinimal = false }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const variantQuantity = useCartStore((state) =>
    state.getItemQuantity((product.default_variant || product.variants?.[0])?.id || "")
  );
  const variant = product.default_variant || product.variants?.[0];
  const images = variant?.images ?? [];
  const currentImage = images[imageIndex] ?? images[0];
  const hasDiscount = Boolean(variant && variant.discounted_price < variant.price);
  const productHref = product.variant_slug
    ? `/products/${product.slug}/${product.variant_slug}`
    : `/products/${product.slug}`;

  const quickAdd = () => {
    if (!variant?.is_in_stock) return;
    addItem({
      id: product.id,
      slug: product.slug,
      sku: variant.sku,
      title: product.title,
      price: variant.discounted_price || variant.price,
      imageUrl: currentImage?.url || "",
      quantity: 1,
      originalPrice: variant.price,
      attributes: variant.attributes,
      variantId: variant.id,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const actionClass = "relative flex h-10 w-10 items-center justify-center border border-[#e8e4e0] bg-white text-[#55463f] transition-colors hover:border-[#9b5c40] hover:bg-[#9b5c40] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";
  const wishClass = "!static !m-0 !h-10 !w-10 !shrink-0 !justify-center !rounded-none !border !border-[#e8e4e0] !bg-white !p-0 !text-[#55463f] hover:!border-[#9b5c40] hover:!bg-[#9b5c40] hover:!text-white";

  return (
    <li className="group flex min-w-0 list-none flex-col">
      <div className={`relative isolate overflow-hidden bg-[#f5f5f5] ${isMinimal ? "aspect-[12/7]" : "aspect-[4/5]"}`}>
        {currentImage?.url ? (
          <Link href={productHref} aria-label={`View ${product.title}`} className="absolute inset-0">
            <Image
              src={currentImage.url}
              alt={currentImage.alt_text || product.title}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 34vw, 24vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-5"
            />
          </Link>
        ) : (
          <Link href={productHref} aria-label={`View ${product.title}`} className="absolute inset-0 flex items-center justify-center font-serif text-4xl text-[#c7b8ac]">✳</Link>
        )}

        {hasDiscount && !isMinimal && variant && (
          <span className="absolute left-0 top-3 z-10 bg-[#3487cf] px-2 py-1 text-[10px] font-medium text-white">
            -{variant.discount_percentage || Math.round((1 - variant.discounted_price / variant.price) * 100)}%
          </span>
        )}

        {!isMinimal && (
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 opacity-100 transition duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            <button type="button" aria-label="Add to cart" title="Add to cart" className={actionClass} onClick={quickAdd} disabled={!variant?.is_in_stock}>
              {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {variantQuantity > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#92583e] px-1 text-[9px] text-white">{variantQuantity}</span>}
            </button>
            <Link href={productHref} aria-label={`Quick view ${product.title}`} title="Quick view" className={actionClass}><Eye className="h-5 w-5" /></Link>
            <AddToWishList variantId={variant?.id ?? ""} productTitle={product.title} className={wishClass} iconSize="!h-5 !w-5" />
            <button type="button" aria-label="Show another image" title="Show another image" className={actionClass} disabled={images.length < 2} onClick={() => setImageIndex((index) => (index + 1) % images.length)}><Images className="h-5 w-5" /></button>
          </div>
        )}
      </div>

      <Link href={productHref} className="block pt-3">
        {product.average_rating > 0 && (
          <div className="mb-1.5 flex items-center gap-0.5" aria-label={`Rated ${product.average_rating.toFixed(1)} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(product.average_rating) ? "fill-[#f4a62a] text-[#f4a62a]" : "text-[#ded8d2]"}`} />)}
            {product.total_reviews > 0 && <span className="ml-1 text-[10px] text-[#82776f]">({product.total_reviews})</span>}
          </div>
        )}
        <h3 className="line-clamp-1 text-sm font-medium text-[#29231f] transition-colors group-hover:text-[#92583e]">{product.title}</h3>
        {variant ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-[#62564f]">
            {hasDiscount && <span className="text-[#9a8f87] line-through">{formatCurrency(variant.price)}</span>}
            <span>{formatCurrency(variant.discounted_price || variant.price)}</span>
          </div>
        ) : <p className="mt-1.5 text-xs text-[#82776f]">View details</p>}
      </Link>
    </li>
  );
}
