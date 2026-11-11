import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PromotionType } from "@/types/promotionTypes";
import styles from "../beauty.module.css";

export default function PromotionsPage({ promotions }: { promotions: PromotionType[] }) {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>VELUX / SPECIAL OFFERS</span><h1>A little <em>extra.</em></h1><p>Explore current offers and curated sets from the collection.</p></div></header>
    <section className={styles.editorialInner} aria-label="Current promotions"><div className={styles.editorialSectionHead}><span className={styles.eyebrow}>THE CURRENT EDIT</span><span>{promotions.length} OFFERS</span></div>
      {promotions.length ? <div className={styles.editorialGrid}>{promotions.map(promo => <Link href={`/promotions/${promo.slug}`} key={promo.id} className={styles.editorialCard}><article><div className={styles.editorialImage}>{promo.images?.[0]?.url ? <Image src={promo.images[0].url} alt={promo.images[0].alt_text || promo.name} fill sizes="(max-width: 700px) 90vw, 33vw" /> : <span>velux collection</span>}</div><div className={styles.editorialCardBody}><span className={styles.eyebrow}>THE COLLECTION / {promo.items?.length ?? 0} ITEMS</span><h2>{promo.name}</h2><p>{promo.description}</p><div className={styles.promoPrice}><strong>{formatCurrency(promo.bundle_price)}</strong>{promo.original_total > promo.bundle_price && <del>{formatCurrency(promo.original_total)}</del>}</div><span className={styles.editorialLink}>View offer <ArrowUpRight size={16} /></span></div></article></Link>)}</div> : <div className={styles.editorialEmpty}><h2>Good things are on the way.</h2><p>There are no active offers right now. Explore the collection while you wait.</p><Link href="/products" className={styles.editorialLink}>Shop the collection ↗</Link></div>}
    </section>
  </div>;
}
