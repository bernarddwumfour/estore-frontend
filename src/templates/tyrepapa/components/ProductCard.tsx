"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import AddToWishList from "@/app/(web)/products/(components)/AddToWishList";
import { formatCurrency } from "@/lib/currency";
import type { ProductCardProps } from "../../contract";
import { tyreProductName } from "../product-name";
import BuyNowCartDialog from "@/components/storefront/BuyNowCartDialog";
import styles from "../tyrepapa.module.css";

function carNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map(item => item.trim());
  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

export default function ProductCard({ product, isMinimal = false }: ProductCardProps) {
  const variant = product.default_variant ?? product.variants[0];
  const attributes = variant?.attributes;
  const displayTitle = tyreProductName(product.title, attributes);
  const compatibleCars = Array.from(new Set([
    ...carNames(attributes?.compatible_vehicles),
    ...carNames(attributes?.vehicle_types),
  ]));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const items = useCartStore(s => s.items);
  const addItem = useCartStore(s => s.addItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeItem = useCartStore(s => s.removeItem);
  const router = useRouter();
  const cartKey = variant?.id || variant?.sku;
  const quantity = useCartStore(s => s.hasHydrated && cartKey ? s.getItemQuantity(cartKey) : 0);
  const href = product.variant_slug ? `/products/${product.slug}/${product.variant_slug}` : `/products/${product.slug}`;
  const price = variant?.discounted_price ?? variant?.price;
  const image = variant?.images?.[0];
  const available = variant?.is_in_stock === true;

  function addToBag() {
    if (!variant || !available) return;
    addItem({ id: product.id, slug: product.slug, sku: variant.sku, title: displayTitle, price: price ?? variant.price, originalPrice: variant.price, imageUrl: image?.url ?? "", attributes: variant.attributes, variantId: variant.id, quantity: 1 });
  }

  function buyNow() {
    if (!variant || !available) return;
    const hasOtherItems = items.some(item => item.variantId !== variant.id);
    addToBag();
    if (hasOtherItems) setIsDialogOpen(true);
    else router.push("/checkout");
  }

  function changeQuantity(delta: number) {
    if (!cartKey) return;
    const nextQuantity = quantity + delta;
    if (nextQuantity <= 0) removeItem(cartKey);
    else updateQuantity(cartKey, nextQuantity);
  }

  return <li className={styles.productCard}>
    <div className={styles.productMedia}>
      <Link href={href} className={`${styles.productImage} ${isMinimal ? styles.minimalImage : ""}`}>
        {product.is_new && <span className={styles.productBadge}>NEW ARRIVAL</span>}
        {image ? <Image src={image.url} alt={image.alt_text || displayTitle} fill sizes="(max-width: 600px) 85vw, (max-width: 1000px) 45vw, 25vw" className={styles.containImage} /> : <ShoppingBag size={45} strokeWidth={0.7} aria-label="Product image coming soon" />}
      </Link>
      {variant?.id && <AddToWishList variantId={variant.id} productTitle={displayTitle} className={styles.wishlistButton} />}
    </div>
    <div className={styles.productInfo}>
      <span className={styles.productCategory}>{product.category?.name ?? "Tyre range"}</span>
      <Link href={href}><h3>{displayTitle}</h3></Link>
      <p className={styles.productPrice}>{price != null ? formatCurrency(price) : "Coming soon"}{variant && price != null && price < variant.price && <del>{formatCurrency(variant.price)}</del>}</p>
      {compatibleCars.length > 0 && <div className={styles.compatibility} aria-label="Compatible cars">
        {compatibleCars.map(car => <span className={styles.compatibilityBadge} key={car}>{car}</span>)}
      </div>}
      <div className={styles.productActions}>
        {quantity > 0 ? (
          <div className={styles.cartStepper} aria-label={`${quantity} ${displayTitle} in cart`}>
            <button type="button" onClick={() => changeQuantity(-1)} aria-label={`Remove one ${displayTitle} from cart`}>
              <Minus size={16} />
            </button>
            <span aria-live="polite">{quantity} in cart</span>
            <button type="button" onClick={() => changeQuantity(1)} aria-label={`Add one more ${displayTitle} to cart`}>
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={addToBag} disabled={!available} aria-label={available ? `Add ${displayTitle} to cart` : `${displayTitle} is unavailable`}>
            <ShoppingBag size={16} strokeWidth={1.5} /> Add to cart
          </button>
        )}
        <button type="button" onClick={buyNow} disabled={!available} aria-label={available ? `Buy ${displayTitle} now` : `${displayTitle} is unavailable`}>
          Buy now <span>↗</span>
        </button>
      </div>
    </div>
    <BuyNowCartDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
  </li>;
}
