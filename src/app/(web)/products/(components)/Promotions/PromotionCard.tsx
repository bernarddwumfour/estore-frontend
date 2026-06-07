"use client";

import Image from "next/image";
import { PromotionType } from "@/types/promotionTypes";
import { useState } from "react";
import PromotionDetailModal from "./PromotionDetailModal";

interface PromotionCardProps {
    promotion: PromotionType;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasImages = promotion.images && promotion.images.length > 0;
    const mainImage = hasImages ? promotion.images[0] : null;

    return (
        <>
            <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 aspect-[6/3] md:aspect-[8/3] transition-all duration-300 hover:shadow-lg"
                onClick={() => setIsModalOpen(true)}
            >
                {mainImage ? (
                    <Image
                        src={mainImage.url}
                        alt={mainImage.alt_text || promotion.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-amber-400">
                        <div className="text-4xl mb-2">🎁</div>
                        <span className="text-sm font-medium">{promotion.name}</span>
                    </div>
                )}

                {/* Overlay with savings badge */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4">
                    <div className="text-white">
                        <p className="text-sm font-bold">Save ${promotion.savings_amount.toFixed(0)}</p>
                        <p className="text-xs opacity-90">Click to view details</p>
                    </div>
                </div> */}

                {/* Savings badge */}
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/90 text-white px-2.5 py-1 text-xs font-bold shadow-sm">
                        -{promotion.savings_percentage}%
                    </span>
                </div>
            </div>

            <PromotionDetailModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                promotion={promotion}
            />
        </>
    );
}