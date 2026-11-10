import { Armchair, type LucideIcon } from "lucide-react";
import Link from "next/link";

export default function EmptyState({
  title,
  description,
  icon: Icon = Armchair,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: { href: string; label: string };
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-[#ede7dc] bg-[#faf8f4] px-6 text-center ${compact ? "min-h-[260px] py-10" : "min-h-[300px] py-14"}`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#654035] text-[#f6f3ec]">
        <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
      </span>
      <h3 className="mt-5 text-base font-bold text-[#2b2b22]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#777465]">{description}</p>
      {action && <Link href={action.href} className="mt-5 text-sm font-semibold text-[#654035] underline underline-offset-4">{action.label}</Link>}
    </div>
  );
}
