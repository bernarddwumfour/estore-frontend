'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import MultiImagePreviewModal from '../image-preview-modal/ImagePreviewModal';

interface DataDisplayProps {
    data: Record<string, any>;
    excludeKeys?: string[];
    className?: string;
    // Image configuration
    images?: Record<string, (value: any) => string | string[]>;
    // Link configuration
    links?: Record<string, (value: any) => string>;
    // Badge configuration
    badges?: Record<string, Record<string, string>>;
    // Dot indicators configuration
    dots?: Record<string, Record<string, 'emerald' | 'orange' | 'zinc' | 'blue' | 'rose' | 'amber' | 'violet'>>;
    // Custom renderers for specific keys
    customRenderers?: Record<string, (value: any) => React.ReactNode>;
}

// Multi-image component using the same modal as DataTable
function MultiImageCell({ images, alt }: { images: string[]; alt: string }) {
    const [open, setOpen] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    if (!images || images.length === 0) return null;

    const currentImage = images[selectedIndex];
    const hasMultiple = images.length > 1;

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleOpenPreview = () => {
        setSelectedIndex(0);
        setOpen(true);
    };

    return (
        <>
            <div className="relative group inline-block">
                <div
                    className="relative w-12 h-12 rounded-md overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-gray-900 dark:hover:ring-white transition-all"
                    onClick={handleOpenPreview}
                >
                    <img
                        src={currentImage}
                        alt={alt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                </div>

                {hasMultiple && (
                    <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                            onClick={handlePrevImage}
                            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs transition-all -translate-x-6"
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs transition-all translate-x-6"
                        >
                            →
                        </button>
                    </div>
                )}

                {hasMultiple && (
                    <div className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[8px] font-bold rounded-full px-1 min-w-[16px] text-center">
                        {selectedIndex + 1}/{images.length}
                    </div>
                )}
            </div>

            <MultiImagePreviewModal
                images={images}
                alt={alt}
                initialIndex={selectedIndex}
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}

// Helper function to get badge color classes
const getBadgeColorClass = (color?: string) => {
    switch (color) {
        case 'blue':
            return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
        case 'orange':
            return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800";
        case 'violet':
            return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800";
        case 'emerald':
            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
        case 'zinc':
            return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
        case 'rose':
            return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800";
        case 'amber':
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
        default:
            return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
};

// Helper function to get dot color classes
const getDotColorClass = (color?: string) => {
    switch (color) {
        case 'emerald':
            return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
        case 'orange':
            return "bg-orange-600";
        case 'blue':
            return "bg-blue-500";
        case 'rose':
            return "bg-rose-500";
        case 'zinc':
            return "bg-gray-400";
        case 'violet':
            return "bg-violet-500";
        case 'amber':
            return "bg-amber-500";
        default:
            return "bg-gray-400";
    }
};

export function DataDisplay({
    data,
    excludeKeys = [],
    className,
    images = {},
    links = {},
    badges = {},
    dots = {},
    customRenderers = {}
}: DataDisplayProps) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No Metadata Available</span>
            </div>
        );
    }

    // Filter entries based on the excludeKeys prop
    const filteredEntries = Object.entries(data).filter(
        ([key]) => !excludeKeys.includes(key)
    );

    const renderValue = (key: string, value: any) => {
        const stringValue = String(value ?? '');

        // Check for custom renderer first
        if (customRenderers[key]) {
            return customRenderers[key](value);
        }

        // Check for images
        if (images[key]) {
            const imageValue = images[key](value);
            if (Array.isArray(imageValue) && imageValue.length > 0) {
                return <MultiImageCell images={imageValue} alt={stringValue} />;
            } else if (imageValue && typeof imageValue === 'string') {
                return <MultiImageCell images={[imageValue]} alt={stringValue} />;
            }
            return <span className="text-sm text-gray-400">—</span>;
        }

        // Check for badges
        if (badges[key]?.[stringValue]) {
            const color = badges[key][stringValue];
            return (
                <Badge variant="secondary" className={cn(
                    "font-black text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border",
                    getBadgeColorClass(color)
                )}>
                    {stringValue}
                </Badge>
            );
        }

        // Check for dots
        if (dots[key]?.[stringValue]) {
            const color = dots[key][stringValue];
            return (
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", getDotColorClass(color))} />
                    <span className="text-[11px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{stringValue}</span>
                </div>
            );
        }

        // Check for links
        if (links[key]) {
            const href = links[key](value);
            if (href) {
                return (
                    <Link
                        href={href}
                        className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 font-bold flex items-center gap-1 group/link transition-all"
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                        {stringValue}
                        {href.startsWith('http') ?
                            <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-all" /> :
                            <span className="opacity-0 group-hover/link:opacity-100 transition-all">→</span>
                        }
                    </Link>
                );
            }
        }

        // Handle arrays (for attributes, etc.)
        if (Array.isArray(value) && value.length > 0) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.slice(0, 5).map((item, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border-none"
                        >
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                        </Badge>
                    ))}
                    {value.length > 5 && (
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            +{value.length - 5}
                        </Badge>
                    )}
                </div>
            );
        }

        // Handle objects
        if (typeof value === 'object' && value !== null) {
            return (
                <pre className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-100 dark:border-zinc-800 text-left overflow-x-auto max-w-full custom-scrollbar">
                    {JSON.stringify(value, null, 1)}
                </pre>
            );
        }

        // Default text rendering
        return (
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 break-words">
                {stringValue || '-'}
            </span>
        );
    };

    return (
        <div className={cn("space-y-1", className)}>
            {filteredEntries.map(([key, value]) => (
                <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-zinc-50 dark:border-zinc-900 last:border-none group"
                >
                    <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:min-w-[180px]">
                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
                            {key.replace(/([A-Z]|_)/g, ' $1')}
                        </span>
                    </div>

                    <div className="sm:flex-1 sm:text-right">
                        {renderValue(key, value)}
                    </div>
                </div>
            ))}
        </div>
    );
}