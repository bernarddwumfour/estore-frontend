import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgePercent } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PromotionType } from "@/types/promotionTypes";
import EmptyState from "../components/EmptyState";
import styles from "../tyrepapa.module.css";

export default function PromotionsPage({ promotions }: { promotions: PromotionType[] }) {
  return <div className={styles.editorialPage}>
    <header className={styles.editorialHero}><div className={styles.editorialInner}><span className={styles.eyebrow}>TYREPAPA / TYRE OFFERS</span><h1>More miles. <em>Better value.</em></h1><p>Explore current offers on tyres and sets from the range.</p></div></header>
    <section className={styles.editorialInner} aria-label="Current promotions"><div className={styles.editorialSectionHead}><span className={styles.eyebrow}>CURRENT OFFERS</span><span>{promotions.length} OFFERS</span></div>
      {promotions.length ? <div className={styles.editorialGrid}>{promotions.map(promo => <Link href={`/promotions/${promo.slug}`} key={promo.id} className={styles.editorialCard}><article><div className={styles.editorialImage}>{promo.images?.[0]?.url ? <Image src={promo.images[0].url} alt={promo.images[0].alt_text || promo.name} fill sizes="(max-width: 700px) 90vw, 33vw" /> : <span>TyrePapa offers</span>}</div><div className={styles.editorialCardBody}><span className={styles.eyebrow}>TYRE OFFER / {promo.items?.length ?? 0} ITEMS</span><h2>{promo.name}</h2><p>{promo.description}</p><div className={styles.promoPrice}><strong>{formatCurrency(promo.bundle_price)}</strong>{promo.original_total > promo.bundle_price && <del>{formatCurrency(promo.original_total)}</del>}</div><span className={styles.editorialLink}>View offer <ArrowUpRight size={16} /></span></div></article></Link>)}</div> : <EmptyState icon={BadgePercent} title="New offers are on the way" description="There are no active tyre offers right now. Explore the range while you wait." action={{ href: "/products", label: "Shop tyres" }} />}
    </section>
  </div>;
}
