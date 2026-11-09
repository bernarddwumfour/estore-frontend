// Furniture testimonials — an auto-playing Swiper carousel (like the default
// store's slider) using the furniture testimonial card design. Flat cards,
// no shadow, gold star ratings and a green avatar frame.
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

export interface TestimonialReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user?: {
    name?: string;
    initials?: string;
  };
}

export default function TestimonialsCarousel({
  reviews,
}: {
  reviews: TestimonialReview[];
}) {
  return (
    <div className="mt-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        loop
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass:
            "swiper-pagination-bullet !h-1.5 !w-8 !rounded-full !bg-[#d6d2c6] !opacity-100 !mx-1 transition-all",
          bulletActiveClass: "!bg-[#654035]",
        }}
        breakpoints={{ 768: { slidesPerView: 2 } }}
        className="!pb-12"
      >
        {reviews.map((review) => {
          const name = review.user?.name || "Verified customer";
          const initials = review.user?.initials || name.slice(0, 1);
          const rating = Math.max(0, Math.min(5, review.rating));

          return (
            <SwiperSlide key={review.id}>
              <div className="rounded-3xl bg-[#f1eee7] p-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0 rounded-3xl rounded-bl-[3rem] bg-[#654035] p-2">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-[#e6e1d6] text-xl font-bold text-[#654035]">
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2b2b22]">{name}</h3>
                    {review.title && (
                      <p className="text-xs text-[#6b6b5a]">{review.title}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(rating)
                              ? "fill-[#f5b21a] text-[#f5b21a]"
                              : "text-[#d6d2c6]"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-bold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e6e1d6]">
                    <Quote className="h-6 w-6 fill-[#c9c3b4] text-[#c9c3b4]" />
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[#6b6b5a]">
                  {review.comment}
                </p>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
