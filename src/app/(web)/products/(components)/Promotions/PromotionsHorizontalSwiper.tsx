"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { PromotionType } from "@/types/promotionTypes";
import { useState, useRef, JSX } from "react";
import PromotionCard from "./PromotionCard";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useDeviceContext } from "@/lib/providers/use-device-context";

interface PromotionsHorizontalSwiperProps {
    promotions: PromotionType[];
    slidesPerView?: number;
    spaceBetween?: number;
    autoplayDelay?: number;
}

interface BreakpointConfig {
    slidesPerView: number;
    spaceBetween: number;
}

interface Breakpoints {
    [width: number]: BreakpointConfig;
}

export default function PromotionsHorizontalSwiper({
    promotions,
    slidesPerView = 1.5,
    spaceBetween = 24,
    autoplayDelay = 5000
}: PromotionsHorizontalSwiperProps): JSX.Element {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    const { isMobile, isTablet, isDesktop, deviceType } = useDeviceContext();

    const shouldShowNavigation = promotions.length > slidesPerView;

    return (
        <div className="relative group">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={spaceBetween}
                slidesPerView={isMobile ? 1 : slidesPerView}
                loop={promotions.length > slidesPerView}
                onSwiper={(swiper: SwiperType) => setSwiperInstance(swiper)}
                autoplay={{
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                onMouseEnter={() => swiperInstance?.autoplay?.stop()}
                onMouseLeave={() => swiperInstance?.autoplay?.start()}
                className="w-full pb-12"
            >
                {promotions.map((promotion: PromotionType) => (
                    <SwiperSlide key={promotion.id}>
                        <PromotionCard promotion={promotion} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {shouldShowNavigation && (
                <>
                    <button
                        className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/3 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/3 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}