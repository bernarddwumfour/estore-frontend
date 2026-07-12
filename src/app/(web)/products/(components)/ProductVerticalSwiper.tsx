"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ProductType } from "@/types/productTypes";

// Import Swiper styles
import "swiper/css";
import Product from "../Product";
import { useState } from "react";
import { useDeviceContext } from "@/lib/providers/use-device-context";

interface ProductVerticalSwiperProps {
    products: ProductType[];
}

export default function ProductVerticalSwiper({ products }: ProductVerticalSwiperProps) {
    const [swiperInstance, setSwiperInstance] = useState<any>(null);
    const { isMobile, isTablet, isDesktop, deviceType } = useDeviceContext();


    return (
        <Swiper
            modules={[Autoplay]}
            direction={isMobile || isTablet ? "horizontal" : "vertical"}
            spaceBetween={8}
            slidesPerView={2}
            loop={products.length > 2}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            onMouseEnter={() => swiperInstance?.autoplay?.stop()}
            onMouseLeave={() => swiperInstance?.autoplay?.start()}
            className="h-full w-full"
        >
            {products.map((product) => (
                <SwiperSlide key={product.id} className="flex flex-col">

                    <div className="flex-1 w-full text-left [&_ul]:hidden [&_li]:w-full">
                        <Product product={product} isMinimal />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}