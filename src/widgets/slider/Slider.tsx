'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
    {
      name: 'Jane D',
      role: 'CEO',
      text: 'Pagedone has made it possible for me to stay on top of my portfolio and make informed decisions quickly and easily.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Harsh P.',
      role: 'Product Designer',
      text: 'Thanks to pagedone, I feel more informed and confident about my investment decisions than ever before.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Alex K.',
      role: 'Design Lead',
      text: 'The customer service team at pagedone went above and beyond to help me resolve a billing issue.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Sarah M.',
      role: 'Marketing Director',
      text: 'An outstanding platform that transformed how we manage client feedback and showcase success stories.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    },
    {
        name: 'Jane D',
        role: 'CEO',
        text: 'Pagedone has made it possible for me to stay on top of my portfolio and make informed decisions quickly and easily.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Harsh P.',
        role: 'Product Designer',
        text: 'Thanks to pagedone, I feel more informed and confident about my investment decisions than ever before.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Alex K.',
        role: 'Design Lead',
        text: 'The customer service team at pagedone went above and beyond to help me resolve a billing issue.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Sarah M.',
        role: 'Marketing Director',
        text: 'An outstanding platform that transformed how we manage client feedback and showcase success stories.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      },
  ];

export default function TestimonialsSlider() {
    return (
        <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={32}
                    slidesPerView={1}
                    centeredSlides={true}
                    loop={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        bulletClass: 'swiper-pagination-bullet !w-4 !h-1 !bg-gray-300 !opacity-100 !mx-1.5 !rounded-md',
                        bulletActiveClass: '!bg-indigo-600 !w-8',
                    }}
                    breakpoints={{
                        380: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                    className="mySwiper pb-16 py-12 flex justify-center"
                >
                    {testimonials.map((testimonial, index) => (
                        <SwiperSlide key={index}>
                            <div className="group bg-white rounded-xl p-6 my-8 transition-all duration-500 hover:border-indigo-600 hover:shadow-sm [&.swiper-slide-active]:border-indigo-600">
                                <div className="flex items-center mb-7 gap-2 text-amber-500">
                                    <svg className="w-5 h-5" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="text-base font-semibold text-indigo-600">4.9</span>
                                </div>

                                <p className="text-base text-gray-600 leading-6 pb-8 transition-all duration-500 group-hover:text-gray-800 [&.swiper-slide-active_>_&]:text-gray-800">
                                    {testimonial.text}
                                </p>

                                <div className="flex items-center gap-5 border-t border-solid border-gray-200 pt-5">
                                    <Image
                                        className="rounded-full h-10 w-10 object-cover"
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        width={40}
                                        height={40}
                                    />
                                    <div>
                                        <h5 className="text-gray-900 font-medium mb-1">{testimonial.name}</h5>
                                        <span className="text-sm text-gray-500">{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
       
    );
}