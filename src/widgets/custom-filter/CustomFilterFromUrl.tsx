// app/components/ui/CustomFilter.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

export interface FilterField {
    name: string;
    type: 'boolean' | 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'date_range' | 'number' | 'number_range';
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
    urlParamPrefix?: string; // Prefix for URL params to avoid conflicts
}

interface CustomFilterProps {
    config: FilterConfig;
    onFilterChange?: (filters: Record<string, any>) => void;
    className?: string;
}

// Helper to get value from URL params
const getValueFromUrl = (
    searchParams: URLSearchParams,
    fieldName: string,
    type: FilterField['type'],
    prefix?: string
): any => {
    const paramName = prefix ? `${prefix}_${fieldName}` : fieldName;
    const paramValue = searchParams.get(paramName);

    if (!paramValue) {
        if (type === 'number_range') return { min: '', max: '' };
        if (type === 'date_range') return { from: undefined, to: undefined };
        if (type === 'multiselect') return [];
        return '';
    }

    switch (type) {
        case 'number':
            return isNaN(Number(paramValue)) ? '' : Number(paramValue);
        case 'boolean':
            return paramValue === 'true';
        case 'number_range':
            if (paramValue.includes('min=') || paramValue.includes('max=')) {
                const params = new URLSearchParams(paramValue);
                return {
                    min: params.get('min') || '',
                    max: params.get('max') || '',
                };
            }
            return { min: '', max: '' };
        case 'date_range':
            if (paramValue.includes('from=') || paramValue.includes('to=')) {
                const params = new URLSearchParams(paramValue);
                return {
                    from: params.get('from') ? new Date(params.get('from')!) : undefined,
                    to: params.get('to') ? new Date(params.get('to')!) : undefined,
                };
            }
            return { from: undefined, to: undefined };
        case 'multiselect':
            return paramValue.split(',');
        default:
            return paramValue;
    }
};

// Helper to convert value to URL param string
const valueToUrlParam = (value: any, type: FilterField['type']): string | null => {
    if (value === undefined || value === null || value === '') return null;
    if (type === 'boolean') return value ? 'true' : 'false';

    if (type === 'number_range') {
        if (value.min || value.max) {
            const parts = [];
            if (value.min) parts.push(`min=${value.min}`);
            if (value.max) parts.push(`max=${value.max}`);
            return parts.join('&');
        }
        return null;
    }

    if (type === 'date_range') {
        if (value?.from || value?.to) {
            const parts = [];
            if (value.from) parts.push(`from=${value.from.toISOString()}`);
            if (value.to) parts.push(`to=${value.to.toISOString()}`);
            return parts.join('&');
        }
        return null;
    }

    if (type === 'multiselect') {
        if (Array.isArray(value) && value.length > 0) {
            return value.join(',');
        }
        return null;
    }

    return String(value);
};

