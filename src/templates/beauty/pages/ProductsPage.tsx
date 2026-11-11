import { Suspense } from "react";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import ProductsGridWrapper from "@/app/(web)/products/(components)/ProductsGridWrapper";
import { AdvancedFilters } from "@/widgets/advanced-filters/AdvancedFilters";
import type { ProductsPageProps } from "../../contract";
import styles from "../beauty.module.css";

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <div className={styles.shopPage} data-storefront-theme="beauty-surface">
    <header className={styles.shopHero}>
      <div className={styles.shopHeroInner}>
        <span className={styles.eyebrow}>VELUX / THE COLLECTION</span>
        <h1>Skincare, <em>considered.</em></h1>
        <p>Discover the essentials for a ritual that feels like yours.</p>
      </div>
    </header>
    <section className={styles.shopBody} aria-label="Browse products">
      <div className={styles.shopSectionHeading}><span className={styles.eyebrow}>THE BEAUTY EDIT</span><span>EXPLORE THE COLLECTION ↓</span></div>
      <Suspense fallback={<ProductsGridSkeleton />}>
        <div className={styles.shopLayout}>
          <aside className={styles.shopFilters} aria-label="Product filters"><AdvancedFilters /></aside>
          <div className={styles.shopResults}><ProductsGridWrapper searchParams={searchParams} /></div>
        </div>
      </Suspense>
    </section>
  </div>;
}
