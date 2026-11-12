import { storefrontTheme } from "./storefront-theme";
import { tyreProductName } from "./tyrepapa/product-name";

export function storefrontProductName(title: string, attributes?: Record<string, unknown> | null): string {
  return storefrontTheme === "tyrepapa-surface" ? tyreProductName(title, attributes) : title;
}
