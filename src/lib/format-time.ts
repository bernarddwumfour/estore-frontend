/** Relative "2h ago"-style timestamp used across social surfaces. */
export function timeAgo(iso: string | null | undefined): string {
    if (!iso) return '';
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString();
}

/** Clock time for message bubbles, e.g. "14:03". */
export function clockTime(iso: string | null | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Compact counts: 1200 -> "1.2k". */
export const formatNumber = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
