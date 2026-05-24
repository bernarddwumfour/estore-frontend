// app/components/ui/UnderConstruction.tsx
'use client';

import React from 'react';
import { Construction, Clock, AlertCircle, Hammer, Wrench, BatteryCharging } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UnderConstructionProps {
    title?: string;
    message?: string;
    estimatedCompletion?: string;
    features?: string[];
    showBackButton?: boolean;
    showHomeButton?: boolean;
    variant?: 'default' | 'minimal' | 'detailed';
    className?: string;
}

const iconMap = {
    default: <Construction className="h-20 w-20 text-amber-500" />,
    minimal: <Hammer className="h-12 w-12 text-amber-500" />,
    detailed: <BatteryCharging className="h-24 w-24 text-amber-500" />,
};

export function UnderConstruction({
    title = "Page Under Construction",
    message = "We're working hard to bring you this feature. Please check back soon!",
    estimatedCompletion,
    features = [],
    showBackButton = true,
    showHomeButton = true,
    variant = 'default',
    className,
}: UnderConstructionProps) {
    return (
        <div className={cn("min-h-[60vh] flex items-center justify-center px-4", className)}>
            <div className="text-center max-w-2xl">
                {/* Icon */}
                <div className="mb-6 animate-pulse">
                    {iconMap[variant]}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h1>

                {/* Message */}
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>

                {/* Estimated Completion */}
                {estimatedCompletion && (
                    <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <Clock size={16} />
                        <span>Estimated completion: {estimatedCompletion}</span>
                    </div>
                )}

                {/* Features coming soon */}
                {features.length > 0 && variant === 'detailed' && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Wrench size={18} />
                            Features coming soon:
                        </h3>
                        <ul className="space-y-2">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <AlertCircle size={14} className="text-amber-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    {showBackButton && (
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            ← Go Back
                        </Button>
                    )}
                    {showHomeButton && (
                        <Button asChild className="gap-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700">
                            <Link href="/dashboard">
                                Go to Dashboard
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Status indicator */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>In Development</span>
                </div>
            </div>
        </div>
    );
}