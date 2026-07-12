'use client';

import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface CustomDialogProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    contentWidth?: string
}

export function CustomDialog({ trigger, title, description, children, open, onOpenChange, contentWidth }: CustomDialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

            <DialogPrimitive.Portal>
                {/* 1. Force the Overlay to a high Z-index */}
                <DialogPrimitive.Overlay
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                />

                {/* 2. Force the Content to a HIGHER Z-index */}
                <DialogPrimitive.Content
                    className={`fixed left-[50%] top-[50%] z-[101] max-h-[90vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full ${contentWidth ?? "max-w-[550]"} translate-x-[-50%] translate-y-[-50%] 
                               gap-4 border-none bg-white p-8 shadow-2xl duration-200 
                               dark:bg-[#111114] rounded-lg outline-none
                               data-[state=open]:animate-in data-[state=closed]:animate-out 
                               data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                               data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
                               data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] 
                               data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]`}
                >
                    <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <DialogPrimitive.Title className="text-lg font-black uppercase tracking-tighter  text-zinc-900 dark:text-white">
                            {title}
                        </DialogPrimitive.Title>
                        {description && (
                            <DialogPrimitive.Description className="text-xs font-bold text-zinc-500 italic">
                                {description}
                            </DialogPrimitive.Description>
                        )}
                    </div>

                    <div className="mt-6">
                        {children}
                    </div>

                    <DialogPrimitive.Close className="absolute right-6 top-6 rounded-full p-2 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none">
                        <X size={20} />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}