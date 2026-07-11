import type { PageHeaderProps } from "../../contract";

/**
 * Furniture page header band — a full-width cream section with a gold-dash
 * eyebrow, bold heading and optional description. Sits at the top of every page
 * so headers stay consistent across the furniture store.
 */
export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <section className="bg-[#f6f3ec] text-[#2b2b22]">
      <div className="container mx-auto px-4 py-16 text-center lg:px-8">
        {subtitle && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
            <span className="h-px w-6 bg-[#f5b21a]" />
            {subtitle}
          </span>
        )}
        <h1 className="mt-2 text-3xl font-black md:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#6b6b5a] sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
