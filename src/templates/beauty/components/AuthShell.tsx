import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function BeautyAuthShell({ children }: { children: ReactNode }) {
  return <main data-storefront-theme="beauty-surface" className="grid min-h-screen bg-[#fffdf9] text-[#39271f] lg:grid-cols-2">
    <section className="relative hidden min-h-screen overflow-hidden bg-[#38271f] lg:block">
      <Image src="/beauty/interior.webp" alt="A calm spa treatment room" fill sizes="50vw" className="object-cover opacity-75" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-[#241811]/80 via-transparent to-[#241811]/15" />
      <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
        <Link href="/" className="inline-flex rounded-sm bg-[#fff9ef] px-2 py-1" aria-label="Olive & Aura home">
          <Image src="/beauty/oliveandaura-horizontal.png" alt="Olive & Aura" width={2048} height={960} className="h-auto w-[190px]" />
        </Link>
        <p className="mt-8 max-w-lg font-serif text-4xl leading-tight">A little care, all for you.</p>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/75">Keep your favourite rituals close and find the products that make your everyday feel softer.</p>
      </div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex lg:hidden" aria-label="Olive & Aura home">
          <Image src="/beauty/oliveandaura-horizontal.png" alt="Olive & Aura" width={2048} height={960} className="h-auto w-[160px]" />
        </Link>
        {children}
      </div>
    </section>
  </main>;
}
