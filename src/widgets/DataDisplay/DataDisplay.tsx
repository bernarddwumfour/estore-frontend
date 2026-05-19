'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface DataDisplayProps {
    data: Record<string, any>;
    excludeKeys?: string[]; // New: Filter items out
    className?: string;
}

export function DataDisplay({ data, excludeKeys = [], className }: DataDisplayProps) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No Metadata Available</span>
            </div>
        );
    }

    // Filter entries based on the excludeKeys prop
    const filteredEntries = Object.entries(data).filter(
        ([key]) => !excludeKeys.includes(key)
    );

    return (
        <div className={cn("space-y-1", className)}>
            {filteredEntries.map(([key, value]) => (
                <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-900 last:border-none group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
                            {key.replace(/([A-Z]|_)/g, ' $1')}
                        </span>
                    </div>

                    <div className="mt-1 sm:mt-0 text-right">
                        {typeof value === 'object' && value !== null ? (
                            <pre className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-100 dark:border-zinc-800 text-left sm:text-right overflow-x-auto max-w-[250px] custom-scrollbar">
                                {JSON.stringify(value, null, 1)}
                            </pre>
                        ) : (
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                {String(value ?? '-')}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}