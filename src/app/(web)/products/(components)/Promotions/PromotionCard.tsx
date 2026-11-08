"use client";

import Image from "next/image";
import Link from "next/link";
import { PromotionType } from "@/types/promotionTypes";
import { Gift } from "lucide-react";

interface PromotionCardProps {
    promotion: PromotionType;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
    const hasImages = promotion.images && promotion.images.length > 0;
    const mainImage = hasImages ? promotion.images[0] : null;

    return (
        <Link
            href={`/promotions/${promotion.slug}`}
            aria-label={`View promotion: ${promotion.name}`}
            className="group relative block aspect-[6/3] overflow-hidden rounded-[2rem] border border-slate-100 bg-[#f8f9fa] transition-all duration-300 hover:border-slate-200 hover:shadow-sm md:aspect-[8/3]"
        >
            {mainImage ? (
                <Image
                    src={mainImage.url}
                    alt={mainImage.alt_text || promotion.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                    <Gift className="size-10" strokeWidth={1.4} />
                </div>
            )}
        </Link>
    );
}