// Internal component that uses useSearchParams
function CustomFilterContent({
    config,
    onFilterChange,
    className,
}: CustomFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tempFilters, setTempFilters] = useState<Record<string, any>>({});
    const [tempSearch, setTempSearch] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const searchDebounceTimer = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        const initialFilters: Record<string, any> = {};

        if (config.showSearch !== false) {
            const searchParam = searchParams.get('search');
            setTempSearch(searchParam || '');
        }

        config.fields.forEach(field => {
            const value = getValueFromUrl(searchParams, field.name, field.type, config.urlParamPrefix);
            initialFilters[field.name] = value;
        });

        setTempFilters(initialFilters);
        setIsInitialized(true);
    }, [config.fields, config.urlParamPrefix, config.showSearch, searchParams]);

    const updateUrl = useCallback((filters: Record<string, any>, search: string) => {
        const params = new URLSearchParams();

        if (config.showSearch !== false && search) {
            params.set('search', search);
        }

        config.fields.forEach(field => {
            const value = filters[field.name];
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'object') {
                    if (Object.keys(value).length === 0) return;
                    if (value.min === '' && value.max === '') return;
                    if (!value.from && !value.to) return;
                }

                const paramValue = valueToUrlParam(value, field.type);
                if (paramValue) {
                    const paramName = config.urlParamPrefix ? `${config.urlParamPrefix}_${field.name}` : field.name;
                    params.set(paramName, paramValue);
                }
            }
        });

        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        if (page) params.set('page', page);
        if (limit) params.set('limit', limit);

        const sortBy = searchParams.get('sort_by');
        const sortOrder = searchParams.get('sort_order');
        if (sortBy) params.set('sort_by', sortBy);
        if (sortOrder) params.set('sort_order', sortOrder);

        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        router.replace(newUrl, { scroll: false });
    }, [config, pathname, router, searchParams]);

    useEffect(() => {
        if (!isInitialized) return;

        const currentUrlFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            currentUrlFilters[field.name] = getValueFromUrl(searchParams, field.name, field.type, config.urlParamPrefix);
        });
        const currentUrlSearch = config.showSearch !== false ? (searchParams.get('search') || '') : '';

        const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify(currentUrlFilters);
        const searchChanged = tempSearch !== currentUrlSearch;
        setHasChanges(filtersChanged || searchChanged);
    }, [tempFilters, tempSearch, searchParams, config.fields, config.urlParamPrefix, config.showSearch, isInitialized]);

    const handleFieldChange = (fieldName: string, value: any) => {
        const newValue = value === 'all' ? '' : value;
        setTempFilters(prev => ({ ...prev, [fieldName]: newValue }));
    };

    const handleNumberRangeChange = (fieldName: string, type: 'min' | 'max', value: string) => {
        const currentRange = tempFilters[fieldName] || { min: '', max: '' };
        const newRange = { ...currentRange, [type]: value };
        setTempFilters(prev => ({ ...prev, [fieldName]: newRange }));
    };

    const handleSearchChange = (value: string) => {
        setTempSearch(value);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        searchDebounceTimer.current = setTimeout(() => {
            const newFilters = { ...tempFilters };
            updateUrl(newFilters, value);
            if (onFilterChange) {
                onFilterChange({ ...newFilters, search: value });
            }
        }, config.searchDebounceMs || 500);
    };

    const handleApplyFilters = () => {
        Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

        updateUrl(tempFilters, tempSearch);
        if (onFilterChange) {
            onFilterChange({ ...tempFilters, search: tempSearch });
        }
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
        updateUrl(resetFilters, resetSearch);
        if (onFilterChange) {
            onFilterChange({ ...resetFilters, search: resetSearch });
        }
        setHasChanges(false);
    };

    const isActiveFilter = (value: any): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value !== '' && value !== 'all';
        if (typeof value === 'boolean') return value === true;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') {
            if (value.from || value.to) return true;
            if (value.min !== undefined && value.min !== '') return true;
            if (value.max !== undefined && value.max !== '') return true;
            return false;
        }
        return true;
    };

    const getActiveFilterCount = () => {
        let count = 0;
        for (const value of Object.values(tempFilters)) {
            if (isActiveFilter(value)) count++;
        }
        return count;
    };

    const getDisplayValue = (field: FilterField, value: any) => {
        if (!value || value === '') return null;
        if (field.type === 'select') {
            const option = field.options?.find(opt => opt.value === value);
            if (option) return `${field.placeholder}: ${option.label}`;
        }
        return value;
    };

    const renderField = (field: FilterField) => {
        const value = tempFilters[field.name] !== undefined ? tempFilters[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
        const displayValue = getDisplayValue(field, value);

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

            case 'number_range':
                const rangeValue = value as { min?: string; max?: string } || { min: '', max: '' };
                const rangeWidth = field.width ? parseInt(field.width) : 200;
                return (
                    <div className="flex items-center gap-1" style={{ width: `${rangeWidth}px` }}>
                        <Input
                            type="number"
                            placeholder={`Min ${field.placeholder}`}
                            value={rangeValue.min || ''}
                            onChange={(e) => handleNumberRangeChange(field.name, 'min', e.target.value)}
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
                            onChange={(e) => handleNumberRangeChange(field.name, 'max', e.target.value)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className="h-9 w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isInitialized) {
        return <div className="h-9 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />;
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-wrap gap-2 gap-y-4 items-center">
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

                {getActiveFilterCount() > 0 && (
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

            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved filter changes. Click "Apply Filters" to update.
                </div>
            )}
        </div>
    );
}

// Main exported component with Suspense boundary
export function CustomFilter(props: CustomFilterProps) {
    return (
        <Suspense fallback={<div className="h-9 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />}>
            <CustomFilterContent {...props} />
        </Suspense>
    );
}