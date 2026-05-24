// app/components/ui/CustomFilter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterField {
    name: string;
    type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'number';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
    width?: string;
}

export interface FilterConfig {
    fields: FilterField[];
    searchPlaceholder?: string;
    showSearch?: boolean;
}

interface CustomFilterProps {
    config: FilterConfig;
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
    onSearchChange?: (search: string) => void;
    onReset?: () => void;
    className?: string;
}

export function CustomFilter({
    config,
    filters,
    onFilterChange,
    onSearchChange,
    onReset,
    className,
}: CustomFilterProps) {
    const [tempFilters, setTempFilters] = useState(filters);
    const [tempSearch, setTempSearch] = useState(filters.search || '');
    const [hasChanges, setHasChanges] = useState(false);

    // Update temp filters when props change (e.g., after apply)
    useEffect(() => {
        setTempFilters(filters);
        setTempSearch(filters.search || '');
        setHasChanges(false);
    }, [filters]);

    const handleFieldChange = (fieldName: string, value: any) => {
        // Convert 'all' to empty string for storage (so placeholder shows)
        const newValue = value === 'all' ? '' : value;
        const newFilters = { ...tempFilters, [fieldName]: newValue };
        setTempFilters(newFilters);
        setHasChanges(true);
    };

    const handleSearchChange = (value: string) => {
        setTempSearch(value);
        setHasChanges(true);
    };

    const handleApplyFilters = () => {
        const appliedFilters = { ...tempFilters };
        if (config.showSearch !== false) {
            appliedFilters.search = tempSearch;
        }
        onFilterChange(appliedFilters);
        setHasChanges(false);
    };

    const handleReset = () => {
        const resetFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            resetFilters[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
        if (config.showSearch !== false) {
            resetFilters.search = '';
        }
        setTempFilters(resetFilters);
        setTempSearch('');
        setHasChanges(true);

        // Apply immediately on reset
        onFilterChange(resetFilters);
        if (onReset) onReset();
        setHasChanges(false);
    };

    const hasActiveFilters = () => {
        return Object.keys(filters).some(key => {
            const value = filters[key];
            if (key === 'search' && !config.showSearch) return false;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'boolean') return value === true;
            return value && value !== '' && value !== null && value !== undefined;
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (key === 'search' && !config.showSearch) return;
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === 'boolean' && value === true) count++;
            else if (value && value !== '' && value !== null && value !== undefined) count++;
        });
        return count;
    };

    // Helper function to get display text with label prefix
    const getDisplayValue = (field: FilterField, value: string) => {
        if (!value || value === '') return null;
        const option = field.options?.find(opt => opt.value === value);
        if (option) {
            return `${field.placeholder}: ${option.label}`;
        }
        return value;
    };

    const renderField = (field: FilterField) => {
        const value = tempFilters[field.name] !== undefined ? tempFilters[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
        const displayValue = getDisplayValue(field, value);

        switch (field.type) {
            case 'select':
                // Calculate increased width (1.5x of original)
                const baseWidth = field.width ? parseInt(field.width) : 140;
                const increasedWidth = Math.round(baseWidth * 1.5);

                return (
                    <Select
                        value={value}
                        onValueChange={(v) => handleFieldChange(field.name, v)}
                    >
                        <SelectTrigger
                            className="h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                            style={{ width: `${increasedWidth}px` }}
                        >
                            <SelectValue placeholder={field.placeholder || 'All'}>
                                {displayValue && (
                                    <span className="text-gray-900 dark:text-white">
                                        {displayValue}
                                    </span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            className="bg-white dark:bg-black border-gray-200 dark:border-gray-800"
                            style={{ minWidth: `${increasedWidth}px` }}
                        >
                            <SelectItem value="all" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">
                                All
                            </SelectItem>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'multiselect':
                const selectedValues = Array.isArray(value) ? value : [];
                const multiselectWidth = field.width ? parseInt(field.width) : 140;
                const multiselectIncreasedWidth = Math.round(multiselectWidth * 1.5);

                return (
                    <div>
                        <Select
                            value=""
                            onValueChange={(v) => {
                                if (v && !selectedValues.includes(v)) {
                                    const newValues = [...selectedValues, v];
                                    handleFieldChange(field.name, newValues);
                                }
                            }}
                        >
                            <SelectTrigger
                                className="h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                                style={{ width: `${multiselectIncreasedWidth}px` }}
                            >
                                <SelectValue placeholder={field.placeholder || 'Select'} />
                            </SelectTrigger>
                            <SelectContent
                                className="bg-white dark:bg-black border-gray-200 dark:border-gray-800"
                                style={{ minWidth: `${multiselectIncreasedWidth}px` }}
                            >
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedValues.map((val) => {
                                    const option = field.options?.find(o => o.value === val);
                                    return (
                                        <Badge
                                            key={val}
                                            variant="secondary"
                                            className="gap-1 cursor-pointer bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs h-5 hover:bg-gray-200 dark:hover:bg-gray-800"
                                            onClick={() => {
                                                const newValues = selectedValues.filter(v => v !== val);
                                                handleFieldChange(field.name, newValues);
                                            }}
                                        >
                                            {option?.label || val}
                                            <X size={10} className="ml-1 hover:text-red-600 dark:hover:text-red-400" />
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2 h-9 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900/50 focus-within:border-gray-400 dark:focus-within:border-gray-600">
                        <Checkbox
                            id={field.name}
                            checked={value === true}
                            onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                            className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-700"
                        />
                        <label
                            htmlFor={field.name}
                            className="text-sm font-medium cursor-pointer select-none text-gray-700 dark:text-gray-300 whitespace-nowrap"
                        >
                            {field.placeholder}
                        </label>
                    </div>
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );

            default:
                return (
                    <Input
                        type="text"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {/* All filters on one line - search and filters together */}
            <div className="flex flex-wrap gap-2 items-center">
                {/* Search input */}
                {config.showSearch !== false && (
                    <div className="relative" style={{ width: '240px' }}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder={config.searchPlaceholder || "Search..."}
                            value={tempSearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                        />
                    </div>
                )}

                {/* Filter fields */}
                {config.fields.map((field) => (
                    <div key={field.name}>
                        {renderField(field)}
                    </div>
                ))}

                {/* Apply Filters Button */}
                <Button
                    variant={hasChanges ? "default" : "secondary"}
                    size="sm"
                    onClick={handleApplyFilters}
                    className={cn(
                        "gap-2 h-9",
                        hasChanges
                            ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700"
                            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    )}
                    disabled={!hasChanges}
                >
                    <Filter size={14} />
                    Apply Filters
                </Button>

                {/* Clear button - shows when filters are active */}
                {hasActiveFilters() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 shrink-0 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={14} />
                        Clear
                        {getActiveFilterCount() > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {getActiveFilterCount()}
                            </Badge>
                        )}
                    </Button>
                )}
            </div>

            {/* Indicator that shows unsaved changes */}
            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved filter changes. Click "Apply Filters" to update.
                </div>
            )}
        </div>
    );
}