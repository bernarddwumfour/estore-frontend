import type { PageHeaderProps } from "../../contract";

/**
 * Default page header band — a full-width section with a slate eyebrow, bold
 * heading and optional description. Sits at the top of every page so headers
 * stay consistent across the default store.
 */
export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  const isBeauty = process.env.NEXT_PUBLIC_STORE === "beauty";

  return (
    <section className={isBeauty ? "border-b border-[#eee5dd] bg-[#f8f3ed] text-[#30231d]" : "border-b border-slate-100 bg-[#f8f9fa]"}>
      <div className={`container mx-auto px-4 py-16 lg:px-8 ${isBeauty ? "text-center lg:py-20" : "space-y-4 lg:pt-24"}`}>
        {subtitle && (
          <span className={isBeauty ? "block text-[9px] font-medium uppercase tracking-[0.23em] text-[#9b5c40]" : "block text-xs font-bold uppercase tracking-[0.3em] text-slate-400"}>
            {subtitle}
          </span>
        )}
        <h1 className={isBeauty ? "mx-auto mt-3 max-w-4xl font-serif text-4xl font-normal leading-tight tracking-[-0.04em] text-[#30231d] sm:text-5xl" : "text-3xl font-black tracking-tight text-slate-900 md:text-5xl"}>
          {title}
        </h1>
        {description && (
          <p className={isBeauty ? "mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#75665b] sm:text-base" : "max-w-2xl text-sm font-medium leading-relaxed text-slate-500 sm:text-base"}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
