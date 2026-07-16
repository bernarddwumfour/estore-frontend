'use client';

import { useTheme } from 'next-themes';

/**
 * Recharts elements take literal color strings, not Tailwind `dark:` classes,
 * so chart code needs to know the resolved theme. Previously each analytics
 * page reinvented this via `useState` + a `MutationObserver` watching
 * `document.documentElement.classList` — `next-themes`'s `useTheme()` (already
 * used correctly in dashboard/layout.tsx) gives the same answer for free.
 */
export function useChartColors() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return {
        isDark,
        grid: isDark ? '#374151' : '#e5e7eb',
        text: isDark ? '#9ca3af' : '#6b7280',
    };
}
