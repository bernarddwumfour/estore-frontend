import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Gift, Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PromotionType } from "@/types/promotionTypes";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

function formatEndDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PromotionsPage({
  promotions,
}: {
  promotions: PromotionType[];
}) {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="Exclusive Offers"
        title="More for Your Home"
        description="Discover current offers on furniture and thoughtfully paired pieces for your space."
      />

      <section className="container mx-auto px-4 py-16 lg:px-8" aria-label="Current promotions">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
              <span className="h-px w-6 bg-[#f5b21a]" />
              Current Offers
            </span>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Pieces worth making room for</h2>
          </div>
          <span className="shrink-0 text-xs font-semibold text-[#a6a08f]">
            {promotions.length} {promotions.length === 1 ? "offer" : "offers"}
          </span>
        </div>

        {promotions.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title="New offers are on the way"
            description="There are no active furniture offers right now. Explore the collection while you wait."
            action={{ href: "/products", label: "Shop furniture" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => {
              const image = promotion.images?.[0];
              const endDate = formatEndDate(promotion.ends_at);

              return (
                <Link
                  key={promotion.id}
                  href={`/promotions/${promotion.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#e7e1d3] bg-[#faf8f4] transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e7e1d3]">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.alt_text || promotion.name}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#a6a08f]">
                        <Package size={48} strokeWidth={1.2} aria-hidden="true" />
                      </div>
                    )}
                    {promotion.savings_amount > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#654035] px-3 py-1.5 text-xs font-bold text-white">
                        Save {formatCurrency(promotion.savings_amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#6b6b5a]">
                      <span className="inline-flex items-center gap-1">
                        <Package size={14} aria-hidden="true" />
                        {promotion.items?.length ?? 0} items
                      </span>
                      {(promotion.free_items?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[#654035]">
                          <Gift size={14} aria-hidden="true" />
                          {promotion.free_items.length} free
                        </span>
                      )}
                      {endDate && <span>Ends {endDate}</span>}
                    </div>

                    <h3 className="mt-4 text-xl font-bold leading-snug text-[#2b2b22]">
                      {promotion.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6b6b5a]">
                      {promotion.description || "A considered collection at a special price."}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-[#e7e1d3] pt-5">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <strong className="text-xl font-black text-[#2b2b22]">
                          {formatCurrency(promotion.bundle_price)}
                        </strong>
                        {promotion.original_total > promotion.bundle_price && (
                          <del className="text-sm text-[#a6a08f]">
                            {formatCurrency(promotion.original_total)}
                          </del>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#654035]">
                        View Offer <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
