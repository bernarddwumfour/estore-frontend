import { Suspense } from "react";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import ProductsGridWrapper from "@/app/(web)/products/(components)/ProductsGridWrapper";
import { AdvancedFilters } from "@/widgets/advanced-filters/AdvancedFilters";
import Categories from "../components/Categories";
import CategoriesSkeleton from "../components/CategoriesSkeleton";
import type { ProductsPageProps } from "../../contract";
import styles from "../beauty.module.css";

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <div className={styles.shopPage} data-storefront-theme="beauty-surface">
    <Suspense fallback={<CategoriesSkeleton page="products" />}>
      <Categories currentCategory={typeof searchParams.category === "string" ? searchParams.category : undefined} />
    </Suspense>
    <section className={styles.shopBody} aria-label="Browse products">
      <div className={styles.shopLayout}>
        <aside className={styles.shopFilters} aria-label="Product filters"><Suspense fallback={<p>Loading filters...</p>}><AdvancedFilters /></Suspense></aside>
        <div className={styles.shopResults}><Suspense fallback={<ProductsGridSkeleton />}><ProductsGridWrapper searchParams={searchParams} /></Suspense></div>
      </div>
    </section>
  </div>;
}
