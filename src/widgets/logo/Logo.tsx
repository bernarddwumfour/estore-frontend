import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import BrandLogo from "@/templates/tyrepapa/components/BrandLogo";

export default function Logo({
  light = false,
  compact = false,
  sidebar = false,
  href = "/",
  onClick,
}: {
  light?: boolean;
  compact?: boolean;
  sidebar?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  if (process.env.NEXT_PUBLIC_STORE === "tyrepapa") {
    return <BrandLogo href={href} onClick={onClick} tone={light ? "gold" : "ink"} compact={compact} sidebar={sidebar} />;
  }
  const furniture = process.env.NEXT_PUBLIC_STORE === "furniture";
  const name = furniture ? "oak&loom" : "iPlug";
  const src = furniture ? "/brand/oak-and-loom-logo.png" : "/brand/iplug-logo.png";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${name} home`}
      className={`inline-flex shrink-0 items-center rounded-lg ${light ? "bg-[#f6f3ec] px-3 py-1" : "dark:bg-white"}`}
    >
      <Image
        src={src}
        alt={name}
        width={2172}
        height={724}
        className={compact ? "h-auto w-14" : furniture ? "h-auto w-36 sm:w-40" : "h-auto w-24 sm:w-28"}
        priority
      />
    </Link>
  );
}
