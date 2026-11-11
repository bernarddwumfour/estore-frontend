import ProductCard from "./ProductCard";
import type { ProductType } from "@/types/productTypes";
import styles from "../beauty.module.css";

export default function ProductShelf({ products }: { products: ProductType[] }) {
  return <>
    <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>SHOP THE RANGE</span><h2>Tyres for the road ahead.</h2></div><span className={styles.previewLabel}>EIGHT TO EXPLORE</span></div>
    <ul className={styles.bestsellerGrid}>{products.map(product => <ProductCard key={product.variant_slug ?? product.id} product={product} />)}</ul>
  </>;
}
