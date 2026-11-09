/** Client/server-safe theme scope for shared storefront surfaces and portals. */
export const storefrontTheme = process.env.NEXT_PUBLIC_STORE === "furniture"
  ? "furniture-surface"
  : undefined;
