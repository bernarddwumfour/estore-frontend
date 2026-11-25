import Image from "next/image";
import type { PageHeaderProps } from "../../contract";

export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#ece7e0] bg-[#e7e1db] px-5 py-16 text-center text-[#24211f] sm:py-20">
      <Image src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=85" alt="" fill sizes="100vw" className="object-cover object-center" />
      <div aria-hidden="true" className="absolute inset-0 bg-[#fffdf9]/85" />
      <div className="relative mx-auto max-w-[1440px]">
        {subtitle && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#92704a]">{subtitle}</p>}
        <h1 className="mx-auto mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5f5953]">{description}</p>}
      </div>
    </section>
  );
}
