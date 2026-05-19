'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MoreVertical, Settings2, ChevronRight, Download, Inbox, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from 'next/link';

import { DataDisplay } from '../DataDisplay/DataDisplay';
import { CustomDialog } from '../CustomDialog/CustomDialog';
import { CustomSheet } from '../CustomSheet/CustomSheet';
import MultiImagePreviewModal from '../ImagePreviewModal/ImagePreviewModal';


type ColorOption = 'emerald' | 'orange' | 'zinc' | 'blue' | 'rose' | 'amber' | 'violet';
type ViewType = 'dialog' | 'sheet';

interface DisplayConfig {
    id: string;
    label: string;
    icon: React.ReactNode;
    getData: (item: any) => Record<string, any>;
    excludeKeys?: string[];
    component?: (data: any, onClose?: () => void) => React.ReactNode;
    viewType?: ViewType;
    sheetSide?: 'left' | 'right' | 'top' | 'bottom';
    sheetSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface DataTableProps<T> {
    data: T[];
    emptyTitle?: string;
    emptyDescription?: string;
    displayConfigs?: DisplayConfig[];
    excludeColumns?: string[];
    dots?: Record<string, Record<string, ColorOption>>;
    badges?: Record<string, Record<string, ColorOption>>;
    icons?: Record<string, Record<string, React.ReactNode>>;
    links?: Record<string, (item: T) => string>;
    images?: Record<string, (item: T) => string | string[]>; // Can be single URL or array of URLs
    actions?: {
        label: string | ((item: T) => string);
        icon: React.ReactNode | ((item: T) => React.ReactNode);
        variant?: 'default' | 'destructive' | 'outline' | ((item: T) => 'default' | 'destructive' | 'outline');
        onClick: (item: T) => void;
    }[];
    bulkActions?: {
        label: string;
        onClick: (items: T[]) => void;
        icon?: React.ReactNode;
        variant?: 'default' | 'destructive';
        color?: 'emerald' | 'orange' | 'blue' | 'rose' | 'violet' | 'amber';
    }[];
    onSelectionChange?: (selectedItems: T[]) => void;
    actionsFirst?: boolean;
}

// Helper function to get button color classes
const getButtonColorClasses = (color?: string) => {
    switch (color) {
        case 'emerald':
            return 'bg-emerald-600/90 hover:bg-emerald-700 text-white';
        case 'orange':
            return 'bg-orange-600/90 hover:bg-orange-700 text-white';
        case 'blue':
            return 'bg-blue-600/90 hover:bg-blue-700 text-white';
        case 'rose':
            return 'bg-rose-600/90 hover:bg-rose-700 text-white';
        case 'violet':
            return 'bg-violet-600/90 hover:bg-violet-700 text-white';
        case 'amber':
            return 'bg-amber-600/90 hover:bg-amber-700 text-white';
        default:
            return '';
    }
};

// Multi-Image Cell Component
function MultiImageCell({ images, alt }: { images: string[]; alt: string }) {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return <span className="text-muted-foreground">—</span>;

    const currentImage = images[selectedIndex]; // FIXED: Use selectedIndex instead of always 0
    const hasMultiple = images.length > 1;

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Uncomment to prevent triggering parent click
        console.log("Previous clicked", selectedIndex);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Uncomment to prevent triggering parent click
        console.log("Next clicked", selectedIndex);
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleOpenPreview = () => {
        setSelectedIndex(0);
        setOpen(true);
    };

    return (
        <>
            <div className="relative group inline-block">
                {/* Main Image */}
                <div
                    className="relative w-10 h-10 rounded-md overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 hover:ring-2 hover:ring-orange-500 transition-all"
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
                            <ChevronLeft size={12} />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs transition-all translate-x-6"
                        >
                            <ChevronRightIcon size={12} />
                        </button>
                    </div>
                )}

