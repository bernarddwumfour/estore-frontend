import type { ComponentType } from "react";
import type { PageHeaderProps } from "./contract";
import DefaultPageHeader from "./default/components/PageHeader";
import FurniturePageHeader from "./furniture/components/PageHeader";

/**
 * Client-safe accessor for the active store's page header.
 *
 * The simpler shared pages (cart, checkout, orders, order details, wishlist)
 * are client components, so they can't import the full template registry
 * (which pulls in server-only page compositions). This module only imports the
 * lightweight, presentational PageHeader components, so it is safe to import
 * from client components. The page body stays shared across stores — only this
 * header swaps per template.
 */
const headers: Record<string, ComponentType<PageHeaderProps>> = {
  default: DefaultPageHeader,
  furniture: FurniturePageHeader,
};

const activeStore = process.env.NEXT_PUBLIC_STORE ?? "default";

export const PageHeader: ComponentType<PageHeaderProps> =
  headers[activeStore] ?? headers.default;
