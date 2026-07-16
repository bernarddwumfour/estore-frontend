'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ICON_COLOR_CLASSES = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    zinc: 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
} as const;

export type AnalyticsStatTileColor = keyof typeof ICON_COLOR_CLASSES;

interface AnalyticsStatTileProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: AnalyticsStatTileColor;
    /** Optional content below the value — a sub-text line, badges, a trend indicator, etc. */
    footer?: React.ReactNode;
    className?: string;
}

/**
 * Shared KPI-card tile for dashboard analytics pages. Generalizes the
 * `StatTile` pattern already used for social widgets (src/widgets/social/social-shared.tsx)
 * to the icon-in-colored-box + label + value + optional footer shape that was
 * previously hand-rolled ~20 times across the three analytics pages.
 */
export function AnalyticsStatTile({ label, value, icon, color = 'zinc', footer, className }: AnalyticsStatTileProps) {
    return (
        <Card className={cn('bg-white dark:bg-black border-gray-200 dark:border-gray-800', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                        {footer}
                    </div>
                    <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center shrink-0', ICON_COLOR_CLASSES[color])}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
