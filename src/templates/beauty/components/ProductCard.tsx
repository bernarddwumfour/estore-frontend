"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import { formatCurrency } from "@/lib/currency";
import type { ProductCardProps } from "../../contract";
import styles from "../beauty.module.css";

export default function ProductCard({ product, isMinimal = false }: ProductCardProps) {
  const variant = product.default_variant ?? product.variants[0];
  const addItem = useCartStore(s => s.addItem);
  const quantity = useCartStore(s => s.hasHydrated && variant ? s.getItemQuantity(variant.id) : 0);
  const href = product.variant_slug ? `/products/${product.slug}/${product.variant_slug}` : `/products/${product.slug}`;
  const price = variant?.discounted_price ?? variant?.price;
  const image = variant?.images?.[0];
  const available = variant?.is_in_stock === true;

  function addToBag() {
    if (!variant || !available) return;
    addItem({ id: product.id, slug: product.slug, sku: variant.sku, title: product.title, price: price ?? variant.price, originalPrice: variant.price, imageUrl: image?.url ?? "", attributes: variant.attributes, variantId: variant.id, quantity: 1 });
  }

  return <li className={styles.productCard}>
    <Link href={href} className={`${styles.productImage} ${isMinimal ? styles.minimalImage : ""}`}>
      {product.is_new && <span className={styles.productBadge}>NEW ARRIVAL</span>}
      {image ? <Image src={image.url} alt={image.alt_text || product.title} fill sizes="(max-width: 600px) 85vw, (max-width: 1000px) 45vw, 25vw" className={styles.containImage} /> : <ShoppingBag size={45} strokeWidth={0.7} aria-label="Product image coming soon" />}
    </Link>
    <div className={styles.productInfo}>
      <span className={styles.productCategory}>{product.category?.name ?? "The collection"}</span>
      <Link href={href}><h3>{product.title}</h3></Link>
      <p className={styles.productPrice}>{price != null ? formatCurrency(price) : "Coming soon"}{variant && price != null && price < variant.price && <del>{formatCurrency(variant.price)}</del>}</p>
      <div className={styles.productActions}><Link href={href}>More details <span>↗</span></Link><button onClick={addToBag} disabled={!available} aria-label={available ? `Add ${product.title} to bag${quantity ? ` (${quantity} in bag)` : ""}` : `${product.title} is unavailable`} title={available ? "Add to bag" : "Unavailable"}>{quantity ? <Check size={16} /> : <ShoppingBag size={16} strokeWidth={1.3} />}</button></div>
    </div>
  </li>;
}
