// app/components/ui/date-range-picker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
    date?: DateRange;
    setDate: (date: DateRange | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DateRangePicker({ date, setDate, placeholder = 'Select date range', className }: DateRangePickerProps) {
    const displayText = React.useMemo(() => {
        if (date?.from) {
            if (date.to) {
                return `${format(date.from, 'MMM d, yyyy')} - ${format(date.to, 'MMM d, yyyy')}`;
            }
            return `${format(date.from, 'MMM d, yyyy')} - ...`;
        }
        return placeholder;
    }, [date, placeholder]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal h-9 rounded-md',
                        'border-gray-300 dark:border-gray-700',
                        'bg-white dark:bg-black',
                        'text-gray-900 dark:text-white',
                        'hover:bg-gray-50 dark:hover:bg-gray-900/50',
                        'focus:border-gray-400 dark:focus:border-gray-600',
                        'focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600',
                        !date?.from && 'text-gray-400 dark:text-gray-600',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>{displayText}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-black" align="start">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="rounded-md bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </PopoverContent>
        </Popover>
    );
}