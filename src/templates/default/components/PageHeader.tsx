import type { PageHeaderProps } from "../../contract";

/**
 * Default page header band — a full-width section with a slate eyebrow, bold
 * heading and optional description. Sits at the top of every page so headers
 * stay consistent across the default store.
 */
export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <section className="border-b border-slate-100 bg-[#f8f9fa]">
      <div className="container mx-auto space-y-4 px-4 py-16 lg:px-8 lg:pt-24">
        {subtitle && (
          <span className="block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            {subtitle}
          </span>
        )}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
