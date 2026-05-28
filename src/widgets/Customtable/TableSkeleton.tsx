// app/dashboard/products/categories/TableSkeleton.tsx
import React from 'react';

export function TableSkeleton() {
    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar - 4 buttons on left, 2 on right */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {/* 4 buttons on the left */}
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                </div>
                <div className="flex gap-2">
                    {/* 2 buttons on the right */}
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                    <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800/80 rounded-md"></div>
                </div>
            </div>

            {/* Table */}
            <div className="border dark:border-gray-800 rounded-lg overflow-hidden animate-pulse">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 px-4 py-3">
                    <div className="flex gap-4">
                        {/* Checkbox column */}
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Name column */}
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Parent column */}
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Status column */}
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Visibility column */}
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Path column */}
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                        {/* Actions column */}
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                    </div>
                </div>

                {/* Table Rows */}
                <div className="">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 105].map((i) => (
                        <div key={i} className="px-4 py-3">
                            <div className="flex gap-4 items-center">
                                {/* Checkbox skeleton */}
                                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                                {/* Name skeleton */}
                                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                                {/* Parent skeleton */}
                                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                                {/* Status badge skeleton */}
                                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700/60 rounded-full"></div>
                                {/* Visibility badge skeleton */}
                                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700/60 rounded-full"></div>
                                {/* Path skeleton */}
                                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/60 rounded"></div>
                                {/* Actions dropdown skeleton */}
                                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700/60 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}