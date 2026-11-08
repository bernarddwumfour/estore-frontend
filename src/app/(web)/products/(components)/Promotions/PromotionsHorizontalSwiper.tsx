"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PromotionType } from "@/types/promotionTypes";
import { useState, JSX } from "react";
import PromotionCard from "./PromotionCard";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import { useDeviceContext } from "@/lib/providers/use-device-context";

interface PromotionsHorizontalSwiperProps {
    promotions: PromotionType[];
    theme?: "default" | "furniture";
    slidesPerView?: number;
    spaceBetween?: number;
    autoplayDelay?: number;
}

export default function PromotionsHorizontalSwiper({
    promotions,
    theme = "default",
    slidesPerView = 1.5,
    spaceBetween = 24,
    autoplayDelay = 5000
}: PromotionsHorizontalSwiperProps): JSX.Element {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    const { isMobile } = useDeviceContext();
    const slidesToShow = isMobile ? 1 : slidesPerView;
    const showControls = promotions.length > slidesToShow;
    const controlTheme = theme === "furniture"
        ? "bg-[#3f4d2c] text-white hover:bg-[#33401f] focus-visible:ring-[#f5b21a]"
        : "bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-400";

    return (
        <div className="relative">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={spaceBetween}
                slidesPerView={slidesToShow}
                loop={promotions.length > slidesToShow}
                onSwiper={(swiper: SwiperType) => setSwiperInstance(swiper)}
                autoplay={{
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                onMouseEnter={() => swiperInstance?.autoplay?.stop()}
                onMouseLeave={() => swiperInstance?.autoplay?.start()}
                className="w-full"
            >
                {promotions.map((promotion: PromotionType) => (
                    <SwiperSlide key={promotion.id}>
                        <PromotionCard promotion={promotion} />
                    </SwiperSlide>
                ))}
            </Swiper>
            {showControls && (
                <>
                    <button
                        type="button"
                        aria-label="Previous promotion"
                        onClick={() => swiperInstance?.slidePrev()}
                        className={`absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${controlTheme}`}
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next promotion"
                        onClick={() => swiperInstance?.slideNext()}
                        className={`absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${controlTheme}`}
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </>
            )}
        </div>
    );
}
