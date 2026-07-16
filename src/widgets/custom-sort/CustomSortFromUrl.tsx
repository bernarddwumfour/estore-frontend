// app/components/ui/CustomSortFromUrl.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CustomDialog } from '../custom-dialog/CustomDialog';

export interface SortOption {
    value: string;
    label: string;
}

export interface SortConfig {
    options: SortOption[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    urlParamPrefix?: string; // Prefix for URL params to avoid conflicts
}

interface CustomSortFromUrlProps {
    config: SortConfig;
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    className?: string;
}

// Internal component that uses useSearchParams
function CustomSortFromUrlContent({
    config,
    onSortChange,
    className,
}: CustomSortFromUrlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getSortFromUrl = () => {
        const sortByParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_by`
            : 'sort_by';
        const sortOrderParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_order`
            : 'sort_order';

        const sortBy = searchParams.get(sortByParam) || config.defaultSortBy || config.options[0]?.value || '';
        const sortOrder = (searchParams.get(sortOrderParam) as 'asc' | 'desc') || config.defaultSortOrder || 'desc';

        return { sortBy, sortOrder };
    };

    const [tempSortBy, setTempSortBy] = useState(() => getSortFromUrl().sortBy);
    const [tempSortOrder, setTempSortOrder] = useState<'asc' | 'desc'>(() => getSortFromUrl().sortOrder);
    const [hasChanges, setHasChanges] = useState(false);
    const [appliedSortBy, setAppliedSortBy] = useState(() => getSortFromUrl().sortBy);
    const [appliedSortOrder, setAppliedSortOrder] = useState(() => getSortFromUrl().sortOrder);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const { sortBy, sortOrder } = getSortFromUrl();
        setTempSortBy(sortBy);
        setTempSortOrder(sortOrder);
        setAppliedSortBy(sortBy);
        setAppliedSortOrder(sortOrder);
        setHasChanges(false);
    }, [searchParams, config.defaultSortBy, config.defaultSortOrder, config.urlParamPrefix]);

    useEffect(() => {
        setHasChanges(tempSortBy !== appliedSortBy || tempSortOrder !== appliedSortOrder);
    }, [tempSortBy, tempSortOrder, appliedSortBy, appliedSortOrder]);

    const updateUrl = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        const params = new URLSearchParams(searchParams);

        const sortByParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_by`
            : 'sort_by';
        const sortOrderParam = config.urlParamPrefix
            ? `${config.urlParamPrefix}_sort_order`
            : 'sort_order';

        params.set(sortByParam, sortBy);
        params.set(sortOrderParam, sortOrder);
        params.set('page', '1');

        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
    };

    const handleSortByChange = (value: string) => {
        setTempSortBy(value);
    };

    const handleSortOrderToggle = () => {
        setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleApplySort = () => {
        updateUrl(tempSortBy, tempSortOrder);
        setAppliedSortBy(tempSortBy);
        setAppliedSortOrder(tempSortOrder);
        setHasChanges(false);

        if (onSortChange) {
            onSortChange(tempSortBy, tempSortOrder);
        }
    };

    const handleReset = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';

        setTempSortBy(defaultSortBy);
        setTempSortOrder(defaultSortOrder);
        updateUrl(defaultSortBy, defaultSortOrder);
        setAppliedSortBy(defaultSortBy);
        setAppliedSortOrder(defaultSortOrder);
        setHasChanges(false);

        if (onSortChange) {
            onSortChange(defaultSortBy, defaultSortOrder);
        }
    };

    const hasActiveSort = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';
        return appliedSortBy !== defaultSortBy || appliedSortOrder !== defaultSortOrder;
    };

    const desktopRow = (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <Select value={tempSortBy} onValueChange={handleSortByChange}>
                    <SelectTrigger className="w-36 h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        {config.options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSortOrderToggle}
                    className="h-9 w-9 border-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/50 dark:bg-gray-800/70 dark:text-gray-200"
                >
                    {tempSortOrder === 'asc' ? '↑' : '↓'}
                </Button>

                <Button
                    variant={hasChanges ? "default" : "secondary"}
                    size="sm"
                    onClick={handleApplySort}
                    className={cn(
                        "gap-1 h-9",
                        hasChanges
                            ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700"
                            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/50"
                    )}
                    disabled={!hasChanges}
                >
                    <ArrowUpDown size={14} />
                    Apply Sort
                </Button>

                {hasActiveSort() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Reset
                    </Button>
                )}
            </div>

            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved sort changes. Click "Apply Sort" to update.
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="hidden lg:block">{desktopRow}</div>

            <div className="lg:hidden relative inline-block">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileOpen(true)}
                    className="gap-2 h-9 border-gray-300 dark:border-gray-700 text-gray-700"
                >
                    <ArrowUpDown size={14} />
                    Sort
                </Button>
                {hasActiveSort() && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white pointer-events-none" />
                )}
            </div>

            <CustomDialog
                title="Sort"
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                contentWidth="max-w-[400px]"
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sort by</label>
                        <Select value={tempSortBy} onValueChange={handleSortByChange}>
                            <SelectTrigger className="w-full h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                {config.options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Order</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={tempSortOrder === 'asc' ? 'default' : 'outline'}
                                className={cn(
                                    "h-9",
                                    tempSortOrder === 'asc' && "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100"
                                )}
                                onClick={() => setTempSortOrder('asc')}
                            >
                                ↑ Ascending
                            </Button>
                            <Button
                                type="button"
                                variant={tempSortOrder === 'desc' ? 'default' : 'outline'}
                                className={cn(
                                    "h-9",
                                    tempSortOrder === 'desc' && "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100"
                                )}
                                onClick={() => setTempSortOrder('desc')}
                            >
                                ↓ Descending
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-[#111114]">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                        disabled={!hasActiveSort()}
                    >
                        Reset
                    </Button>
                    <Button
                        className="flex-1 gap-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700"
                        onClick={() => {
                            handleApplySort();
                            setMobileOpen(false);
                        }}
                    >
                        <ArrowUpDown size={14} />
                        Apply Sort
                    </Button>
                </div>
            </CustomDialog>
        </>
    );
}

// Main exported component with Suspense boundary
export function CustomSortFromUrl(props: CustomSortFromUrlProps) {
    return (
        <Suspense fallback={<div className="h-9 w-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />}>
            <CustomSortFromUrlContent {...props} />
        </Suspense>
    );
}