// app/dashboard/promotions/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    Plus, Edit, Trash2, Eye,
    CheckCircle, XCircle, Tag, Calendar,
    Package, Archive, FileText, Upload, RefreshCw, Loader2,
    Play, Pause, DollarSign, ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilterFromUrl';
import { CustomSortFromUrl, SortConfig } from '@/widgets/CustomSort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';
import { formatCurrency } from '@/lib/currency';
import PromotionForm from './PromotionForm';
import Link from 'next/link';

// Types
interface PromotionItem {
    variant_id: string;
    sku: string;
    product_title: string;
    quantity: number;
    original_price: number;
    is_free: boolean;
    is_available: boolean;
    current_stock?: number;
    attributes?: Record<string, string>;
}

interface PromotionImage {
    id: string;
    url: string;
    type: string;
    alt_text: string;
}

interface Promotion {
    id: string;
    name: string;
    slug: string;
    description: string;
    bundle_price: number;
    original_total: number;
    savings_amount: number;
    savings_percentage: number;
    starts_at: string;
    ends_at: string | null;
    status: string;
    items: PromotionItem[];
    free_items: PromotionItem[];
    images: PromotionImage[];
    has_stock: boolean;
    created_at: string;
    created_by?: {
        id: string;
        email: string;
    };
}

// Track loading states for individual promotions
interface LoadingState {
    [promotionId: string]: {
        delete: boolean;
        activate: boolean;
        pause: boolean;
        refreshStock: boolean;
    };
}

// Fetch promotions with pagination - directly from URL params
const fetchPromotions = async (params: {
    page: number;
    limit: number;
    search: string;
    status: string;
    sort_by: string;
    sort_order: string;
}): Promise<{
    data: {
        promotions: Promotion[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.promotions.adminList}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Bulk action mutation
const bulkPromotionAction = async (action: string, promotionIds: string[]) => {
    const response = await securityAxios.post(endpoints.promotions.bulkAction, {
        action,
        promotion_ids: promotionIds,
    });
    return response.data;
};

// Single actions
const activatePromotion = async (promotionId: string) => {
    const response = await securityAxios.post(endpoints.promotions.activate.replace(':id', promotionId));
    return response.data;
};

const pausePromotion = async (promotionId: string) => {
    const response = await securityAxios.post(endpoints.promotions.pause.replace(':id', promotionId));
    return response.data;
};

const refreshStock = async (promotionId: string) => {
    const response = await securityAxios.post(endpoints.promotions.refreshStock.replace(':id', promotionId));
    return response.data;
};

const deletePromotion = async (promotionId: string) => {
    const response = await securityAxios.delete(endpoints.promotions.delete.replace(':id', promotionId));
    return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'status',
            type: 'select',
            placeholder: 'Status',
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'ended', label: 'Ended' },
            ],
            defaultValue: '',
            width: '120px',
        },
    ],
    searchPlaceholder: 'Search by name or description...',
    showSearch: true,
    urlParamPrefix: 'promo',
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'name', label: 'Name' },
        { value: 'bundle_price', label: 'Price' },
        { value: 'starts_at', label: 'Start Date' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    urlParamPrefix: 'promo',
};

