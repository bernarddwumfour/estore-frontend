import Link from "next/link";
import type { MouseEventHandler } from "react";
import styles from "../tyrepapa.module.css";

type BrandLogoProps = {
  href?: string;
  tone?: "gold" | "ink";
  compact?: boolean;
  sidebar?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function BrandLogo({ href = "/", tone = "gold", compact = false, sidebar = false, className = "", onClick }: BrandLogoProps) {
  const classes = [styles.logo, tone === "ink" && styles.logoInk, compact && styles.logoCompact, sidebar && styles.logoSidebar, className].filter(Boolean).join(" ");

  return <Link href={href} onClick={onClick} aria-label="TyrePapa home" className={classes}>
    <svg className={styles.logoWheel} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="5 4" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M32 18v11M45.3 27.7l-10.5 3.4M40.2 43.3l-6.5-8.9M23.8 43.3l6.5-8.9M18.7 27.7l10.5 3.4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
    <span className={styles.logoWordmark}>TyrePapa</span>
  </Link>;
}
