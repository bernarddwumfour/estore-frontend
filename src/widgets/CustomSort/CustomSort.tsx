// app/components/ui/CustomSort.tsx
'use client';

import React, { useState, useEffect } from 'react';
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

export interface SortOption {
    value: string;
    label: string;
}

export interface SortConfig {
    options: SortOption[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
}

interface CustomSortProps {
    config: SortConfig;
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    className?: string;
}

export function CustomSort({
    config,
    onSortChange,
    className,
}: CustomSortProps) {
    const [tempSortBy, setTempSortBy] = useState(config.defaultSortBy || config.options[0]?.value || '');
    const [tempSortOrder, setTempSortOrder] = useState<'asc' | 'desc'>(config.defaultSortOrder || 'desc');
    const [hasChanges, setHasChanges] = useState(false);
    const [appliedSortBy, setAppliedSortBy] = useState(config.defaultSortBy || config.options[0]?.value || '');
    const [appliedSortOrder, setAppliedSortOrder] = useState<'asc' | 'desc'>(config.defaultSortOrder || 'desc');

    // Check if current temp values differ from applied values
    useEffect(() => {
        setHasChanges(tempSortBy !== appliedSortBy || tempSortOrder !== appliedSortOrder);
    }, [tempSortBy, tempSortOrder, appliedSortBy, appliedSortOrder]);

    const handleSortByChange = (value: string) => {
        setTempSortBy(value);
    };

    const handleSortOrderToggle = () => {
        setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleApplySort = () => {
        setAppliedSortBy(tempSortBy);
        setAppliedSortOrder(tempSortOrder);
        onSortChange(tempSortBy, tempSortOrder);
        setHasChanges(false);
    };

    const handleReset = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';
        setTempSortBy(defaultSortBy);
        setTempSortOrder(defaultSortOrder);
        setAppliedSortBy(defaultSortBy);
        setAppliedSortOrder(defaultSortOrder);
        onSortChange(defaultSortBy, defaultSortOrder);
        setHasChanges(false);
    };

    const getCurrentSortLabel = () => {
        const option = config.options.find(opt => opt.value === appliedSortBy);
        return option ? option.label : 'Sort by';
    };

    const hasActiveSort = () => {
        const defaultSortBy = config.defaultSortBy || config.options[0]?.value || '';
        const defaultSortOrder = config.defaultSortOrder || 'desc';
        return appliedSortBy !== defaultSortBy || appliedSortOrder !== defaultSortOrder;
    };

    return (
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
                    className="h-9 w-9 border-gray-300 dark:border-gray-700  dark:hover:bg-gray-800/50 dark:bg-gray-800/70 dark:text-gray-200"
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

            {/* Indicator that shows unsaved changes */}
            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved sort changes. Click "Apply Sort" to update.
                </div>
            )}
        </div>
    );
}