'use client';

import React from 'react';

const SIZES = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
} as const;

const VARIANTS = {
    brand: 'from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400',
    neutral: 'from-gray-400 to-gray-600',
    amber: 'from-gray-400 to-gray-600',
} as const;

interface UserAvatarProps {
    /** Name whose first letter becomes the initial. */
    name: string;
    size?: keyof typeof SIZES;
    variant?: keyof typeof VARIANTS;
    /** Render an icon instead of the initial. */
    icon?: React.ReactNode;
    className?: string;
}

/** Gradient initial/icon avatar used in feeds, comment threads and inbox lists. */
export function UserAvatar({ name, size = 'md', variant = 'brand', icon, className = '' }: UserAvatarProps) {
    return (
        <div
            className={`${SIZES[size]} rounded-full bg-gradient-to-br ${VARIANTS[variant]} flex items-center justify-center text-white font-bold shrink-0 ${className}`}
        >
            {icon ?? name.slice(0, 1).toUpperCase()}
        </div>
    );
}
