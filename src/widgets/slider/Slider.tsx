'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

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

export default function TestimonialsSlider({ reviews = [] }: { reviews?: TestimonialReview[] }) {
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
                {reviews.map((review) => {
                    const name = review.user?.name || 'Verified customer';
                    const initials = review.user?.initials || name.slice(0, 1);
                    const rating = Math.max(0, Math.min(5, review.rating));

                    return (
                    <SwiperSlide key={review.id} className="h-auto flex">
                        <div className="group bg-[#f8f9fa] rounded-[2rem] p-6 flex flex-col justify-between border border-slate-100/60 transition-all duration-300 hover:bg-[#f1f3f5] w-full">

                            {/* Star Rating Section */}
                            <div>
                                <div className="flex items-center mb-5 gap-1">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${i < Math.round(rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-800 ml-1">{rating.toFixed(1)}</span>
                                </div>

                                {/* Testimonial Body Text */}
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium tracking-tight mb-8">
                                    "{review.comment}"
                                </p>
                            </div>

                            {/* User Profiler Block */}
                            <div className="flex items-center gap-4 border-t border-slate-200/50 pt-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                                    {initials}
                                </div>
                                <div>
                                    <h5 className="text-slate-950 font-extrabold text-xs tracking-tight">
                                        {name}
                                    </h5>
                                    <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                                        {review.title || 'Verified review'}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
