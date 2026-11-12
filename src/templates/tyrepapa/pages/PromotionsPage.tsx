import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgePercent } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PromotionType } from "@/types/promotionTypes";
import EmptyState from "../components/EmptyState";
import styles from "../tyrepapa.module.css";

export default function PromotionsPage({
  promotions,
}: {
  promotions: PromotionType[];
}) {
  return (
    <div className={styles.editorialPage}>
      <header className={styles.editorialHero}>
        <div className={styles.editorialInner}>
          <span className={styles.eyebrow}>TYREPAPA / TYRE OFFERS</span>
          <h1>
            More miles. <em>Better value.</em>
          </h1>
          <p>Explore current offers on tyres and sets from the range.</p>
        </div>
      </header>

      <section className={styles.editorialInner} aria-label="Current promotions">
        <div className={styles.editorialSectionHead}>
          <span className={styles.eyebrow}>CURRENT OFFERS</span>
          <span>{promotions.length} OFFERS</span>
        </div>

        {promotions.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title="New offers are on the way"
            description="There are no active tyre offers right now. Explore the range while you wait."
            action={{ href: "/products", label: "Shop tyres" }}
          />
        ) : (
          <div className={styles.editorialGrid}>
            {promotions.map((promotion) => {
              const image = promotion.images?.[0];

              return (
                <Link
                  href={`/promotions/${promotion.slug}`}
                  key={promotion.id}
                  className={styles.editorialCard}
                >
                  <article>
                    <div className={styles.editorialImage}>
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={image.alt_text || promotion.name}
                          fill
                          sizes="(max-width: 700px) 90vw, 33vw"
                        />
                      ) : (
                        <span>TyrePapa offers</span>
                      )}
                    </div>

                    <div className={styles.editorialCardBody}>
                      <span className={styles.eyebrow}>
                        TYRE OFFER / {promotion.items?.length ?? 0} ITEMS
                      </span>
                      <h2>{promotion.name}</h2>
                      <p>{promotion.description}</p>

                      <div className={styles.promoPrice}>
                        <strong>{formatCurrency(promotion.bundle_price)}</strong>
                        {promotion.original_total > promotion.bundle_price && (
                          <del>{formatCurrency(promotion.original_total)}</del>
                        )}
                      </div>

                      <span className={styles.editorialLink}>
                        View offer <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
