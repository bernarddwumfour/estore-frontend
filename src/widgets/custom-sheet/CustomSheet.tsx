// components/ui/custom-sheet.tsx
'use client';

import React from 'react';
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSheetProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'left' | 'right' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sheetSizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw]',
};

const sheetSideClasses = {
    left: {
        content: 'left-0 top-0 translate-x-[-100%] data-[state=open]:translate-x-0',
        overlay: '',
    },
    right: {
        content: 'right-0 top-0 translate-x-[100%] data-[state=open]:translate-x-0',
        overlay: '',
    },
    top: {
        content: 'top-0 left-0 right-0 translate-y-[-100%] data-[state=open]:translate-y-0 max-w-full !rounded-b-lg !rounded-t-none',
        overlay: '',
    },
    bottom: {
        content: 'bottom-0 left-0 right-0 translate-y-[100%] data-[state=open]:translate-y-0 max-w-full !rounded-t-lg !rounded-b-none',
        overlay: '',
    },
};

export function CustomSheet({
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
    side = 'right',
    size = 'md'
}: CustomSheetProps) {
    const sideConfig = sheetSideClasses[side];
    const sizeClass = sheetSizes[size];

    // For top/bottom sheets, width should be full
    const isHorizontalSheet = side === 'top' || side === 'bottom';
    const widthClass = isHorizontalSheet ? 'w-full' : " " + sizeClass;

    return (
        <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetPrimitive.Trigger asChild>{trigger}</SheetPrimitive.Trigger>}

            <SheetPrimitive.Portal>
                {/* Overlay */}
                <SheetPrimitive.Overlay
                    className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                />

                {/* Sheet Content */}
                <SheetPrimitive.Content
                    className={cn(
                        "fixed z-[50] h-full bg-white dark:bg-[#111114] shadow-2xl duration-200 outline-none",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        sideConfig.content,
                        isHorizontalSheet ? "h-screen max-h-[95vh]" : widthClass,
                        // Animations based on side
                        side === 'left' && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                        side === 'right' && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                        side === 'top' && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                        side === 'bottom' && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                        // Additional styling
                        "flex flex-col"
                    )}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#111114] border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <SheetPrimitive.Title className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                                    {title}
                                </SheetPrimitive.Title>
                                {description && (
                                    <SheetPrimitive.Description className="text-xs font-bold text-zinc-500 italic">
                                        {description}
                                    </SheetPrimitive.Description>
                                )}
                            </div>

                            <SheetPrimitive.Close className="rounded-full p-2 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none">
                                <X size={20} />
                                <span className="sr-only">Close</span>
                            </SheetPrimitive.Close>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {children}
                    </div>
                </SheetPrimitive.Content>
            </SheetPrimitive.Portal>
        </SheetPrimitive.Root>
    );
}