                {/* Image Count Badge */}
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

export function DataTable<T extends { id: string | number }>({
    data,
    emptyTitle = "Registry Empty",
    emptyDescription = "No records available in this partition.",
    displayConfigs = [],
    excludeColumns = [],
    dots = {},
    badges = {},
    icons = {},
    links = {},
    images = {},
    actions = [],
    bulkActions = [],
    onSelectionChange,
    actionsFirst = true,
}: DataTableProps<T>) {
    // --- State ---
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [activeView, setActiveView] = useState<{
        data: any;
        config: DisplayConfig;
        onClose: () => void
    } | null>(null);
    const [showMoreBulkActions, setShowMoreBulkActions] = useState(false);

    // --- Column Logic ---
    const allKeys = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    useEffect(() => {
        setVisibleColumns(allKeys.filter(k => !excludeColumns.includes(k)));
    }, [allKeys, excludeColumns]);

    // --- Handlers ---
    const exportToCSV = () => {
        if (data.length === 0) return;
        const headers = visibleColumns.join(',');
        const rows = data.map(item =>
            visibleColumns.map(key => `"${(item as any)[key] ?? ''}"`).join(',')
        );
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `export_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleToggleAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
            onSelectionChange?.([]);
        } else {
            const all = new Set(data.map(i => i.id));
            setSelectedIds(all);
            onSelectionChange?.(data);
        }
    };

    const handleToggleOne = (id: string | number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
        onSelectionChange?.(data.filter(i => next.has(i.id)));
    };

    // --- Cell Renderer ---
    const renderCell = (item: T, key: string) => {
        const rawValue = (item as any)[key];
        const stringValue = String(rawValue ?? '');

        // Check if this column has an image configuration
        if (images[key]) {
            const imageValue = images[key](item);
            // Handle both single URL and array of URLs
            const imageUrls = Array.isArray(imageValue) ? imageValue : (imageValue ? [imageValue] : []);
            return <MultiImageCell images={imageUrls} alt={stringValue} />;
        }

        if (icons[key]?.[stringValue]) {
            return (
                <div className="flex items-center gap-2">
                    {icons[key][stringValue]}
                    <span className="text-xs font-bold tracking-tight text-zinc-700 dark:text-zinc-300">{stringValue}</span>
                </div>
            );
        }

        if (dots[key]?.[stringValue]) {
            const color = dots[key][stringValue];
            return (
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", {
                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]": color === 'emerald',
                        "bg-orange-600": color === 'orange',
                        "bg-blue-500": color === 'blue',
                        "bg-rose-500": color === 'rose',
                        "bg-zinc-400": color === 'zinc',
                        "bg-violet-500": color === 'violet',
                        "bg-amber-500": color === 'amber',
                    })} />
                    <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-600 dark:text-zinc-400">{stringValue}</span>
                </div>
            );
        }

        if (badges[key]?.[stringValue]) {
            const color = badges[key][stringValue];
            return (
                <Badge variant="secondary" className={cn(
                    "font-black text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border-none",
                    color === 'blue' && "bg-blue-500/10 text-blue-600",
                    color === 'orange' && "bg-orange-500/10 text-orange-600",
                    color === 'violet' && "bg-violet-500/10 text-violet-600",
                    color === 'emerald' && "bg-emerald-500/10 text-emerald-600",
                    color === 'zinc' && "bg-zinc-100 dark:bg-zinc-800 text-zinc-600",
                    color === 'rose' && "bg-rose-500/10 text-rose-600",
                    color === 'amber' && "bg-amber-500/10 text-amber-600",
                )}>
                    {stringValue}
                </Badge>
            );
        }

        if (links[key]) {
            return (
                <Link href={links[key](item)} className="text-zinc-900 text-sm dark:text-white hover:text-orange-600 font-bold flex items-center gap-1 group/link transition-all">
                    {stringValue}
                    <ChevronRight size={12} className="opacity-0 group-hover/link:opacity-100 -translate-x-1 group-hover/link:translate-x-0 transition-all" />
                </Link>
            );
        }

        return <span className="text-xs font-bold tracking-tight text-zinc-700 dark:text-zinc-300">{stringValue || '-'}</span>;
    };

    // Split bulk actions - show first 3, rest in "More" dropdown
    const visibleBulkActions = bulkActions.slice(0, 3);
    const moreBulkActions = bulkActions.slice(3);

    // --- Empty State Render ---
    if (data.length === 0) {
        return (
            <Card className="shadow-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] rounded-xl border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                        <Inbox size={20} className="text-zinc-400" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                            {emptyTitle}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                            {emptyDescription}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // --- Main Table Render ---
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && bulkActions.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-500/10 px-3 py-1.5 rounded-lg tracking-widest mr-2">
                                {selectedIds.size} Selected
                            </span>

                            {visibleBulkActions.map((action, i) => (
                                <Button
                                    key={i}
                                    variant={action.variant === 'destructive' ? "destructive" : "default"}
                                    size="sm"
                                    onClick={() => action.onClick(data.filter(d => selectedIds.has(d.id)))}
                                    className={cn(
                                        "h-6 !py-5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg",
                                        action.color && getButtonColorClasses(action.color)
                                    )}
                                >
                                    {action.icon}{action.label}
                                </Button>
                            ))}

                            {moreBulkActions.length > 0 && (
                                <DropdownMenu open={showMoreBulkActions} onOpenChange={setShowMoreBulkActions}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 !py-5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg"
                                        >
                                            More Actions <ChevronDown size={12} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl">
                                        {moreBulkActions.map((action, i) => (
                                            <DropdownMenuItem
                                                key={i}
                                                onClick={() => {
                                                    action.onClick(data.filter(d => selectedIds.has(d.id)));
                                                    setShowMoreBulkActions(false);
                                                }}
                                                className={cn(
                                                    "font-bold text-xs gap-3 py-3 px-3 cursor-pointer",
                                                    action.variant === 'destructive' && "text-rose-500"
                                                )}
                                            >
                                                {action.icon}
                                                {action.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg"
                    >
                        <Download size={14} /> Export
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg">
                                <Settings2 size={14} /> Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400 p-3 text-center">Toggle Columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allKeys.map((key) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={visibleColumns.includes(key)}
                                    onCheckedChange={(checked) => {
                                        setVisibleColumns(prev => checked ? [...prev, key] : prev.filter(k => k !== key));
                                    }}
                                    className="text-xs font-bold capitalize py-2 pr-3 pl-8 gap-0 cursor-pointer focus:bg-zinc-50 dark:focus:bg-zinc-900"
                                >
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="shadow-none border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#09090b] rounded-xl py-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="p-4 w-10 border-b border-zinc-200 dark:border-zinc-800 align-middle">
                                        <Checkbox checked={selectedIds.size === data.length} onCheckedChange={handleToggleAll} />
                                    </th>
                                    {actionsFirst && actions.length > 0 && (
                                        <th className="p-4 text-[9px] font-black uppercase text-zinc-400 tracking-[0.25em] border-b border-zinc-200 dark:border-zinc-800 align-middle">
                                            <span>Actions</span>
                                        </th>
                                    )}
                                    {visibleColumns.map(key => (
                                        <th key={key} className="p-4 text-[9px] font-black uppercase text-zinc-400 tracking-[0.25em] border-b border-zinc-200 dark:border-zinc-800 align-middle">
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </th>
                                    ))}
                                    {!actionsFirst && actions.length > 0 && (
                                        <th className="p-4 text-[9px] font-black uppercase text-zinc-400 tracking-[0.25em] border-b border-zinc-200 dark:border-zinc-800 align-middle">
                                            <span>Actions</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {data.map((item) => (
                                    <tr key={item.id} className={cn(
                                        "hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20 transition-colors group",
                                        selectedIds.has(item.id) && "bg-orange-500/[0.02]"
                                    )}>
                                        <td className="p-4 w-10 h-px align-middle border-none">
                                            <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => handleToggleOne(item.id)} />
                                        </td>
                                        {actionsFirst && actions.length > 0 && (
                                            <td className="p-4 py-3 text-left h-px align-middle border-none">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 transition-all">
                                                            <MoreVertical size={14} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-zinc-200 dark:border-zinc-800">
                                                        {displayConfigs.map((config) => (
                                                            <DropdownMenuItem
                                                                key={config.id}
                                                                onClick={() => {
                                                                    setActiveView({
                                                                        data: config.getData(item),
                                                                        config,
                                                                        onClose: () => setActiveView(null)
                                                                    });
                                                                }}
                                                                className="font-bold text-xs gap-3 py-3 px-3 cursor-pointer"
                                                            >
                                                                <div className="text-orange-600">{config.icon}</div>
                                                                {config.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {displayConfigs.length > 0 && <DropdownMenuSeparator />}
                                                        {actions.map((a, i) => (
                                                            <DropdownMenuItem
                                                                key={i}
                                                                onClick={() => a.onClick(item)}
                                                                className={cn("font-bold text-xs gap-3 py-3 px-3 cursor-pointer",
                                                                    typeof a.variant === 'function' ? a.variant(item) === 'destructive' && "text-rose-500" : a.variant === 'destructive' && "text-rose-500"
                                                                )}
                                                            >
                                                                {typeof a.icon === 'function' ? a.icon(item) : a.icon}
                                                                {typeof a.label === 'function' ? a.label(item) : a.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        )}
                                        {visibleColumns.map(key => (
                                            <td key={key} className="p-4 py-3 h-px align-middle whitespace-nowrap border-none">
                                                {renderCell(item, key)}
                                            </td>
                                        ))}
                                        {!actionsFirst && actions.length > 0 && (
                                            <td className="p-4 py-3 text-right h-px align-middle border-none">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 transition-all">
                                                            <MoreVertical size={14} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-zinc-200 dark:border-zinc-800">
                                                        {displayConfigs.map((config) => (
                                                            <DropdownMenuItem
                                                                key={config.id}
                                                                onClick={() => {
                                                                    setActiveView({
                                                                        data: config.getData(item),
                                                                        config,
                                                                        onClose: () => setActiveView(null)
                                                                    });
                                                                }}
                                                                className="font-bold text-xs gap-3 py-3 px-3 cursor-pointer"
                                                            >
                                                                <div className="text-orange-600">{config.icon}</div>
                                                                {config.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {displayConfigs.length > 0 && <DropdownMenuSeparator />}
                                                        {actions.map((a, i) => (
                                                            <DropdownMenuItem
                                                                key={i}
                                                                onClick={() => a.onClick(item)}
                                                                className={cn("font-bold text-xs gap-3 py-3 px-3 cursor-pointer",
                                                                    typeof a.variant === 'function' ? a.variant(item) === 'destructive' && "text-rose-500" : a.variant === 'destructive' && "text-rose-500"
                                                                )}
                                                            >
                                                                {typeof a.icon === 'function' ? a.icon(item) : a.icon}
                                                                {typeof a.label === 'function' ? a.label(item) : a.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic View Renderer */}
            {activeView && (() => {
                const { config, data: viewData, onClose } = activeView;
                const viewType = config.viewType || 'dialog';
                const sheetSide = config.sheetSide || 'right';
                const sheetSize = config.sheetSize || 'lg';

                if (config.component) {
                    if (viewType === 'sheet') {
                        return (
                            <CustomSheet
                                title={config.label}
                                description=""
                                side={sheetSide}
                                size={sheetSize}
                                open={!!activeView}
                                onOpenChange={(open) => !open && onClose()}
                            >
                                {config.component(viewData, onClose)}
                            </CustomSheet>
                        );
                    } else {
                        return (
                            <CustomDialog
                                title={config.label}
                                description=""
                                open={!!activeView}
                                onOpenChange={(open) => !open && onClose()}
                            >
                                {config.component(viewData, onClose)}
                            </CustomDialog>
                        );
                    }
                }

                return (
                    <CustomDialog
                        title={config.label}
                        description=""
                        open={!!activeView}
                        onOpenChange={(open) => !open && onClose()}
                    >
                        <DataDisplay data={viewData} excludeKeys={config.excludeKeys} />
                    </CustomDialog>
                );
            })()}
        </div>
    );
}