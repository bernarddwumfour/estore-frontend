// app/components/ActionsDropdown.tsx
'use client';

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
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
}

interface ActionsDropdownProps {
    actions: ActionItem[];
    maxVisible?: number; // Number of actions to show, default is 3
    showLabels?: boolean; // Whether to show labels next to icons, default is false
    className?: string;
    buttonSize?: 'sm' | 'md' | 'lg'; // Size of action buttons
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
    buttonSize = 'sm'
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

    // Helper to render icon with proper size and color
    const renderIcon = (icon: React.ReactNode, size: number, color?: string, variant?: string) => {
        if (React.isValidElement(icon)) {
            const iconColorClass = variant === 'destructive'
                ? 'text-red-600 dark:text-red-400'
                : getIconColorClasses(color);

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
            {visibleActions.map((action, index) => (
                <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.onClick}
                    className={cn(
                        "rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors",
                        getButtonSizeClasses(),
                        action.variant === 'destructive' && "hover:bg-red-50 dark:hover:bg-red-950/20"
                    )}
                    title={!showLabels ? action.label : undefined}
                >
                    {renderIcon(action.icon, iconSize, action.color, action.variant)}
                    {showLabels && (
                        <span className={cn(
                            "font-medium text-gray-700 dark:text-gray-300"
                        )}>
                            {action.label}
                        </span>
                    )}
                </Button>
            ))}

            {/* Dropdown for remaining actions */}
            {dropdownActions.length > 0 && (
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors",
                                getButtonSizeClasses()
                            )}
                        >
                            {renderIcon(<MoreVertical />, iconSize)}
                            {showLabels && (
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    More
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-2xl">
                        {dropdownActions.map((action, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "text-sm gap-3 py-2 px-3 cursor-pointer rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900",
                                    action.variant === 'destructive' && "hover:bg-red-50 dark:hover:bg-red-950/20"
                                )}
                            >
                                {renderIcon(action.icon, 16, action.color, action.variant)}
                                <span>{action.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}