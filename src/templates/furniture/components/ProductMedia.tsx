// Furniture product-card media: the image plus the three overlay actions
// (wishlist · image switcher · add-to-cart). Owns the image index so the
// image-switcher button cycles the displayed image. Behaviour reuses the
// shared AddToWishList component and the shared cart-store — only the
// presentation is furniture-specific. Replaces the shared ProductImageCarousel
// for this store so its old wishlist + image-count buttons don't appear.
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Images, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import AddToWishList from "@/app/(web)/products/(components)/AddToWishList";
import type { ProductType } from "@/types/productTypes";

type VariantImage = { id?: string; url: string; alt_text?: string };

export default function ProductMedia({
  product,
  defaultVariant,
  images,
  minimal = false,
}: {
  product: ProductType;
  defaultVariant: ProductType["default_variant"];
  images: VariantImage[];
  minimal?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const variantQuantity = useCartStore((s) =>
    s.getItemQuantity(defaultVariant?.id || defaultVariant?.sku || "")
  );
  const [added, setAdded] = useState(false);

  const available = defaultVariant?.is_in_stock === true;
  const current = images[index] || null;
  const productHref = product.variant_slug
    ? `/products/${product.slug}/${product.variant_slug}`
    : `/products/${product.slug}`;

  const switchImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) setIndex((prev) => (prev + 1) % images.length);
  };

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available || !defaultVariant) return;
    addItem({
      id: product.id,
      slug: product.slug,
      sku: defaultVariant.sku,
      title: product.title,
      price: defaultVariant.discounted_price || defaultVariant.price,
      imageUrl: current?.url || "",
      quantity: 1,
      originalPrice: defaultVariant.price,
      attributes: defaultVariant.attributes,
      variantId: defaultVariant.id,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#654035] transition-colors hover:bg-[#654035] hover:text-white";
  // Reuse AddToWishList's behaviour but override its built-in absolute
  // bottom-left placement so it sits in our top-right stack.
  const wishBtn =
    "!static !bottom-auto !left-auto !top-auto !justify-center !bg-white !px-0 !py-0 !scale-100 h-10 w-10 !rounded-full !text-[#2b2b22] hover:!bg-[#654035] hover:!text-white";

  return (
    <>
      <Link
        href={productHref}
        className="relative flex h-[88%] w-[88%] items-center justify-center mix-blend-multiply"
      >
        {current?.url ? (
          <Image
            src={current.url}
            alt={current.alt_text || product.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <span className="text-xs font-medium text-[#a6a08f]">No image</span>
        )}
      </Link>

      {!minimal && (
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <AddToWishList
            variantId={defaultVariant?.id ?? ""}
            productTitle={product.title}
            className={wishBtn}
            iconSize="h-5 w-5"
          />
          <button
            type="button"
            aria-label="Switch image"
            className={btn}
            onClick={switchImage}
            disabled={images.length < 2}
          >
            <Images className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Add to cart"
            className={`relative ${btn}`}
            onClick={quickAdd}
            disabled={!available}
          >
            {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            {variantQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#654035] px-1 text-[9px] font-bold text-white">
                {variantQuantity}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
