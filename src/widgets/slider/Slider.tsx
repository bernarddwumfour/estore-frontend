'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Image from 'next/image';
import { Star } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
    {
        name: 'Jane D.',
        role: 'Verified Buyer',
        text: 'My MacBook arrived in absolute flawless mint condition. Looks and runs exactly like brand new out of the box from Apple!',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Harsh P.',
        role: 'Creative Director',
        text: 'Traded in my old iPad system and upgraded here effortlessly. Got an incredible deal on an M3 device with perfect setup diagnostics.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Alex K.',
        role: 'Software Engineer',
        text: 'Incredible customer support. They walked me through the battery health and warranty matrices before shipping out my factory-sealed hardware.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Sarah M.',
        role: 'Verified Buyer',
        text: 'Best place to get premium Apple tech without paying standard retail premiums. Quick shipping, full warranty protection, and impeccable quality.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Alex K.',
        role: 'Software Engineer',
        text: 'Incredible customer support. They walked me through the battery health and warranty matrices before shipping out my factory-sealed hardware.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
];

export default function TestimonialsSlider() {
    return (
        <div className="w-full py-12">
            <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                centeredSlides={false}
                loop={true}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet !w-2 !h-2 !bg-slate-200 !opacity-100 !mx-1 transition-all duration-300',
                    bulletActiveClass: '!bg-slate-950 !w-5 !rounded-full',
                }}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                className="mySwiper pb-16 px-4 mx-auto"
            >
                {testimonials.map((testimonial, index) => (
                    <SwiperSlide key={index} className="h-auto flex">
                        <div className="group bg-[#f8f9fa] rounded-[2rem] p-6 flex flex-col justify-between border border-slate-100/60 transition-all duration-300 hover:bg-[#f1f3f5] w-full">

                            {/* Star Rating Section */}
                            <div>
                                <div className="flex items-center mb-5 gap-1">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-800 ml-1">5.0</span>
                                </div>

                                {/* Testimonial Body Text */}
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium tracking-tight mb-8">
                                    "{testimonial.text}"
                                </p>
                            </div>

                            {/* User Profiler Block */}
                            <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                                <Image
                                    className="rounded-full h-9 w-9 object-cover border border-white shadow-xs"
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    width={36}
                                    height={36}
                                />
                                <div>
                                    <h5 className="text-slate-950 font-extrabold text-xs tracking-tight">
                                        {testimonial.name}
                                    </h5>
                                    <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                                        {testimonial.role}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}