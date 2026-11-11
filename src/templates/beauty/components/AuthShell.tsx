import type { ReactNode } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";

export default function AuthShell({ children }: { children: ReactNode }) {
  return <div data-storefront-theme="beauty-surface" className="grid min-h-screen bg-[#faf9f6] text-[#252520] lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-[#1a1b19] lg:block">
      <Image src="/beauty/editorial.webp" alt="" fill sizes="50vw" className="object-cover opacity-65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b19]/80 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
        <BrandLogo />
        <div><span className="text-[10px] tracking-[.2em] text-[#d7b484]">READY FOR WHAT&apos;S NEXT</span><p className="mt-4 max-w-sm font-serif text-4xl leading-tight">Your road starts here.</p></div>
      </div>
    </div>
    <div className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-md"><div className="mb-10 flex justify-center lg:hidden"><BrandLogo tone="ink" compact /></div><div className="border border-[#e7e1d9] bg-white p-6 sm:p-9">{children}</div></div></div>
  </div>;
}
