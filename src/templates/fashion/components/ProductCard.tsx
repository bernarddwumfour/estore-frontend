import Image from "next/image";
import Link from "next/link";
import type { ProductCardProps } from "../../contract";
import { formatCurrency } from "@/lib/currency";
import ProductActions from "@/app/(web)/products/(components)/ProductActions";
import AddToWishList from "@/app/(web)/products/(components)/AddToWishList";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, isMinimal = false }: ProductCardProps) {
  const variant = product.default_variant || product.variants?.[0];
  const image = variant?.images?.[0];
  const href = product.variant_slug ? `/products/${product.slug}/${product.variant_slug}` : `/products/${product.slug}`;

  return (
    <li className="group min-w-0 list-none">
      <div className="relative aspect-square overflow-hidden bg-[#f3f0ec]">
        <Link href={href} aria-label={`View ${product.title}`} className="absolute inset-0">
          {image?.url ? <Image src={image.url} alt={image.alt_text || product.title} fill sizes="(max-width: 640px) 70vw, (max-width: 1024px) 34vw, 24vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-sm text-[#92877b]">VELORA</div>}
        </Link>
          {variant && variant.discounted_price < variant.price && <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[9px] uppercase tracking-wide">Sale</span>}
          {!isMinimal && variant && <AddToWishList variantId={variant.id} productTitle={product.title} />}
        </div>
      <Link href={href} className="block">
        <div className="pt-3">
          <p className="text-[9px] uppercase tracking-[0.12em] text-[#8a8179]">{product.category?.name ?? "The collection"}</p>
          <h3 className="mt-1 line-clamp-1 text-sm text-[#282522] group-hover:text-[#ad8a60]">{product.title}</h3>
          {variant && <div className="mt-1.5 flex gap-2 text-xs"><span>{formatCurrency(variant.discounted_price || variant.price)}</span>{variant.discounted_price < variant.price && <span className="text-[#91877d] line-through">{formatCurrency(variant.price)}</span>}</div>}
        </div>
      </Link>
      {!isMinimal && <div className={styles.actions}><ProductActions product={product} defaultVariant={variant ?? null} hasDefaultVariant={Boolean(variant)} mainImage={image ?? null} hasDiscount={Boolean(variant && variant.discounted_price < variant.price)} /></div>}
    </li>
  );
}
