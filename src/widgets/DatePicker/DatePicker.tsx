// app/components/ui/date-picker.tsx
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

interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder = 'Pick a date', className }: DatePickerProps) {
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
                        !date && 'text-gray-400 dark:text-gray-600',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </PopoverContent>
        </Popover>
    );
}