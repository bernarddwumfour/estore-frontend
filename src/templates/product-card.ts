import type { ComponentType } from "react";
import type { ProductCardProps } from "./contract";
import DefaultProductCard from "./default/components/ProductCard";
import FurnitureProductCard from "./furniture/components/ProductCard";

/**
 * Client-safe accessor for the active store's product card.
 *
 * Mirrors the registry's `T.ProductCard`, but imports only the (presentational)
 * card components — safe to use from client components like the wishlist page,
 * which can't import the full server-side template registry.
 */
const cards: Record<string, ComponentType<ProductCardProps>> = {
  default: DefaultProductCard,
  furniture: FurnitureProductCard,
};

const activeStore = process.env.NEXT_PUBLIC_STORE ?? "default";

export const ProductCard: ComponentType<ProductCardProps> =
  cards[activeStore] ?? cards.default;
