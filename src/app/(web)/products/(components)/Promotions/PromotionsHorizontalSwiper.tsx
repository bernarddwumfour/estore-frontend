"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { PromotionType } from "@/types/promotionTypes";
import { useState, JSX } from "react";
import PromotionCard from "./PromotionCard";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import { useDeviceContext } from "@/lib/providers/use-device-context";

interface PromotionsHorizontalSwiperProps {
    promotions: PromotionType[];
    slidesPerView?: number;
    spaceBetween?: number;
    autoplayDelay?: number;
}

export default function PromotionsHorizontalSwiper({
    promotions,
    slidesPerView = 1.5,
    spaceBetween = 24,
    autoplayDelay = 5000
}: PromotionsHorizontalSwiperProps): JSX.Element {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    const { isMobile } = useDeviceContext();

    return (
        <div className="relative">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={spaceBetween}
                slidesPerView={isMobile ? 1 : slidesPerView}
                loop={promotions.length > slidesPerView}
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

        </div>
    );
}
