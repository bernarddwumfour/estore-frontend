// Furniture testimonials — an auto-playing Swiper carousel (like the default
// store's slider) using the furniture testimonial card design. Flat cards,
// no shadow, gold star ratings and a green avatar frame.
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

const items = [
  {
    name: "Leslie Alexander",
    role: "Architecture",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Jenny Wilson",
    role: "Interior Designer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Guy Hawkins",
    role: "Home Owner",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Cameron Williamson",
    role: "Decor Stylist",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
];

export default function TestimonialsCarousel() {
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
          bulletActiveClass: "!bg-[#3f4d2c]",
        }}
        breakpoints={{ 768: { slidesPerView: 2 } }}
        className="!pb-12"
      >
        {items.map((t) => (
          <SwiperSlide key={t.name}>
            <div className="rounded-3xl bg-[#f1eee7] p-6">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0 rounded-3xl rounded-bl-[3rem] bg-[#3f4d2c] p-2">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#2b2b22]">{t.name}</h3>
                  <p className="text-xs text-[#6b6b5a]">{t.role}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-[#f5b21a] text-[#f5b21a]" />
                    ))}
                    <span className="ml-1 text-sm font-bold">5.0</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e6e1d6]">
                  <Quote className="h-6 w-6 fill-[#c9c3b4] text-[#c9c3b4]" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-[#6b6b5a]">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa.
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
