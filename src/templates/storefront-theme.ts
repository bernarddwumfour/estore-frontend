/** Client/server-safe theme scope for shared storefront surfaces and portals. */
export const storefrontTheme = process.env.NEXT_PUBLIC_STORE === "furniture"
  ? "furniture-surface"
  : process.env.NEXT_PUBLIC_STORE === "tyrepapa" ? "tyrepapa-surface" : undefined;