// Main content component that uses useSearchParams
function PromotionsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Track loading states for individual promotions
    const [loadingStates, setLoadingStates] = useState<LoadingState>({});

    // Track which bulk action is currently loading
    const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

    // Track refresh loading
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Build fetch params directly from URL
    const fetchParams = useMemo(() => {
        const sortBy = searchParams.get('promo_sort_by') || 'created_at';
        const sortOrder = searchParams.get('promo_sort_order') || 'desc';

        return {
            page: Number(searchParams.get('page')) || 1,
            limit: Number(searchParams.get('limit')) || 20,
            search: searchParams.get('search') || '',
            status: searchParams.get('promo_status') || '',
            sort_by: sortBy,
            sort_order: sortOrder,
        };
    }, [searchParams]);

    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        variant: 'info' | 'success' | 'error';
        onConfirm: () => void;
        itemName?: string;
    }>({
        open: false,
        title: '',
        message: '',
        variant: 'error',
        onConfirm: () => { },
    });

    // Set loading state for a specific promotion action
    const setPromotionLoading = (promotionId: string, action: keyof LoadingState[string], isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [promotionId]: {
                ...prev[promotionId],
                [action]: isLoading,
            }
        }));
    };

    // Check if any action is loading for a specific promotion
    const isPromotionLoading = (promotionId: string) => {
        const state = loadingStates[promotionId];
        if (!state) return false;
        return Object.values(state).some(isLoading => isLoading === true);
    };

    // Check if ANY action is loading globally (including bulk)
    const isAnyActionLoading = () => {
        if (activeBulkAction) return true;
        return Object.values(loadingStates).some(rowState =>
            rowState && Object.values(rowState).some(isLoading => isLoading === true)
        );
    };

    // Query for promotions
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-promotions', fetchParams],
        queryFn: () => fetchPromotions(fetchParams),
    });

    // Activate mutation
    const activateMutation = useMutation({
        mutationFn: activatePromotion,
        onSuccess: () => {
            toast.success('Promotion activated successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to activate promotion');
        },
    });

    // Pause mutation
    const pauseMutation = useMutation({
        mutationFn: pausePromotion,
        onSuccess: () => {
            toast.success('Promotion paused successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to pause promotion');
        },
    });

    // Refresh stock mutation
    const refreshStockMutation = useMutation({
        mutationFn: refreshStock,
        onSuccess: () => {
            toast.success('Stock availability refreshed');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to refresh stock');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deletePromotion,
        onSuccess: () => {
            toast.success('Promotion deleted successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete promotion');
        },
    });

    // Bulk action mutation
    const bulkActionMutation = useMutation({
        mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
            bulkPromotionAction(action, ids),
        onSuccess: (response) => {
            const { data, message } = response;
            const { success_count, failed_count } = data;
            if (success_count > 0) toast.success(message || `Processed ${success_count} promotions`);
            if (failed_count > 0) toast.error(`${failed_count} failed`);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        },
        onSettled: () => {
            setActiveBulkAction(null);
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Bulk action failed'),
    });

    // Pagination handlers - update URL
    const handlePageChange = (page: number) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleLimitChange = (limit: number) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.set('limit', limit.toString());
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Refresh handler
    const handleRefresh = async () => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        setIsRefreshing(true);
        try {
            await refetch();
            toast.success('Promotions refreshed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Single action helpers
    const handleActivate = (promotion: Promotion) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Activate Promotion',
            message: `Are you sure you want to activate "${promotion.name}"? All items must have sufficient stock.`,
            variant: 'info',
            onConfirm: () => {
                setPromotionLoading(promotion.id, 'activate', true);
                activateMutation.mutate(promotion.id, {
                    onSettled: () => {
                        setPromotionLoading(promotion.id, 'activate', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: promotion.name,
        });
    };

    const handlePause = (promotion: Promotion) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Pause Promotion',
            message: `Are you sure you want to pause "${promotion.name}"? It will no longer be available to customers.`,
            variant: 'info',
            onConfirm: () => {
                setPromotionLoading(promotion.id, 'pause', true);
                pauseMutation.mutate(promotion.id, {
                    onSettled: () => {
                        setPromotionLoading(promotion.id, 'pause', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: promotion.name,
        });
    };

    const handleRefreshStock = (promotion: Promotion) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Refresh Stock',
            message: `Refresh stock availability for "${promotion.name}"?`,
            variant: 'info',
            onConfirm: () => {
                setPromotionLoading(promotion.id, 'refreshStock', true);
                refreshStockMutation.mutate(promotion.id, {
                    onSettled: () => {
                        setPromotionLoading(promotion.id, 'refreshStock', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: promotion.name,
        });
    };

    const handleDelete = (promotion: Promotion) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Delete Promotion',
            message: `Are you sure you want to delete "${promotion.name}"? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                setPromotionLoading(promotion.id, 'delete', true);
                deleteMutation.mutate(promotion.id, {
                    onSettled: () => {
                        setPromotionLoading(promotion.id, 'delete', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: promotion.name,
        });
    };

    // Bulk actions
    const handleBulkActivate = (selectedItems: Promotion[]) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Bulk Activate Promotions',
            message: `Are you sure you want to activate ${selectedItems.length} selected promotion${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('activate');
                bulkActionMutation.mutate({ action: 'activate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkPause = (selectedItems: Promotion[]) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Bulk Pause Promotions',
            message: `Are you sure you want to pause ${selectedItems.length} selected promotion${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('pause');
                bulkActionMutation.mutate({ action: 'pause', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDelete = (selectedItems: Promotion[]) => {
        if (isAnyActionLoading()) return;

        setConfirmDialog({
            open: true,
            title: 'Bulk Delete Promotions',
            message: `Are you sure you want to delete ${selectedItems.length} selected promotion${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('delete');
                bulkActionMutation.mutate({ action: 'delete', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: Promotion[]) => {
        if (isAnyActionLoading()) return;

        const exportData = selectedItems.map(item => ({
            name: item.name,
            bundle_price: item.bundle_price,
            original_total: item.original_total,
            savings_amount: item.savings_amount,
            savings_percentage: item.savings_percentage,
            status: item.status,
            starts_at: item.starts_at,
            ends_at: item.ends_at,
            item_count: item.items.length,
            created_at: item.created_at,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promotions_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} promotions`);
    };

    // Row actions
    const getPromotionActions = (promotion: Promotion): ActionItem[] => {
        const isAnyLoading = isAnyActionLoading();
        const isRowLoading = isPromotionLoading(promotion.id);
        const isModifyDisabled = isAnyLoading;

        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingPromotion(promotion),
            color: 'blue',
            disabled: false,
        });

        if (promotion.status !== 'active') {
            actions.push({
                label: 'Edit Promotion',
                icon: <Edit size={14} />,
                onClick: () => setEditingPromotion(promotion),
                color: 'emerald',
                disabled: isModifyDisabled,
            });
        }

        if (promotion.status === 'draft' || promotion.status === 'paused') {
            actions.push({
                label: 'Activate',
                icon: <Play size={14} />,
                onClick: () => handleActivate(promotion),
                color: 'emerald',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[promotion.id]?.activate,
            });
        }

        if (promotion.status === 'active') {
            actions.push({
                label: 'Pause',
                icon: <Pause size={14} />,
                onClick: () => handlePause(promotion),
                color: 'amber',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[promotion.id]?.pause,
            });
        }

        if (promotion.status === 'active' || promotion.status === 'paused') {
            actions.push({
                label: 'Refresh Stock',
                icon: <RefreshCw size={14} />,
                onClick: () => handleRefreshStock(promotion),
                color: 'blue',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[promotion.id]?.refreshStock,
            });
        }

        if (promotion.status === 'draft' || promotion.status === 'ended') {
            actions.push({
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                onClick: () => handleDelete(promotion),
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[promotion.id]?.delete,
            });
        }

        return actions;
    };

    // Bulk actions
    const bulkActions = [
        {
            label: 'Activate Selected',
            icon: activeBulkAction === 'activate' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />,
            onClick: handleBulkActivate,
            color: 'emerald' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Pause Selected',
            icon: activeBulkAction === 'pause' ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />,
            onClick: handleBulkPause,
            color: 'amber' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Delete Selected',
            icon: activeBulkAction === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />,
            onClick: handleBulkDelete,
            color: 'rose' as const,
            variant: 'destructive' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Export Selected',
            icon: <Upload size={14} />,
            onClick: handleBulkExport,
            color: 'blue' as const,
            disabled: isAnyActionLoading(),
        },
    ];

    const promotions = data?.data?.promotions || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Promotions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage bundle deals and special offers</p>
                </div>

                <div className="flex justify-between items-center">
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
                        <Plus size={16} />
                        New Promotion
                    </Button>
                    <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                        {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </Button>
                </div>

                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading promotions: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Promotions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage bundle deals and special offers</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
                    <Plus size={16} />
                    New Promotion
                </Button>
                <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                    {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh
                </Button>
            </div>

            {/* Filters and Sort - CustomFilter and CustomSortFromUrl have their own Suspense internally */}
            <div className="flex flex-wrap gap-64 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter config={filterConfig} />
                </div>
                <CustomSortFromUrl config={sortConfig} />
            </div>

            {/* Confirmation Dialog */}
            <InfoDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                infoMessage={confirmDialog.message}
                variant={confirmDialog.variant}
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                primaryAction={confirmDialog.onConfirm}
                secondaryAction={() => setConfirmDialog({ ...confirmDialog, open: false })}
            />

            {/* Create Promotion Dialog */}
            <CustomDialog
                title="Create New Promotion"
                description="Create a bundle deal with multiple products"
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                contentWidth="max-w-[1200px]"
            >
                <PromotionForm
                    onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        refetch();
                        queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
                    }}
                />
            </CustomDialog>

            {/* Edit Promotion Dialog */}
            <CustomDialog
                title="Edit Promotion"
                description="Update promotion details"
                open={!!editingPromotion}
                onOpenChange={(open) => !open && setEditingPromotion(null)}
                contentWidth="max-w-[1200px]"
            >
                {editingPromotion && (
                    <PromotionForm
                        promotionId={editingPromotion.id}
                        onSuccess={() => {
                            setEditingPromotion(null);
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
                        }}
                        onCancel={() => setEditingPromotion(null)}
                    />
                )}
            </CustomDialog>

            {/* View Promotion Sheet */}
            <CustomSheet
                title="Promotion Details"
                description="Full promotion information"
                side="bottom"
                size="lg"
                open={!!viewingPromotion}
                onOpenChange={(open) => !open && setViewingPromotion(null)}
            >
                {viewingPromotion && (
                    <div className="space-y-6 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900 dark:text-white font-medium">{viewingPromotion.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${viewingPromotion.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    viewingPromotion.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                        viewingPromotion.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}>
                                    {viewingPromotion.status.charAt(0).toUpperCase() + viewingPromotion.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Bundle Price</label>
                                <p className="text-gray-900 dark:text-white">{formatCurrency(viewingPromotion.bundle_price)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Original Total</label>
                                <p className="text-gray-900 dark:text-white line-through">{formatCurrency(viewingPromotion.original_total)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Savings</label>
                                <p className="text-emerald-600 dark:text-emerald-400">{formatCurrency(viewingPromotion.savings_amount)} ({viewingPromotion.savings_percentage}%)</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Stock Status</label>
                                <p className={viewingPromotion.has_stock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                    {viewingPromotion.has_stock ? "In Stock" : "Out of Stock"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Start Date</label>
                                <p className="text-gray-900 dark:text-white">{new Date(viewingPromotion.starts_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">End Date</label>
                                <p className="text-gray-900 dark:text-white">{viewingPromotion.ends_at ? new Date(viewingPromotion.ends_at).toLocaleString() : 'No end date'}</p>
                            </div>
                        </div>

                        {viewingPromotion.description && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">{viewingPromotion.description}</p>
                            </div>
                        )}

                        {viewingPromotion.items.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Bundle Items</label>
                                <div className="mt-2 space-y-2">
                                    {viewingPromotion.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.product_title}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku} | Quantity: {item.quantity}</p>
                                                {item.attributes && Object.entries(item.attributes).map(([key, val]) => (
                                                    <span key={key} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded mr-1">
                                                        {key}: {val}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 dark:text-white">{formatCurrency(item.original_price)} each</p>
                                                <p className="text-sm text-gray-500">Total: {formatCurrency(item.original_price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewingPromotion.free_items.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Free Items</label>
                                <div className="mt-2 space-y-2">
                                    {viewingPromotion.free_items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.product_title}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku} | Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-600 dark:text-emerald-400">FREE</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewingPromotion.images.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Images</label>
                                <div className="flex gap-2 mt-2">
                                    {viewingPromotion.images.map((img) => (
                                        <img key={img.id} src={img.url} alt={img.alt_text} className="w-20 h-20 object-cover rounded border" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CustomSheet>

            {/* Data Table */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={promotions}
                        renderActions={(promotion: Promotion) => (
                            <ActionsDropdown
                                actions={getPromotionActions(promotion)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select promotions to activate, pause, delete, or export"
                        excludeColumns={['id', 'slug', 'description', 'items', 'free_items', 'images', 'created_by']}
                        badges={{
                            status: {
                                draft: 'zinc',
                                active: 'emerald',
                                paused: 'amber',
                                ended: 'zinc',
                            },
                        }}
                        dots={{
                            has_stock: {
                                true: 'emerald',
                                false: 'rose',
                            },
                        }}
                        links={{
                            name: (promotion: Promotion) => `/dashboard/promotions/${promotion.id}`,
                        }}
                        emptyTitle="No Promotions Found"
                        emptyDescription="Create your first promotion to start offering bundle deals."
                        onSelectionChange={(selected) => console.log('Selected promotions:', selected.length)}
                    />

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <CustomPagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                            showLimitSelector={true}
                            limitOptions={[10, 20, 50, 100]}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// Main exported component with Suspense boundary
export default function PromotionsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        }>
            <PromotionsPageContent />
        </Suspense>
    );
}
