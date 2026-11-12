import Link from "next/link";
import { CircleDot, type LucideIcon } from "lucide-react";
import styles from "../tyrepapa.module.css";

export default function EmptyState({
  title,
  description,
  icon: Icon = CircleDot,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: { href: string; label: string };
  compact?: boolean;
}) {
  return <div className={`${styles.emptyState} ${compact ? styles.emptyStateCompact : ""}`}>
    <span className={styles.emptyStateIcon}><Icon aria-hidden="true" size={27} strokeWidth={1.5} /></span>
    <h3 className={styles.emptyStateTitle}>{title}</h3>
    <p className={styles.emptyStateDescription}>{description}</p>
    {action && <Link href={action.href} className={styles.emptyStateAction}>{action.label} <span aria-hidden="true">↗</span></Link>}
  </div>;
}
