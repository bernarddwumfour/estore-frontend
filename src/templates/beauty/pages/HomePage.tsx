import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { ProductType } from "@/types/productTypes";
import ProductShelf from "../components/ProductShelf";
import CategoriesSkeleton from "../components/CategoriesSkeleton";
import styles from "../beauty.module.css";

type StoreCategory = { id: string; name: string; slug: string; image?: string | null; product_count?: number };

async function Categories() {
  let categories: StoreCategory[] = [];
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    try {
      const url = new URL(`${base.replace(/\/+$/, "")}${endpoints.products.listCategories}`);
      url.searchParams.set("limit", "8");
      const response = await fetch(url, { next: { revalidate: 300, tags: ["categories"] }, signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error("Categories unavailable");
      const data = await response.json();
      if (data.success && Array.isArray(data.data?.categories)) categories = data.data.categories.slice(0, 8);
    } catch { /* Keep a useful route to the full collection. */ }
  }
  return <section className={styles.categories} aria-label="Explore categories">
    <div className={styles.categoriesHeading}><div className={styles.categoriesHeadingCopy}><span className={styles.eyebrow}>EXPLORE THE RANGE</span><h2>Find your <em>fit.</em></h2></div><Link href="/products">Shop all tyres <ArrowUpRight size={16} /></Link></div>
    {categories.length ? <div className={styles.categoryGrid}>{categories.map((category, i) => <Link className={styles.categoryTile} key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`}><span className={styles.categoryNumber}>{String(i + 1).padStart(2, "0")} / CATEGORY</span>{category.image && <div className={styles.categoryTileImage}><Image src={category.image} alt="" fill sizes="(max-width: 700px) 16vw, (max-width: 900px) 18vw, 9vw" className={styles.categoryTilePhoto} /></div>}<h3>{category.name}</h3><span className={styles.categoryTileBottom}>{typeof category.product_count === "number" ? `${category.product_count} tyres` : "Explore category"}<ArrowRight size={18} strokeWidth={1} /></span></Link>)}</div> : <div className={styles.categoryEmpty}>Tyre categories are coming soon. <Link href="/products">Shop all tyres ↗</Link></div>}
  </section>;
}

const shop = (search: string) => `/products?q=${encodeURIComponent(search)}`;

function CampaignProducts() {
  // Display the left panel of the diptych without cropping the packaging.
  return <svg viewBox="0 0 1 2" aria-hidden="true" className={styles.campaignProducts}><svg width="1" height="2" overflow="hidden"><image href="/beauty/editorial.webp" width="2" height="2" /></svg></svg>;
}

async function Collection() {
  let products: ProductType[] = [];
  let unavailable = false;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    try {
      const url = new URL(`${base.replace(/\/+$/, "")}/${endpoints.products.listProductsWeb.replace(/^\//, "")}`);
      url.search = new URLSearchParams({ limit: "24", display: "variants", sort_by: "created_at", sort_order: "desc" }).toString();
      const response = await fetch(url, { next: { revalidate: 300, tags: ["products"] }, signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error("Catalog unavailable");
      const data = await response.json();
      if (!data.success) throw new Error("Catalog unavailable");
      const available: ProductType[] = data.data?.products ?? [];
      // Randomize a small API batch here; backend random ordering is slow.
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      products = available.slice(0, 8);
    } catch { unavailable = true; }
  }
  return <section id="collection" className={styles.collection} aria-label="Shop tyres">
    {products.length ? <ProductShelf products={products} /> : <div className={styles.bestsellerEmpty}><span className={styles.eyebrow}>SHOP THE RANGE</span><h2>Tyres for the road ahead.</h2><p>{unavailable ? "The range is unavailable right now. Please check back soon." : "No tyres are available yet. Check back soon or explore the full range."}</p></div>}
    <div className={styles.centerAction}><Link className={styles.darkButton} href="/products">Shop all tyres <ArrowUpRight size={15} /></Link></div>
  </section>;
}

export default function HomePage() {
  return <div className={styles.page} id="top">
    <section className={styles.hero} aria-labelledby="tyre-title">
      <Image src="/beauty/tyre-hero.png" alt="" fill priority sizes="100vw" className={styles.heroImage} />
      <div className={styles.heroContent}><span className={styles.eyebrow}>CAR TYRES FOR THE ROAD AHEAD.</span><h1 id="tyre-title">Tyres for every car.<br /><em>Ready for every road.</em></h1><p>Explore tyre sizes and styles to find the right fit for your drive.</p><Link href="/products" className={styles.heroButton}>Shop car tyres <ArrowUpRight size={16} /></Link></div>
      <Link href={shop("all-season")} className={`${styles.heroNote} ${styles.serumNote}`}><span className={styles.noteNumber}>01</span><span>All-season tyres<small>For changing conditions</small></span><ArrowUpRight size={18} /></Link>
      <Link href={shop("performance")} className={`${styles.heroNote} ${styles.washNote}`}><span className={styles.noteNumber}>02</span><span>Performance tyres<small>For a more responsive drive</small></span><ArrowUpRight size={18} /></Link>
      <div className={styles.heroBottom}><span>THE TYREPAPA RANGE</span><a href="#our-story">Scroll to explore ↓</a></div>
    </section>

    <div className={styles.wordStrip} aria-label="The TyrePapa approach"><span>find your fit.</span><Sparkles size={20} strokeWidth={1} /><span>choose your road.</span><Sparkles size={20} strokeWidth={1} /><span>enjoy every mile.</span></div>

    <Suspense fallback={<CategoriesSkeleton page="home" />}><Categories /></Suspense>

    <Suspense fallback={<section className={styles.collection} aria-busy="true"><span className={styles.eyebrow}>SHOP THE RANGE</span><h2>Tyres for the road ahead.</h2><div className={styles.loadingShelf}>{[1, 2, 3, 4].map(i => <div key={i} />)}</div></section>}><Collection /></Suspense>

    <section id="our-story" className={styles.story} aria-labelledby="story-title">
      <div className={styles.storyLeft}><div className={styles.trioImage}><CampaignProducts /></div><div className={styles.storyCopy}><span className={styles.eyebrow}>MADE FOR THE MILES AHEAD</span><h2 id="story-title">Wherever the road<br /><em>takes you.</em></h2><p>Every drive starts with a choice. From the daily commute to the long way home, explore tyres suited to your car and the journeys you make.</p><Link href="/products" className={styles.darkButton}>Explore the range <ArrowUpRight size={15} /></Link></div></div>
      <div className={styles.portrait}><Image src="/beauty/editorial.webp" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className={`${styles.skinCircle} ${styles.circleOne}`} /><span className={`${styles.skinCircle} ${styles.circleTwo}`} /><span className={`${styles.skinCircle} ${styles.circleThree}`} /><div className={styles.portraitCaption}><span>READY FOR WHAT&apos;S NEXT.</span><p>Keep moving.</p></div></div>
    </section>



    <section id="the-ritual" className={styles.ritual} aria-labelledby="ritual-title"><div className={styles.ritualInner}><div className={styles.ritualIntro}><span className={styles.eyebrow}>A SET FOR EVERY JOURNEY</span><h2 id="ritual-title">Start with<br />the <em>right fit.</em></h2><p>Explore tyres for the way you drive.<br />Find your next set in a few simple steps.</p><Link href="/products" className={styles.textLink}>Browse all tyres <ArrowUpRight size={18} /></Link></div><div className={styles.ritualSteps}>{[{ title: "Everyday driving", text: "Explore tyres for daily routes and commutes.", search: "all-season" }, { title: "Changing seasons", text: "Find options for different weather and roads.", search: "seasonal" }, { title: "A spirited drive", text: "Browse performance focused tyres.", search: "performance" }].map((step, i) => <Link href={shop(step.search)} key={step.title}><span>0{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowUpRight size={23} strokeWidth={1} /></Link>)}</div></div></section>
    <section className={styles.contactBand}><span className={styles.eyebrow}>HERE TO HELP</span><h2>Not sure which tyres<br />are right for your car?</h2><Link href="/contact" className={styles.darkButton}>Talk to us <ArrowUpRight size={16} /></Link></section>
  </div>;
}
