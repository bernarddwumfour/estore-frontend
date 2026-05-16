import { Button } from "@/components/ui/button"
import TestimonialsSlider from "@/widgets/slider/Slider";
import { ArrowUpRight, Bookmark, BookMarked, Minus, PlugZap, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductsGrid from "./products/ProductsGrid";
import Categories from "@/widgets/categories/Categories";
import { Suspense } from "react";
import ProductsGridSkeleton from "./products/(components)/ProductsGridSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ProductVerticalCarousel from "./products/(components)/ProductVerticalCarousel";

export default function Home() {
  return (
    <>
      <div ></div>
      <Hero />
      <ProductCategories />
      <Products1 />
      <About />
      <Products1 />
      <Testimonials />
    </>
  );
}

function Hero() {
  return (
    <section className="relative bg-white pt-24 pb-16 lg:pt-24 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 ">

        {/* Title Header */}
        <div className="mx-auto text-center mb-12 mt-8">


          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 tracking-[4]">
            We Sell, Buy And Fix <span className="inline-flex items-center gap-2 bg-[#f3f4f6] border border-slate-200 rounded-full px-4 py-1 my-2 text-base sm:text-lg lg:text-xl font-medium text-slate-800">
              <PlugZap className="h-4 w-4 lg:h-5 lg:w-5 text-slate-900 fill-slate-900" />
              Premium
            </span> Apple Devices.
            <br />

          </h1>


          <p className="max-w-3xl mt-6 text-sm sm:text-base text-slate-500  mx-auto leading-relaxed font-medium">
            Shop 100% authentic, factory-sealed, and pristine open-box Apple gear. Uncompromising performance, rigorous quality checks, and full warranty coverage on every device.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mx-auto items-stretch">

          {/* LEFT: Main Hero — iMac */}
          <div className="lg:col-span-9 relative bg-[#f0ede8] rounded-[2.5rem] overflow-hidden flex items-center justify-center min-h-[400px] sm:min-h-[500px] border border-slate-100">

            {/* TOP LEFT: "Check Reviews" Badge */}
            <div className="absolute top-0 left-0 bg-white pt-4 pl-4 pr-6 pb-4 rounded-br-[2.5rem] z-10 flex items-center gap-3">
              <div className="absolute top-0 right-[-2.5rem] w-10 h-10 bg-white pointer-events-none">
                <div className="w-full h-full bg-[#f0ede8] rounded-tl-[2rem]" />
              </div>
              <div className="absolute bottom-[-2.5rem] left-0 w-10 h-10 bg-white pointer-events-none">
                <div className="w-full h-full bg-[#f0ede8] rounded-tl-[2.5rem]" />
              </div>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white overflow-hidden" />
                <div className="w-7 h-7 rounded-full bg-slate-400 border-2 border-white overflow-hidden" />
                <div className="w-7 h-7 rounded-full bg-slate-500 border-2 border-white overflow-hidden" />
              </div>
              <div className="text-[11px] leading-tight font-medium text-slate-500">
                <span className="block font-bold text-slate-900">Check</span> reviews
              </div>
            </div>

            {/* HERO: Sofa Image */}
            <Image
              fill
              src="https://images.unsplash.com/photo-1609334761848-77b4d1994040?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              className="object-cover"
              alt="Blue fabric sofa"
              priority
            />

            {/* BOTTOM RIGHT: Shop Now */}
            <div className="absolute bottom-0 right-0 bg-white pt-4 pl-6 pr-4 pb-4 rounded-tl-[2.5rem] z-10">
              <div className="absolute top-[-2.5rem] right-0 w-10 h-10 bg-white pointer-events-none">
                <div className="w-full h-full bg-[#f0ede8] rounded-br-[2.5rem]" />
              </div>
              <div className="absolute bottom-0 left-[-2.5rem] w-10 h-10 bg-white pointer-events-none">
                <div className="w-full h-full bg-[#f0ede8] rounded-br-[2.5rem]" />
              </div>
              <Link href="/products" className="inline-flex items-center gap-3 bg-slate-950 text-white rounded-full pl-5 pr-2 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors group">
                Shop Now
                <div className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            </div>
          </div>

          <ProductVerticalCarousel />
        </div>


      </div>
    </section>
  )
}




function About() {
  return (
    <section className="bg-white py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto container px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">



          {/* LEFT PANEL: Typography & Uncontrolled shadcn Accordion */}
          <div className="lg:col-span-7 flex flex-col space-y-8">

            {/* Header Content Block matching your saved layout */}
            <div className="max-w-xl space-y-4">
              <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                About iPlug
              </h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Crafting your path to{" "}
                <span className="text-slate-950 relative inline-block">
                  excellence.
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
                </span>
              </h3>
            </div>

            {/* shadcn Accordion UI Wrapper */}
            <Accordion
              type="single"
              collapsible
              defaultValue="item-1"
              className="w-full border-t border-slate-100"
            >

              {/* Pillar Item 1 */}
              <AccordionItem value="item-1" className="border-b border-slate-100 py-2 group">
                <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left cursor-pointer group hover:no-underline">
                  <span className="text-sm font-bold tracking-tight text-slate-600 group-data-[state=open]:text-slate-950 group-hover:text-slate-950 transition-colors">
                    Unrivaled Quality & Authenticity
                  </span>

                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl font-medium pb-6">
                  Every device is meticulously audited and tested. We carry pristine 100% genuine factory sealed and mint-condition open box Apple hardware with zero compromise on retail expectations.
                </AccordionContent>
              </AccordionItem>

              {/* Pillar Item 2 */}
              <AccordionItem value="item-2" className="border-b border-slate-100 py-2 group">
                <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left cursor-pointer group hover:no-underline">
                  <span className="text-sm font-bold tracking-tight text-slate-600 group-data-[state=open]:text-slate-950 group-hover:text-slate-950 transition-colors">
                    Full Warranty Cover & Repairs
                  </span>

                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl font-medium pb-6">
                  Certified technician diagnostic servicing coupled with dynamic warranty matrices backed straight by our in-house hardware specialists.
                </AccordionContent>
              </AccordionItem>

              {/* Pillar Item 3 */}
              <AccordionItem value="item-3" className="border-b border-slate-100 py-2 group">
                <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left cursor-pointer group hover:no-underline">
                  <span className="text-sm font-bold tracking-tight text-slate-600 group-data-[state=open]:text-slate-950 group-hover:text-slate-950 transition-colors">
                    Unmatched Trade-in Market Value
                  </span>

                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl font-medium pb-6">
                  Get premium quotes on old hardware deployments instantly. Trade up your legacy iOS/macOS systems seamlessly for mint-condition replacements.
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            {/* Custom Pill Action Trigger */}
            <div className="pt-2">
              <Button size="lg" className="px-8 shadow-sm">
                Get Started
              </Button>
            </div>

          </div>

          {/* RIGHT PANEL: Media Frame */}
          <div className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-square bg-[#f8f9fa] rounded-[2.5rem] p-8 flex items-center justify-center border border-slate-100">
            <Image
              width={600}
              height={600}
              src="https://images.unsplash.com/photo-1609334761848-77b4d1994040?q=80&w=800&auto=format&fit=crop"
              className="object-contain max-h-[85%] max-w-[85%] mix-blend-multiply drop-shadow-md"
              alt="Premium Living and Tech Space"
            />
          </div>

        </div>
      </div>
    </section>
  )
}

function Products1() {
  return (

    <section className="relative py-24 bg-cover bg-center" >


      <div className="mx-auto container px-4">
        <div className="max-w-xl space-y-4">
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
            Best Sellers
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Most Loved by   {" "}
            <span className="text-slate-950 relative inline-block">
              Our Customers.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
            </span>
          </h3>
        </div>
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ProductsGrid />
        </Suspense>
      </div>
    </section>

  )
}


function ProductCategories() {
  return (
    <section className="py-24 bg-gray-100">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Content Block matching your saved layout */}
        <div className="max-w-xl space-y-4 pb-6 sm:pb-8 md:pb-10">
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
            Shop by Category
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Explore our many {" "}
            <span className="text-slate-950 relative inline-block">
              apple products.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
            </span>
          </h3>
        </div>
        <Categories />
      </div>
    </section>
  )
}


function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-4">
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
            Testimonials
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            What our happy    {" "}
            <span className="text-slate-950 relative inline-block">
              customers says!.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
            </span>
          </h3>
        </div>

        <TestimonialsSlider />
      </div>
    </section>
  )
}