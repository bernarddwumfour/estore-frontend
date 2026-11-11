import type { PageHeaderProps } from "../../contract";

export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return <header className="bg-[#1a1b19] px-[5%] py-9 text-[#faf7f1] sm:py-11">
    <div className="mx-auto max-w-[1440px]">
      {subtitle && <span className="text-[10px] uppercase tracking-[.2em] text-[#d7b484]">TYREPAPA / {subtitle}</span>}
      <h1 className="mt-3 font-serif text-[clamp(2.5rem,4.5vw,3.75rem)] font-normal leading-[1.05] tracking-[-.03em]">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c9c1b6]">{description}</p>}
    </div>
  </header>;
}
