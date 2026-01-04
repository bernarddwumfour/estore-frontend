import { Button } from "@/components/ui/button"
import TestimonialsSlider from "@/widgets/slider/Slider";
import { ArrowUpRight, Bookmark, BookMarked, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductsGrid from "./products/ProductsGrid";
import Categories from "@/widgets/categories/Categories";

export default function Home() {
  return (
    <>
      <div className="py-12"></div>
      <Hero2 />
      <ProductCategories />
      <Products1 />
      <About1 />
      <Products1 />
      <Testimonials />
    </>
  );
}





function Hero1() {
  return (
    <div className="bg-white dark:bg-gray-800 flex relative z-20 items-center overflow-hidden">
      <div className="container mx-auto px-6 flex relative py-16 md:pt-36">
        <div className="sm:w-2/3 lg:w-2/5 flex flex-col relative z-20">
          <span className="w-20 h-2 bg-gray-800 dark:bg-white mb-12">
          </span>
          <h1
            className="font-bebas-neue uppercase text-6xl sm:text-8xl font-black flex flex-col leading-none dark:text-white text-gray-800">
            Be on
            <span className="text-5xl sm:text-7xl">
              Time
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-white">
            Dimension of reality that makes change possible and understandable. An indefinite and homogeneous
            environment in which natural events and human existence take place.
          </p>

          <div className="flex mt-8 gap-6">
            <Button className="p-7">
              Shop Now
            </Button>
            <Button className="p-7" variant={"outline"}>
              Get started
            </Button>
          </div>
        </div>
        <div className="hidden sm:block sm:w-1/3 lg:w-3/5 relative">
          <Image width={200} height={200} src="https://www.tailwind-kit.com/images/object/10.png" className="max-w-xs md:max-w-sm m-auto" alt="hero image" />
        </div>
      </div>
    </div>
  )
}


function Hero2() {
  return (

    <section className="relative py-64 bg-cover bg-center" >
      <div className="absolute inset-0 bg-gray-400 bg-opacity-60">
        <Image src="https://images.unsplash.com/photo-1609334761848-77b4d1994040?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Home Image" objectFit="cover" fill className="absolute w-full h-full brightness-60" />
      </div>

      <div className="relative z-[2] max-w-4xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Authentic Apple Products.  Designed for You.</h1>
        <p className="text-lg md:text-xl mb-8 bg-white/20  backdrop-blur-md p-3 my-2">iPhone, MacBook, iPad, Apple Watch, AirPods — everything Apple, all in one place.</p>
        <Button asChild className="p-7">
          <Link href="/products">
            Shop Now
          </Link>
        </Button>
      </div>
    </section>

  )
}

function About1() {
  return (
    <section className="bg-primary/5">
      <div className="mx-auto container py-32">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center justify-between md:gap-8">
          <div>
            <div className="max-w-prose md:max-w-none space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Your Trusted Apple Destination – Authentic Products, Exceptional Service
              </h2>

              <p className="mt-4 text-pretty text-gray-700 leading-8">
                Welcome to IPlug, your trusted destination for genuine Apple products. As an authorized Apple reseller, we bring the latest iPhones, MacBooks, iPads, and accessories directly to you with guaranteed authenticity and full manufacturer warranty.

                Founded by Apple enthusiasts, we're passionate about connecting people with technology that inspires. Every product is carefully selected, thoroughly tested, and shipped with care to ensure you receive Apple's signature quality.

                We believe great technology should come with great service. That's why we offer free shipping, expert support, and a hassle-free return policy—because your experience matters as much as your products.

                Join thousands of satisfied customers who choose us for their Apple needs.
              </p>
              <Button className="p-7">
                Learn More
              </Button>
            </div>
          </div>

          <div>
            <Image width={1000} height={1000} src="https://images.unsplash.com/photo-1609334761848-77b4d1994040?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="m-auto" alt="hero image" />
          </div>
        </div>
      </div>
    </section>
  )
}



function Products1() {
  return (

    <section className="relative py-24 bg-cover bg-center" >

      <div className="mx-auto container">
        <div className="py-8">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">Best Sellers</h1>
          <p className="text-gray-600">Most Loved by Our Customers , See What Everyone's Choosing.</p>
        </div>

        <ProductsGrid />
      </div>
    </section>

  )
}


function ProductCategories() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">Shop by Category</h1>
          <p className="text-gray-600">Explore our many apple products</p>
        </div>
        <Categories/>
      </div>
    </section>
  )
}


function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">TESTIMONIAL</h1>
          <p className="text-gray-600">What our happy user says!</p>
        </div>
        <TestimonialsSlider />
      </div>
    </section>
  )
}