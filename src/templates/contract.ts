import type { ComponentType } from "react";
import type { ProductType } from "@/types/productTypes";

/**
 * The set of presentational slots a store template may override.
 *
 * Every store provides the SAME component shapes (same props), so the shared
 * containers/routes never change — only the look/layout swaps per store. Data
 * fetching, cart, auth and checkout stay shared and are never part of this
 * contract.
 *
 * A store implements `default` for every slot; other stores override only the
 * deltas and inherit the rest (see registry.ts).
 */
export interface ProductCardProps {
  product: ProductType;
  isMinimal?: boolean;
}

export interface ProductsPageProps {
  /** Already-resolved URL search params for the /products route. */
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface PageHeaderProps {
  /** Big page heading. */
  title: string;
  /** Small eyebrow/kicker shown above the title. */
  subtitle?: string;
  /** Optional supporting paragraph shown under the title. */
  description?: string;
}

export interface Template {
  /** The storefront homepage composition. */
  HomePage: ComponentType;
  /** A single product card, used by the shared ProductsGrid container. */
  ProductCard: ComponentType<ProductCardProps>;
  /** Storefront top navigation, rendered by the shared (web) layout. */
  Navbar: ComponentType;
  /** Storefront footer, rendered by the shared (web) layout. */
  Footer: ComponentType;
  /** The /blog listing page composition. */
  BlogPage: ComponentType;
  /** The /contact page composition. */
  ContactPage: ComponentType;
  /** The /about page composition. */
  AboutPage: ComponentType;
  /** The /products listing page composition (receives resolved searchParams). */
  ProductsPage: ComponentType<ProductsPageProps>;
}
