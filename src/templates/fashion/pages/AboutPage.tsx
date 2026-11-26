import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function AboutPage() {
  return <div className="bg-[#fffdf9] text-[#24211f]"><PageHeader subtitle="Our story" title="Style for every journey." description="Discover fashion for the everyday moments and special occasions that make life yours." /><section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24"><div className="relative min-h-[380px] overflow-hidden rounded-xl bg-[#eee9e2] sm:min-h-[520px]"><Image src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="A contemporary fashion look" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ad8a60]">The Amammre Wears point of view</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">A little more you.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-[#77716b]">We believe getting dressed should feel personal. Amammre Wears brings together considered pieces for the moments you plan and the ones you don’t.</p><Link href="/products" className="mt-7 inline-flex items-center gap-3 rounded-md bg-[#ad8a60] px-5 py-4 text-xs font-semibold text-white hover:bg-[#92704a]">Explore the collection <ArrowRight className="h-4 w-4" /></Link></div></section></div>;
}
