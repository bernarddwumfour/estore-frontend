// The default store's product card is the original storefront card, unchanged.
import Product from "@/app/(web)/products/Product";
import type { ProductCardProps } from "../../contract";

export default function ProductCard(props: ProductCardProps) {
  return <Product {...props} />;
}
