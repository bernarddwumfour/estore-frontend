// app/components/ui/CustomFilter.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { DateRangePicker } from '../date-picker/DateRangePicker';
import { DatePicker } from '../date-picker/DatePicker';
import { CustomDialog } from '../custom-dialog/CustomDialog';

export interface FilterField {
    name: string;
    type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'date_range' | 'number' | 'number_range';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
    width?: string;
    min?: number;
    max?: number;
    step?: number;
    debounceMs?: number;
}

export interface FilterConfig {
    fields: FilterField[];
    searchPlaceholder?: string;
    showSearch?: boolean;
    searchDebounceMs?: number;
}

interface CustomFilterProps {
    config: FilterConfig;
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
    onSearchChange?: (search: string) => void;
    onReset?: () => void;
    className?: string;
    /** Always render the compact icon+modal trigger, regardless of viewport (for narrow-container contexts). */
    forceCompact?: boolean;
}

export function CustomFilter({
    config,
    filters,
    onFilterChange,
    onSearchChange,
    onReset,
    className,
    forceCompact = false,
}: CustomFilterProps) {
    const [tempFilters, setTempFilters] = useState(filters);
    const [tempSearch, setTempSearch] = useState(filters.search || '');
    const [hasChanges, setHasChanges] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [appliedSearch, setAppliedSearch] = useState(filters.search || '');
    const [mobileOpen, setMobileOpen] = useState(false);

    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const searchDebounceTimer = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        setTempFilters(filters);
        setTempSearch(filters.search || '');
        setAppliedFilters(filters);
        setAppliedSearch(filters.search || '');
        setHasChanges(false);
    }, [filters]);

    useEffect(() => {
        const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters);
        const searchChanged = tempSearch !== appliedSearch;
        setHasChanges(filtersChanged || searchChanged);
    }, [tempFilters, tempSearch, appliedFilters, appliedSearch]);

    const handleFieldChange = (fieldName: string, value: any) => {
        const newValue = value === 'all' ? '' : value;
        const newFilters = { ...tempFilters, [fieldName]: newValue };
        setTempFilters(newFilters);
    };

    const handleDebouncedFieldChange = (fieldName: string, value: any, debounceMs: number = 500) => {
        if (debounceTimers.current[fieldName]) {
            clearTimeout(debounceTimers.current[fieldName]);
        }

        debounceTimers.current[fieldName] = setTimeout(() => {
            const newValue = value === 'all' ? '' : value;
            const newFilters = { ...tempFilters, [fieldName]: newValue };
            setTempFilters(newFilters);
            delete debounceTimers.current[fieldName];
        }, debounceMs);

        const newFilters = { ...tempFilters, [fieldName]: value };
        setTempFilters(newFilters);
    };

    const handleNumberRangeChange = (fieldName: string, type: 'min' | 'max', value: string, debounceMs: number = 500) => {
        const currentRange = tempFilters[fieldName] || { min: '', max: '' };
        const newRange = { ...currentRange, [type]: value };

        if (debounceTimers.current[fieldName]) {
            clearTimeout(debounceTimers.current[fieldName]);
        }

        debounceTimers.current[fieldName] = setTimeout(() => {
            const newFilters = { ...tempFilters, [fieldName]: newRange };
            setTempFilters(newFilters);
            delete debounceTimers.current[fieldName];
        }, debounceMs);

        const newFilters = { ...tempFilters, [fieldName]: newRange };
        setTempFilters(newFilters);
    };

    const handleSearchChange = (value: string, debounceMs: number = config.searchDebounceMs || 500) => {
        setTempSearch(value);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        searchDebounceTimer.current = setTimeout(() => {
            if (onSearchChange) {
                onSearchChange(value);
            }
        }, debounceMs);
    };

    const handleApplyFilters = () => {
        Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

        const appliedFiltersData = { ...tempFilters };
        const appliedSearchData = tempSearch;

        setAppliedFilters(appliedFiltersData);
        setAppliedSearch(appliedSearchData);

        const finalFilters = { ...appliedFiltersData };
        if (config.showSearch !== false) {
            finalFilters.search = appliedSearchData;
        }
        onFilterChange(finalFilters);
        setHasChanges(false);
    };

    const handleReset = () => {
        Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

        const resetFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            resetFilters[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
        const resetSearch = '';

        setTempFilters(resetFilters);
        setTempSearch(resetSearch);
        setAppliedFilters(resetFilters);
        setAppliedSearch(resetSearch);

        const finalFilters = { ...resetFilters };
        if (config.showSearch !== false) {
            finalFilters.search = resetSearch;
        }
        onFilterChange(finalFilters);
        if (onReset) onReset();
        setHasChanges(false);
    };

    // Helper function to check if a value is actually a non-empty filter
    const isNonEmptyValue = (value: any): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value !== '' && value !== 'all';
        if (typeof value === 'boolean') return value === true;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') {
            // Check for date range - only count if from or to is set
            if (value.from || value.to) return true;
            // Check for number range - only count if min or max has a non-empty value
            if (value.min !== undefined || value.max !== undefined) {
                const hasMin = value.min !== '' && value.min !== null && value.min !== undefined;
                const hasMax = value.max !== '' && value.max !== null && value.max !== undefined;
                if (hasMin || hasMax) return true;
            }
            // Check for other objects with keys - but ensure they have actual values
            return Object.keys(value).length > 0 && Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
        }
        return true;
    };

    const hasActiveFilters = () => {
        for (const key of Object.keys(appliedFilters)) {
            const value = appliedFilters[key];
            if (key === 'search' && !config.showSearch) continue;
            if (isNonEmptyValue(value)) return true;
        }
        return false;
    };

    const getActiveFilterCount = () => {
        let count = 0;
        for (const key of Object.keys(appliedFilters)) {
            const value = appliedFilters[key];
            if (key === 'search' && !config.showSearch) continue;
            if (isNonEmptyValue(value)) count++;
        }
        return count;
    };

    const getDisplayValue = (field: FilterField, value: string) => {
        if (!value || value === '') return null;
        const option = field.options?.find(opt => opt.value === value);
        if (option) {
            return `${field.placeholder}: ${option.label}`;
        }
        return value;
    };

    const renderField = (field: FilterField, stacked: boolean = false) => {
        const value = tempFilters[field.name] !== undefined ? tempFilters[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
        const displayValue = getDisplayValue(field, value);
        const debounceMs = field.debounceMs || 500;

        switch (field.type) {
            case 'select':
                const baseWidth = field.width ? parseInt(field.width) : 140;
                const increasedWidth = Math.round(baseWidth * 1.5);

                return (
                    <Select
                        value={value}
                        onValueChange={(v) => handleFieldChange(field.name, v)}
                    >
                        <SelectTrigger
                            className={cn(
                                "h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600",
                                stacked && "w-full"
                            )}
                            style={stacked ? undefined : { width: `${increasedWidth}px` }}
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
                            style={stacked ? undefined : { minWidth: `${increasedWidth}px` }}
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

            case 'number':
                return (
                    <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleDebouncedFieldChange(field.name, e.target.value, debounceMs)}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );

            case 'number_range':
                const rangeValue = value as { min?: string; max?: string } || { min: '', max: '' };
                const rangeWidth = field.width ? parseInt(field.width) : 200;
                return (
                    <div className={cn("flex items-center gap-1", stacked && "w-full")} style={stacked ? undefined : { width: `${rangeWidth}px` }}>
                        <Input
                            type="number"
                            placeholder={`Min ${field.placeholder}`}
                            value={rangeValue.min || ''}
                            onChange={(e) => handleNumberRangeChange(field.name, 'min', e.target.value, debounceMs)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                            type="number"
                            placeholder={`Max ${field.placeholder}`}
                            value={rangeValue.max || ''}
                            onChange={(e) => handleNumberRangeChange(field.name, 'max', e.target.value, debounceMs)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                    </div>
                );

            case 'text':
                return (
                    <Input
                        type="text"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleDebouncedFieldChange(field.name, e.target.value, debounceMs)}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );

            case 'date':
                return (
                    <DatePicker
                        date={value || undefined}
                        setDate={(date: any) => handleFieldChange(field.name, date)}
                        placeholder={field.placeholder || 'Select date'}
                        className="w-full"
                    />
                );

            case 'date_range':
                const dateRangeValue = value as { from?: Date; to?: Date } || undefined;
                return (
                    <DateRangePicker
                        date={dateRangeValue as any}
                        setDate={(range: any) => handleFieldChange(field.name, range)}
                        placeholder={field.placeholder || 'Select date range'}
                        className="w-full"
                    />
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
                                className={cn(
                                    "h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600",
                                    stacked && "w-full"
                                )}
                                style={stacked ? undefined : { width: `${multiselectIncreasedWidth}px` }}
                            >
                                <SelectValue placeholder={field.placeholder || 'Select'} />
                            </SelectTrigger>
                            <SelectContent
                                className="bg-white dark:bg-black border-gray-200 dark:border-gray-800"
                                style={stacked ? undefined : { minWidth: `${multiselectIncreasedWidth}px` }}
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

            default:
                return (
                    <Input
                        type="text"
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleDebouncedFieldChange(field.name, e.target.value, debounceMs)}
                        className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                    />
                );
        }
    };

    const activeCount = getActiveFilterCount();

    const desktopRow = (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-wrap gap-2 gap-y-4 items-center">
                {config.showSearch !== false && (
                    <div className="relative" style={{ width: '240px' }}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder={config.searchPlaceholder || "Search..."}
                            value={tempSearch}
                            onChange={(e) => handleSearchChange(e.target.value, config.searchDebounceMs || 500)}
                            className="pl-9 h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
                        />
                    </div>
                )}

                {config.fields.map((field) => (
                    <div key={field.name}>
                        {renderField(field)}
                    </div>
                ))}

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

                {hasActiveFilters() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 shrink-0 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={14} />
                        Clear
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {activeCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </div>

            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved filter changes. Click "Apply Filters" to update.
                </div>
            )}
        </div>
    );

    const compactTrigger = (
        <div className="relative inline-block">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileOpen(true)}
                className="gap-2 h-9 border-gray-300 dark:border-gray-700 text-gray-700"
            >
                <Filter size={14} />
                Filters
            </Button>
            {activeCount > 0 && (
                <Badge
                    className="absolute -top-2 -right-2 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] border-0 bg-gray-900 text-white dark:bg-white dark:text-gray-900 pointer-events-none"
                >
                    {activeCount}
                </Badge>
            )}
        </div>
    );

    return (
        <>
            {!forceCompact && <div className="hidden lg:block">{desktopRow}</div>}
            <div className={forceCompact ? undefined : "lg:hidden"}>{compactTrigger}</div>

            <CustomDialog
                title="Filters"
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                contentWidth="max-w-[480px]"
            >
                <div className="space-y-4">
                    {config.showSearch !== false && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={config.searchPlaceholder || "Search..."}
                                    value={tempSearch}
                                    onChange={(e) => handleSearchChange(e.target.value, config.searchDebounceMs || 500)}
                                    className="pl-9 h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    )}

                    {config.fields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                            {field.type !== 'checkbox' && (
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {field.placeholder}
                                </label>
                            )}
                            {renderField(field, true)}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-[#111114]">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                        disabled={!hasActiveFilters()}
                    >
                        Clear
                    </Button>
                    <Button
                        className="flex-1 gap-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700"
                        onClick={() => {
                            handleApplyFilters();
                            setMobileOpen(false);
                        }}
                    >
                        <Filter size={14} />
                        Apply Filters
                    </Button>
                </div>
            </CustomDialog>
        </>
    );
}