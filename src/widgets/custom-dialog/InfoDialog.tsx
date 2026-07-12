'use client';

import React, { ReactNode } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Ban, CheckCheck, Info, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export interface InfoDialogProps {
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    contentWidth?: string;
    primaryAction?: () => void;
    secondaryAction?: () => void;
    handleClose?: () => void;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    infoMessage?: string
    icon?: ReactNode;
    variant?: "info" | "success" | "error"
}

export function InfoDialog({
    trigger,
    title,
    description,
    open,
    onOpenChange,
    contentWidth,
    primaryAction,
    primaryButtonText = "Confirm",
    secondaryAction,
    infoMessage,
    secondaryButtonText = "Cancel",
    icon,
    variant = "info",
    handleClose
}: InfoDialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                />

                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-[101] max-h-[90vh] overflow-y-auto w-full translate-x-[-50%] translate-y-[-50%]",
                        "gap-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 shadow-2xl duration-200 rounded-xl outline-none",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                        contentWidth ?? "max-w-[550px]"
                    )}
                >
                    <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <DialogPrimitive.Title className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                            {title}
                        </DialogPrimitive.Title>
                        {description && (
                            <DialogPrimitive.Description className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {description}
                            </DialogPrimitive.Description>
                        )}
                    </div>

                    {/* Icon Container - Black & White Theme */}
                    <div className={cn(
                        "rounded-full w-fit mx-auto my-6 p-8",
                        variant === "info" && "bg-gray-100 dark:bg-gray-900",
                        variant === "success" && "bg-gray-100 dark:bg-gray-900",
                        variant === "error" && "bg-gray-100 dark:bg-gray-900"
                    )}>
                        {icon || (
                            variant === "success" ?
                                <CheckCheck className='w-[40px] h-[40px] text-gray-700 dark:text-gray-300' /> :
                                variant === "error" ?
                                    <Ban className='w-[40px] h-[40px] text-gray-700 dark:text-gray-300' /> :
                                    <Info className='w-[40px] h-[40px] text-gray-700 dark:text-gray-300' />
                        )}
                    </div>

                    {/* Message */}
                    <p className='text-sm text-gray-700 dark:text-gray-300 py-4 text-center'>
                        {infoMessage}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full text-[10px] font-black uppercase tracking-widest"
                            onClick={secondaryAction}
                        >
                            {secondaryButtonText}
                        </Button>
                        <Button
                            className={cn(
                                "flex-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                variant === "error" && "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700",
                                variant === "success" && "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700",
                                variant === "info" && "bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700"
                            )}
                            onClick={primaryAction}
                        >
                            {primaryButtonText}
                        </Button>
                    </div>

                    {/* Close Button */}
                    <DialogPrimitive.Close
                        onClick={handleClose}
                        className="absolute right-6 top-6 rounded-full p-2 opacity-70 ring-offset-white transition-opacity hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 outline-none"
                    >
                        <X size={20} className="text-gray-700 dark:text-gray-300" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}