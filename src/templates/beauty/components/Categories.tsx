import Link from "next/link";
import Image from "next/image";
import { endpoints } from "@/constants/endpoints/endpoints";
import styles from "../beauty.module.css";

type Category = { id: string; name: string; slug: string; image?: string | null };

async function getCategories(): Promise<Category[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return [];

  try {
    const url = new URL(`${base.replace(/\/+$/, "")}${endpoints.products.listCategories}`);
    url.searchParams.set("limit", "100");
    const response = await fetch(url, { next: { revalidate: 300, tags: ["categories"] }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) return [];
    const data = await response.json();
    return data.success && Array.isArray(data.data?.categories) ? data.data.categories : [];
  } catch {
    return [];
  }
}

export default async function Categories({ currentCategory }: { currentCategory?: string }) {
  const categories = await getCategories();
  const imageCategory = categories.find(category => category.slug === currentCategory && category.image) ?? categories.find(category => category.image);

  return <section className={`${styles.shopCategoryFeature} ${imageCategory ? styles.shopCategoryWithImage : ""}`} aria-label="Shop by category">
    <div className={styles.shopCategoryNav}>
      <div className={styles.shopCategoryHeading}><span className={styles.eyebrow}>SHOP BY CATEGORY</span><h2>Choose your route.</h2></div>
      <div className={styles.shopCategoryLinks}>
        <Link href="/products" scroll={false} aria-current={!currentCategory ? "page" : undefined} className={`${styles.shopCategoryLink} ${!currentCategory ? styles.shopCategoryLinkActive : ""}`}>All tyres</Link>
        {categories.map(category => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} scroll={false} aria-current={currentCategory === category.slug ? "page" : undefined} className={`${styles.shopCategoryLink} ${currentCategory === category.slug ? styles.shopCategoryLinkActive : ""}`}>{category.name}</Link>)}
      </div>
      {!categories.length && <p className={styles.shopCategoryEmpty}>More categories will appear here when they are available.</p>}
    </div>
    {imageCategory?.image && <div className={styles.shopCategoryMedia}><Image src={imageCategory.image} alt={`${imageCategory.name} category`} fill sizes="(max-width: 700px) 23vw, 13vw" className={styles.shopCategoryPhoto} /></div>}
  </section>;
}
