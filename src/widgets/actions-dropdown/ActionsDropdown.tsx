// app/components/ActionsDropdown.tsx
'use client';

import React, { useState } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    color?: 'emerald' | 'orange' | 'blue' | 'rose' | 'violet' | 'amber';
    disabled?: boolean;
    loading?: boolean; // Added loading property for spinner
}

interface ActionsDropdownProps {
    actions: ActionItem[];
    maxVisible?: number;
    showLabels?: boolean;
    className?: string;
    buttonSize?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

// Helper function to get icon color classes (for the icon only)
const getIconColorClasses = (color?: string) => {
    switch (color) {
        case 'emerald':
            return 'text-emerald-600 dark:text-emerald-400';
        case 'orange':
            return 'text-orange-600 dark:text-orange-400';
        case 'blue':
            return 'text-blue-600 dark:text-blue-400';
        case 'rose':
            return 'text-rose-600 dark:text-rose-400';
        case 'violet':
            return 'text-violet-600 dark:text-violet-400';
        case 'amber':
            return 'text-amber-600 dark:text-amber-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

export function ActionsDropdown({
    actions,
    maxVisible = 3,
    showLabels = false,
    className,
    buttonSize = 'sm',
    disabled = false
}: ActionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!actions || actions.length === 0) return null;

    const visibleActions = actions.slice(0, maxVisible);
    const dropdownActions = actions.slice(maxVisible);

    // Button size classes
    const getButtonSizeClasses = () => {
        switch (buttonSize) {
            case 'sm':
                return showLabels ? 'h-8 px-3 gap-2 text-xs' : 'h-8 w-8 p-0';
            case 'md':
                return showLabels ? 'h-9 px-4 gap-2 text-sm' : 'h-9 w-9 p-0';
            case 'lg':
                return showLabels ? 'h-10 px-5 gap-2 text-base' : 'h-10 w-10 p-0';
            default:
                return showLabels ? 'h-8 px-3 gap-2 text-xs' : 'h-8 w-8 p-0';
        }
    };

    const getIconSize = () => {
        switch (buttonSize) {
            case 'sm': return 14;
            case 'md': return 16;
            case 'lg': return 18;
            default: return 14;
        }
    };

    const iconSize = getIconSize();

    // Helper to render icon with proper size, color, and loading state
    const renderIcon = (icon: React.ReactNode, size: number, color?: string, variant?: string, isDisabled?: boolean, isLoading?: boolean) => {
        // Show spinner if loading
        if (isLoading) {
            return <Loader2 size={size} className="animate-spin text-gray-600 dark:text-gray-400" />;
        }

        if (React.isValidElement(icon)) {
            let iconColorClass;
            if (isDisabled) {
                iconColorClass = 'text-gray-400 dark:text-gray-600';
            } else if (variant === 'destructive') {
                iconColorClass = 'text-red-600 dark:text-red-400';
            } else {
                iconColorClass = getIconColorClasses(color);
            }

            return React.cloneElement(icon, {
                size,
                className: iconColorClass
            } as any);
        }
        return icon;
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Visible Actions (first maxVisible) */}
            {visibleActions.map((action, index) => {
                const isActionDisabled = disabled || action.disabled || action.loading;
                const isLoading = action.loading;

                return (
                    <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={isActionDisabled ? undefined : action.onClick}
                        disabled={isActionDisabled}
                        className={cn(
                            "rounded-lg transition-colors",
                            getButtonSizeClasses(),
                            !isActionDisabled && "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                            action.variant === 'destructive' && !isActionDisabled && "hover:bg-red-50 dark:hover:bg-red-950/20",
                            isActionDisabled && "opacity-50 cursor-not-allowed"
                        )}
                        title={!showLabels ? action.label : undefined}
                    >
                        {renderIcon(action.icon, iconSize, action.color, action.variant, isActionDisabled, isLoading)}
                        {showLabels && (
                            <span className={cn(
                                "font-medium",
                                isActionDisabled ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"
                            )}>
                                {action.label}
                            </span>
                        )}
                    </Button>
                );
            })}

            {/* Dropdown for remaining actions */}
            {dropdownActions.length > 0 && (
                <DropdownMenu open={isOpen && !disabled} onOpenChange={(open) => !disabled && setIsOpen(open)}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className={cn(
                                "rounded-lg transition-colors",
                                getButtonSizeClasses(),
                                !disabled && "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {renderIcon(<MoreVertical />, iconSize, undefined, undefined, disabled)}
                            {showLabels && (
                                <span className={cn(
                                    "text-xs font-medium",
                                    disabled ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    More
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-2xl">
                        {dropdownActions.map((action, index) => {
                            const isActionDisabled = disabled || action.disabled || action.loading;
                            const isLoading = action.loading;

                            return (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => {
                                        if (!isActionDisabled) {
                                            action.onClick();
                                            setIsOpen(false);
                                        }
                                    }}
                                    disabled={isActionDisabled}
                                    className={cn(
                                        "text-sm gap-3 py-2 px-3 rounded-lg transition-colors",
                                        !isActionDisabled && "cursor-pointer",
                                        isActionDisabled && "opacity-50 cursor-not-allowed",
                                        !isActionDisabled && action.variant === 'destructive' && "hover:bg-red-50 dark:hover:bg-red-950/20",
                                        !isActionDisabled && action.variant !== 'destructive' && "hover:bg-gray-100 dark:hover:bg-gray-900",
                                        isActionDisabled ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"
                                    )}
                                >
                                    {renderIcon(action.icon, 16, action.color, action.variant, isActionDisabled, isLoading)}
                                    <span>{action.label}</span>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}