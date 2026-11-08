"use client";

import Link from "next/link";
import { ArrowUpRight, Gift } from "lucide-react";

import { formatCurrency } from "@/lib/currency";
import type { AssistantPromotion } from "@/lib/ai-assistant/api";
import type { AssistantTheme } from "./theme";

export function PromotionResults({ promotions, theme }: {
  promotions: AssistantPromotion[];
  theme: AssistantTheme;
}) {
  if (!promotions.length) return null;

  return (
    <div className="ml-10 grid min-w-0 gap-3 sm:grid-cols-2">
      {promotions.map(promotion => (
        <article key={promotion.slug} className={`overflow-hidden rounded-xl border ${theme.productCard}`}>
          <Link href={`/promotions/${promotion.slug}`} className="block">
            {promotion.images[0]?.url
              ? <img src={promotion.images[0].url} alt={promotion.images[0].alt_text || promotion.name} className="aspect-[16/9] w-full object-cover" />
              : <div className="flex aspect-[16/9] items-center justify-center bg-amber-50 text-amber-700"><Gift className="size-10" /></div>}
          </Link>
          <div className="space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold">{promotion.name}</h3>
              {promotion.savings_percentage > 0 && <span className="shrink-0 rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700">Save {Math.round(promotion.savings_percentage)}%</span>}
            </div>
            {promotion.description && <p className={`line-clamp-2 text-xs ${theme.mutedText}`}>{promotion.description}</p>}
            <p className="text-base font-bold">{formatCurrency(promotion.bundle_price)}</p>
            <p className={`line-clamp-2 text-xs ${theme.mutedText}`}>
              Includes {promotion.items.map(item => `${item.quantity > 1 ? `${item.quantity} × ` : ''}${item.product_title}${item.is_free ? ' (free)' : ''}`).join(', ')}
            </p>
            <Link href={`/promotions/${promotion.slug}`} className={`inline-flex items-center gap-1 text-xs font-semibold ${theme.cardPrimaryButton}`}>
              View promotion <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
