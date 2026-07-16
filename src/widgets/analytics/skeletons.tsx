'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

/** Loading skeletons shared across the dashboard analytics pages — previously
 * duplicated byte-for-byte in each page. */

export const KPICardSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
        </CardContent>
    </Card>
);

export const ChartSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
            <div className="h-[350px] w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        </CardContent>
    </Card>
);

export const TableSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                ))}
            </div>
        </CardContent>
    </Card>
);
