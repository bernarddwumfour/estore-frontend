
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowUpRight,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCartStore } from "@/app/lib/store/cart-store";
import { formatCurrency } from "@/lib/currency";

import type {
  AssistantProduct,
} from "@/lib/ai-assistant/api";
import AddToWishList from "@/app/(web)/products/(components)/AddToWishList";
import type { AssistantTheme } from "./theme";

interface ProductResultsProps {
  products: AssistantProduct[];
  theme: AssistantTheme;
  getProductHref?: (
    product: AssistantProduct
  ) => string;
}

function ProductCard({
  product,
  href,
  theme,
}: {
  product: AssistantProduct;
  href?: string;
  theme: AssistantTheme;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);

  const variants = product.variants ?? [];

  const [selectedVariantId, setSelectedVariantId] =
    useState<string>("");

  useEffect(() => {
    setSelectedVariantId(
      variants.length === 1 ? variants[0].id : ""
    );
  }, [product.id, product.variants]);

  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  );

  const hasMultipleVariants = variants.length > 1;

  const canAdd =
    !!selectedVariant && selectedVariant.is_in_stock;

  const inCart = selectedVariant
    ? isInCart(selectedVariant.sku)
    : false;

  const selectedPrice = selectedVariant
    ? selectedVariant.discounted_price ??
      selectedVariant.price
    : product.min_price;

  const selectedImage =
    selectedVariant?.image || product.image;

  const handleAddToCart = () => {
    if (!selectedVariant?.is_in_stock) return;

    if (isInCart(selectedVariant.sku)) {
      toast.info("This variant is already in your cart.");
      return;
    }

    addItem({
      id: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
      title: product.title,
      price:
        selectedVariant.discounted_price ??
        selectedVariant.price,
      imageUrl: selectedImage ?? "",
      quantity: 1,
      originalPrice: selectedVariant.price,
      attributes: selectedVariant.attributes,
      variantId: selectedVariant.id,
    });

    toast.success("Added to cart");
  };

  const variantLabel = (
    variant: (typeof variants)[number]
  ) => {
    const attributes = Object.values(
      variant.attributes ?? {}
    ).filter(Boolean);

    return attributes.length
      ? attributes.join(" · ")
      : variant.sku;
  };

  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border transition-colors ${theme.productCard}`}>
      {href ? (
        <Link href={href} className="block">
          <ProductImage
            image={selectedImage}
            title={product.title}
            theme={theme}
          />
        </Link>
      ) : (
        <ProductImage
          image={selectedImage}
          title={product.title}
          theme={theme}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        {href ? (
          <Link
            href={href}
            className="flex items-start justify-between gap-1"
          >
            <h4 className="min-w-0 line-clamp-2 break-words text-sm font-medium">
              {product.title}
            </h4>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : (
          <h4 className="line-clamp-2 text-sm font-medium">
            {product.title}
          </h4>
        )}

        <div className="mt-auto space-y-1">
          {selectedPrice != null && (
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(Number(selectedPrice))}
            </p>
          )}

          <p
            className={
              selectedVariant
                ? selectedVariant.is_in_stock
                  ? "text-xs text-emerald-600"
                  : "text-xs text-muted-foreground"
                : product.has_stock
                  ? "text-xs text-emerald-600"
                  : "text-xs text-muted-foreground"
            }
          >
            {selectedVariant
              ? selectedVariant.is_in_stock
                ? "In stock"
                : "Out of stock"
              : product.has_stock
                ? "In stock"
                : "Out of stock"}
          </p>
        </div>

        {hasMultipleVariants && (
          <Select
            value={selectedVariantId}
            onValueChange={setSelectedVariantId}
          >
            <SelectTrigger className="h-8 w-full min-w-0 text-xs">
              <SelectValue placeholder="Choose variant" />
            </SelectTrigger>

            <SelectContent>
              {variants.map((variant) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                >
                  {variantLabel(variant)}
                  {!variant.is_in_stock
                    ? " (Out of stock)"
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="mt-1 grid grid-cols-2 gap-1.5 border-t border-current/10 pt-2">
          {canAdd && selectedVariant ? (
            <AddToWishList
              key={selectedVariant.id}
              variantId={selectedVariant.id}
              productTitle={product.title}
              variant="button"
              className={theme.cardOutlineButton}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className={`w-full px-1 text-xs ${theme.cardOutlineButton}`}
            >
              Wishlist
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={!canAdd || inCart}
            onClick={handleAddToCart}
            className={`h-9 w-full gap-1 px-1 text-xs ${theme.cardPrimaryButton}`}
          >
            <ShoppingCart className="size-3.5 shrink-0" />
            {inCart ? "In cart" : "Add"}
          </Button>
        </div>

        {variants.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Shopping options are unavailable.
          </p>
        )}
      </div>
    </article>
  );
}

function ProductImage({
  image,
  title,
  theme,
}: {
  image: string | null | undefined;
  title: string;
  theme: AssistantTheme;
}) {
  return (
    <div className={`relative aspect-square w-full overflow-hidden ${theme.productImage}`}>
      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Package className="size-10 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

export function ProductResults({
  products,
  getProductHref,
  theme,
}: ProductResultsProps) {
  if (!products.length) return null;

  return (
    <section
      aria-label="Matching products"
      className="w-full min-w-0 max-w-full overflow-hidden"
    >
      <p className={`mb-2 text-xs font-medium ${theme.mutedText}`}>
        Matching products
      </p>

      <div className="grid min-w-0 grid-cols-2 gap-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            href={getProductHref?.(product)}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}
