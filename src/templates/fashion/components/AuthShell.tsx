import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" aria-label="Velora home" className={`inline-flex text-2xl font-semibold tracking-[0.18em] ${light ? "text-white" : "text-[#24211f]"}`}>VELORA<span className="text-[#c2a17a]">.</span></Link>;
}

export default function FashionAuthShell({ children }: { children: ReactNode }) {
  return <main data-storefront-theme="fashion-surface" className="grid min-h-screen bg-[#fffdf9] text-[#24211f] lg:grid-cols-2">
    <section className="relative hidden min-h-screen overflow-hidden bg-[#39332d] lg:block">
      <Image src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85" alt="" fill priority sizes="50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#211d19]/80 via-[#211d19]/20 to-[#211d19]/35" />
      <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16"><Brand light /><div className="text-white"><p className="text-[10px] uppercase tracking-[0.2em] text-[#e4c6a1]">The Velora collection</p><p className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.04em] xl:text-5xl">Style for every journey.</p><p className="mt-4 max-w-sm text-sm leading-7 text-white/80">Discover pieces for your everyday moments and special occasions.</p></div></div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><Brand /></div><div className="rounded-xl border border-[#eee9e2] bg-white p-6 shadow-sm sm:p-9">{children}</div><Link href="/" className="mt-6 inline-flex text-xs text-[#817a72] hover:text-[#ad8a60]">← Back to store</Link></div></section>
  </main>;
}
