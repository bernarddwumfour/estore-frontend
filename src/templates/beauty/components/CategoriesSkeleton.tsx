import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "../beauty.module.css";

export default function CategoriesSkeleton({ page }: { page: "home" | "products" }) {
  if (page === "home") {
    return <section className={styles.categories} aria-label="Loading categories" aria-busy="true">
      <span className={styles.visuallyHidden}>Loading categories</span>
      <div className={styles.categoriesHeading}>
        <div className={styles.categoriesHeadingCopy}><span className={styles.eyebrow}>EXPLORE THE RANGE</span><h2>Find your <em>fit.</em></h2></div>
        <Link href="/products">Shop all tyres <ArrowUpRight size={16} /></Link>
      </div>
      <div className={styles.categoryGrid} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => <div className={styles.categoryTile} key={index}>
          <span className={styles.categoryNumber}>{String(index + 1).padStart(2, "0")} / CATEGORY</span>
          <span className={`${styles.categoryTileImage} ${styles.categorySkeletonPulse}`} />
          <span className={`${styles.categorySkeletonName} ${styles.categorySkeletonPulse}`} />
          <span className={`${styles.categorySkeletonCount} ${styles.categorySkeletonPulse}`} />
        </div>)}
      </div>
    </section>;
  }

  return <section className={`${styles.shopCategoryFeature} ${styles.shopCategoryWithImage}`} aria-label="Loading categories" aria-busy="true">
    <span className={styles.visuallyHidden}>Loading categories</span>
    <div className={styles.shopCategoryNav}>
      <div className={styles.shopCategoryHeading}><span className={styles.eyebrow}>SHOP BY CATEGORY</span><h2>Choose your route.</h2></div>
      <div className={styles.shopCategoryLinks} aria-hidden="true">
        {[82, 100, 116, 90, 108, 96].map((width, index) => <span key={index} className={`${styles.categorySkeletonPill} ${styles.categorySkeletonPulse}`} style={{ width }} />)}
      </div>
    </div>
    <div className={`${styles.shopCategoryMedia} ${styles.categorySkeletonPulse}`} aria-hidden="true" />
  </section>;
}
