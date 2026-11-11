import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { ProductType } from "@/types/productTypes";
import ProductShelf from "../components/ProductShelf";
import styles from "../beauty.module.css";

const categories = [
  { name: "Facial wash", description: "A fresh start for your daily ritual.", search: "facial wash" },
  { name: "Moisturisers", description: "Make a little room for everyday comfort.", search: "moisturiser" },
  { name: "Serums", description: "The finishing touch to your shelf.", search: "serum" },
];

const shop = (search: string) => `/products?q=${encodeURIComponent(search)}`;

function CampaignProducts({ label }: { label: string }) {
  // Display the left panel of the diptych without cropping the packaging.
  return <svg viewBox="0 0 1 2" role="img" aria-label={label} className={styles.campaignProducts}><svg width="1" height="2" overflow="hidden"><image href="/beauty/editorial.webp" width="2" height="2" /></svg></svg>;
}

async function Collection() {
  let products: ProductType[] = [];
  let unavailable = false;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    try {
      const url = new URL(`${base.replace(/\/+$/, "")}/${endpoints.products.listProductsWeb.replace(/^\//, "")}`);
      url.search = new URLSearchParams({ limit: "8", display: "variants", sort_by: "created_at", sort_order: "desc" }).toString();
      const response = await fetch(url, { next: { revalidate: 300, tags: ["products"] }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error("Catalog unavailable");
      const data = await response.json();
      if (!data.success) throw new Error("Catalog unavailable");
      products = data.data?.products ?? [];
    } catch { unavailable = true; }
  }
  return <section id="collection" className={styles.collection} aria-label="Shop the collection">
    {products.length ? <ProductShelf products={products} /> : <>
      <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>THE BEAUTY EDIT</span><h2>Meet your daily essentials.</h2></div><span className={styles.previewLabel}>COLLECTION PREVIEW</span></div>
      <div className={styles.previewCollection}>
        <div className={styles.previewImage}><CampaignProducts label="Velux skincare campaign with black and gold packaging" /></div>
        <div className={styles.previewCopy}><span className={styles.eyebrow}>A MORE CONSIDERED ROUTINE</span><h3>Good things.<br />Small rituals.</h3><p>{unavailable ? "Our collection is taking a moment. Please check back soon, or get in touch for help finding your essentials." : "A first look at the velux collection. Explore the essentials as they arrive, and find a little inspiration for your everyday."}</p><Link href="/contact" className={styles.textLink}>Get in touch <ArrowUpRight size={17} /></Link></div>
      </div>
    </>}
    <div className={styles.centerAction}><Link className={styles.darkButton} href="/products">Explore all products <ArrowUpRight size={15} /></Link></div>
  </section>;
}

export default function HomePage() {
  return <div className={styles.page} id="top">
    <section className={styles.hero} aria-labelledby="beauty-title">
      <Image src="/beauty/hero.webp" alt="Floating black and gold Velux facial wash and luminous serum bottles" fill priority sizes="100vw" className={styles.heroImage} />
      <div className={styles.heroContent}><span className={styles.eyebrow}>A MOMENT FOR YOU. A RITUAL FOR YOUR SKIN.</span><h1 id="beauty-title">The world shines with<br />your <em>beautiful</em> face.</h1><p>Discover the beauty of a little everyday care.</p><Link href="/products" className={styles.heroButton}>Discover the collection <ArrowUpRight size={16} /></Link></div>
      <Link href={shop("serum")} className={`${styles.heroNote} ${styles.serumNote}`}><span className={styles.noteNumber}>01</span><span>Luminous serum<small>A little everyday radiance</small></span><ArrowUpRight size={18} /></Link>
      <Link href={shop("facial wash")} className={`${styles.heroNote} ${styles.washNote}`}><span className={styles.noteNumber}>02</span><span>Facial wash<small>Your fresh-start essential</small></span><ArrowUpRight size={18} /></Link>
      <div className={styles.heroBottom}><span>THE EVERYDAY COLLECTION — VOL. 01</span><a href="#our-story">Scroll to discover ↓</a></div>
    </section>

    <div className={styles.wordStrip} aria-label="The Velux approach"><span>less, but better.</span><Sparkles size={20} strokeWidth={1} /><span>care with intention.</span><Sparkles size={20} strokeWidth={1} /><span>beauty in the everyday.</span></div>

    <section className={styles.categories} aria-label="Explore skincare">
      <div className={styles.categoryIntro}><span className={styles.eyebrow}>YOUR DAILY DOSE OF</span><h2>A little luxury.</h2><Link href="/products">Find your essentials <ArrowRight size={16} /></Link></div>
      {categories.map((category, i) => <Link className={styles.category} key={category.name} href={shop(category.search)}><span className={styles.categoryNumber}>0{i + 1}</span><h3>{category.name}</h3><p>{category.description}</p><ArrowRight size={18} strokeWidth={1} /></Link>)}
      <Link href="/products" className={styles.allCategories}><ArrowUpRight size={28} strokeWidth={1} /><span>VIEW<br />ALL</span></Link>
    </section>

    <section id="our-story" className={styles.story} aria-labelledby="story-title">
      <div className={styles.storyLeft}><div className={styles.trioImage}><CampaignProducts label="A Velux facial wash, cream and skincare tube on sunlit stone" /></div><div className={styles.storyCopy}><span className={styles.eyebrow}>THE ART OF EVERYDAY CARE</span><h2 id="story-title">Your own moment<br />of <em>beautiful.</em></h2><p>A quieter morning. A slower evening. A few essentials that make your routine feel like a ritual. Welcome to a little time just for you.</p><Link href="/products" className={styles.darkButton}>Meet the collection <ArrowUpRight size={15} /></Link></div></div>
      <div className={styles.portrait}><Image src="/beauty/editorial.webp" alt="Sunlit close-up portrait showing natural skin texture" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className={`${styles.skinCircle} ${styles.circleOne}`} /><span className={`${styles.skinCircle} ${styles.circleTwo}`} /><span className={`${styles.skinCircle} ${styles.circleThree}`} /><div className={styles.portraitCaption}><span>BEAUTIFULLY, UNAPOLOGETICALLY.</span><p>You, as you are.</p></div></div>
    </section>

    <Suspense fallback={<section className={styles.collection} aria-busy="true"><span className={styles.eyebrow}>THE BEAUTY EDIT</span><h2>Discovering your essentials…</h2><div className={styles.loadingShelf}>{[1, 2, 3, 4].map(i => <div key={i} />)}</div></section>}><Collection /></Suspense>

    <section id="the-ritual" className={styles.ritual} aria-labelledby="ritual-title"><div className={styles.ritualInner}><div className={styles.ritualIntro}><span className={styles.eyebrow}>LESS RUSH. MORE RITUAL.</span><h2 id="ritual-title">Make room<br />for <em>you.</em></h2><p>Find the pieces that belong in your routine.<br />Keep the moments that make it yours.</p><Link href="/products" className={styles.textLink}>Build your daily ritual <ArrowUpRight size={18} /></Link></div><div className={styles.ritualSteps}>{[{ title: "A fresh beginning", text: "Start with your cleansing essentials.", search: "cleanser" }, { title: "A moment of care", text: "Explore serums and moisturisers.", search: "serum" }, { title: "The finishing touch", text: "Find your daytime skincare essentials.", search: "sunscreen" }].map((step, i) => <Link href={shop(step.search)} key={step.title}><span>0{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowUpRight size={23} strokeWidth={1} /></Link>)}</div></div></section>
    <section className={styles.contactBand}><span className={styles.eyebrow}>A PERSONAL TOUCH</span><h2>Your next chapter<br />in skincare starts here.</h2><Link href="/contact" className={styles.darkButton}>Let’s find your essentials <ArrowUpRight size={16} /></Link></section>
  </div>;
}
