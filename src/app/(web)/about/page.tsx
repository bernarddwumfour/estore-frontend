import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, RotateCcw, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-950 selection:text-white">

      {/* 1. HERO SECTION */}
      <section className="py-24 lg:py-24 pb-12 bg-[#f8f9fa] border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <div className="space-y-4">
            <span className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs block">
              About Our Store
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Premium Apple Gear.{" "}
              <span className="text-slate-950 relative inline-block">
                Unbeatable Prices.
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
              </span>
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium pt-2">
            Welcome to iPlug, your ultimate online marketplace for authenticated, brand-new and pristine mint-condition Apple devices. We skip the traditional retail markups to bring you the best deals on the hardware you love.
          </p>
        </div>
      </section>

      {/* 2. E-COMMERCE VALUE PROPOSITIONS (Bento Style Layout) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-3">
              Why Shop With Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              The Smarter Way to Buy Tech
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8  mx-auto">
            {/* Value Item 1 */}
            <div className="bg-[#f8f9fa] rounded-[2rem] border border-slate-100 p-8 flex flex-col justify-between transition-all duration-300 hover:bg-[#f1f3f5]">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-xs mb-6 text-slate-950">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-950 tracking-tight mb-3">Strict Multi-Point Grading</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  No generic descriptions or guessing games here. Every serial number is logged, and every device undergoes rigorous diagnostic and screen-quality testing before listing.
                </p>
              </div>
            </div>

            {/* Value Item 2 */}
            <div className="bg-[#f8f9fa] rounded-[2rem] border border-slate-100 p-8 flex flex-col justify-between transition-all duration-300 hover:bg-[#f1f3f5]">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-xs mb-6 text-slate-950">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-950 tracking-tight mb-3">Insured Express Shipping</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  We package with care and ship fast. Every order is fully tracked and insured from our warehouse facility straight to your doorstep, requiring secure signature checkout.
                </p>
              </div>
            </div>

            {/* Value Item 3 */}
            <div className="bg-[#f8f9fa] rounded-[2rem] border border-slate-100 p-8 flex flex-col justify-between transition-all duration-300 hover:bg-[#f1f3f5]">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-xs mb-6 text-slate-950">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-950 tracking-tight mb-3">Hassle-Free Returns</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Buy with total piece of mind. All orders include store-backed hardware warranties alongside an easy return policy if your device configuration doesn't perfectly match your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STORE ORIGIN STORY SECTION */}
      <section className="py-24 bg-[#f8f9fa] border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center  mx-auto">

            {/* Left Frame: Typography details */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block">
                Direct to Consumer
              </span>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">Our Inventory Standards</h2>
              <div className="space-y-4 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                <p>
                  Founded in 2020, iPlug started because we were tired of the sketchy online marketplaces, inaccurate item descriptions, and overpriced retail outlets dominating the digital space.
                </p>
                <p>
                  We built a direct sourcing catalog system to offer tech-savvy buyers an institutional alternative. By verifying open-box inventory, factory clearance lots, and premium trade-ins directly, we maintain a rolling stock of pure mint-condition gear.
                </p>
                <p>
                  Today, we process thousands of monthly order shipments—connecting creators, developers, and everyday users to premium MacBooks, iPads, iPhones, and authentic power accessories at a fraction of standard cost.
                </p>
              </div>
            </div>

            {/* Right Frame: Image Canvas styled with premium border contours */}
            <div className="lg:col-span-5 relative w-full aspect-square bg-white rounded-[2.5rem] p-6 flex items-center justify-center border border-slate-200/60 shadow-xs overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                alt="iPlug e-commerce dynamic tracking team sorting stock logs"
                fill
                className="object-cover rounded-[2rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLOSING / CALL TO ACTION SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block">
              Instant Order Dispatch
            </span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight sm:text-4xl">
              Ready to Upgrade Your Mobile Workspace?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
              Browse live inventory levels across our entire catalog. Secured data gateways, flexible payment financing checkouts, and premium tracking updates come standard.
            </p>
          </div>

          <div className="pt-2">
            <Button size="lg" className="px-8 shadow-sm group" asChild>
              <Link href="/products" className="inline-flex items-center gap-2">
                Browse Live Inventory
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}