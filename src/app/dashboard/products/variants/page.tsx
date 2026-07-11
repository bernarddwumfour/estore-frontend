// app/dashboard/products/variants/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    Plus, Edit, Trash2, Eye,
    CheckCircle, XCircle, Star,
    Upload, RefreshCw, Loader2
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
import { CustomSortFromUrl, SortConfig } from '@/widgets/CustomSort/CustomSortFromUrl';
import ProductVariantForm from '../ProductVariantForm';
import Link from 'next/link';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';
import { formatCurrency } from '@/lib/currency';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilterFromUrl';

// Types
interface Variant {
    id: string;
    sku: string;
    price: number;
    discount_amount: number;
    discounted_price: number;
    stock: number;
    attributes: Record<string, string>;
    is_default: boolean;
    is_active: boolean;
    low_stock_threshold: number;
    weight?: number;
    height?: number;
    width?: number;
    depth?: number;
    images: Array<{ id: string; url: string; alt_text: string; image_type: string; order: number }>;
    product: {
        id: string;
        title: string;
        slug: string;
        status?: string;
        category?: {
            id: string;
            name: string;
        };
    };
    created_at: string;
    updated_at: string;
}

// Track loading states for individual variants
interface LoadingState {
    [variantId: string]: {
        delete: boolean;
        activate: boolean;
        deactivate: boolean;
        setDefault: boolean;
        unsetDefault: boolean;
    };
}

// Fetch variants with pagination - directly from URL params
const fetchVariants = async (params: {
    page: number;
    limit: number;
    search: string;
    is_active: string;
    is_default: string;
    in_stock: string;
    min_price: string;
    max_price: string;
    sort_by: string;
    sort_order: string;
}): Promise<{
    data: {
        variants: Variant[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.is_active) queryParams.append('is_active', params.is_active);
    if (params.is_default) queryParams.append('is_default', params.is_default);
    if (params.in_stock) queryParams.append('in_stock', params.in_stock);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.products.adminListVariants}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Single variant actions
const activateVariant = async (variantId: string) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action: 'activate',
        variant_ids: [variantId],
    });
    return response.data;
};

const deactivateVariant = async (variantId: string) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action: 'deactivate',
        variant_ids: [variantId],
    });
    return response.data;
};

const setDefaultVariant = async (variantId: string) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action: 'set_default',
        variant_ids: [variantId],
    });
    return response.data;
};

const unsetDefaultVariant = async (variantId: string) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action: 'unset_default',
        variant_ids: [variantId],
    });
    return response.data;
};

const deleteVariant = async (variantId: string) => {
    const response = await securityAxios.delete(endpoints.products.adminDeleteVariant.replace(':id', variantId));
    return response.data;
};

// Bulk action mutation
const adminBulkVariantActions = async (action: string, variantIds: string[]) => {
    const response = await securityAxios.post(endpoints.products.adminBulkVariantActions, {
        action,
        variant_ids: variantIds,
    });
    return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'is_active',
            type: 'select',
            placeholder: 'Status',
            options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
            defaultValue: '',
            width: '110px',
        },
        {
            name: 'is_default',
            type: 'select',
            placeholder: 'Default',
            options: [
                { value: 'true', label: 'Default' },
                { value: 'false', label: 'Not Default' },
            ],
            defaultValue: '',
            width: '110px',
        },
        {
            name: 'in_stock',
            type: 'select',
            placeholder: 'Stock',
            options: [
                { value: 'true', label: 'In Stock' },
                { value: 'false', label: 'Out of Stock' },
            ],
            defaultValue: '',
            width: '110px',
        },
        {
            name: 'price_range',
            type: 'number_range',
            placeholder: 'Price',
            defaultValue: { min: '', max: '' },
            width: '220px',
            min: 0,
            step: 0.01,
        },
    ],
    searchPlaceholder: 'Search by SKU or product title...',
    showSearch: true,
    urlParamPrefix: 'variant',
};

const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'price', label: 'Price' },
        { value: 'stock', label: 'Stock' },
        { value: 'sku', label: 'SKU' },
        { value: 'product_title', label: 'Product Title' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    urlParamPrefix: 'variant',
};

// Helper to parse price range from URL
const parsePriceRange = (searchParams: URLSearchParams) => {
    const priceRangeParam = searchParams.get('variant_price_range');
    if (priceRangeParam && priceRangeParam.includes('min=') && priceRangeParam.includes('max=')) {
        const params = new URLSearchParams(priceRangeParam);
        return {
            min: params.get('min') || '',
            max: params.get('max') || '',
        };
    }
    return { min: '', max: '' };
};

// Main content component that uses useSearchParams
function VariantsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for dialogs/sheets
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [viewingVariant, setViewingVariant] = useState<Variant | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Track loading states for individual variants
    const [loadingStates, setLoadingStates] = useState<LoadingState>({});

    // Track which bulk action is currently loading
    const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

    // Track refresh loading
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Build fetch params directly from URL
    const fetchParams = useMemo(() => {
        const priceRange = parsePriceRange(searchParams);

        const sortBy = searchParams.get('variant_sort_by') || 'created_at';
        const sortOrder = searchParams.get('variant_sort_order') || 'desc';

        return {
            page: Number(searchParams.get('page')) || 1,
            limit: Number(searchParams.get('limit')) || 20,
            search: searchParams.get('search') || '',
            is_active: searchParams.get('variant_is_active') || '',
            is_default: searchParams.get('variant_is_default') || '',
            in_stock: searchParams.get('variant_in_stock') || '',
            min_price: priceRange.min || '',
            max_price: priceRange.max || '',
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

    const queryClient = useQueryClient();

    // Helper function to invalidate all related queries
    const invalidateVariantQueries = () => {
        queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListVariants] });
        queryClient.invalidateQueries({ queryKey: [endpoints.products.adminListProducts] });
        queryClient.invalidateQueries({ queryKey: [endpoints.products.AdminGetProductDetails] });
    };

    // Set loading state for a specific variant action
    const setVariantLoading = (variantId: string, action: keyof LoadingState[string], isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                [action]: isLoading,
            }
        }));
    };

    // Check if any action is loading for a specific variant
    const isVariantLoading = (variantId: string) => {
        const state = loadingStates[variantId];
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

    // Query for variants - uses fetchParams directly
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: [endpoints.products.adminListVariants, fetchParams],
        queryFn: () => fetchVariants(fetchParams),
    });

    // Single action mutations
    const activateMutation = useMutation({
        mutationFn: activateVariant,
        onSuccess: () => {
            toast.success('Variant activated successfully');
            invalidateVariantQueries();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to activate variant');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateVariant,
        onSuccess: () => {
            toast.success('Variant deactivated successfully');
            invalidateVariantQueries();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to deactivate variant');
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: setDefaultVariant,
        onSuccess: () => {
            toast.success('Variant set as default successfully');
            invalidateVariantQueries();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to set variant as default');
        },
    });

    const unsetDefaultMutation = useMutation({
        mutationFn: unsetDefaultVariant,
        onSuccess: () => {
            toast.success('Default variant unset successfully');
            invalidateVariantQueries();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to unset default variant');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVariant,
        onSuccess: () => {
            toast.success('Variant deleted successfully');
            invalidateVariantQueries();
            refetch();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete variant');
        },
    });

    // Bulk action mutation
    const bulkActionMutation = useMutation({
        mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
            adminBulkVariantActions(action, ids),
        onSuccess: (response) => {
            const { data, message } = response;
            const { success_count, failed_count } = data;
            if (success_count > 0) toast.success(message || `Processed ${success_count} variants`);
            if (failed_count > 0) toast.error(`${failed_count} failed`);
            invalidateVariantQueries();
            refetch();
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
            toast.success('Variants refreshed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Single action handlers with loading states
    const handleDelete = (variant: Variant) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Delete Variant',
            message: `Are you sure you want to delete variant "${variant.sku}"? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                setVariantLoading(variant.id, 'delete', true);
                deleteMutation.mutate(variant.id, {
                    onSettled: () => {
                        setVariantLoading(variant.id, 'delete', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    const handleToggleActive = (variant: Variant) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        const action = variant.is_active ? 'deactivate' : 'activate';
        const actionText = variant.is_active ? 'Deactivate' : 'Activate';

        setConfirmDialog({
            open: true,
            title: `${actionText} Variant`,
            message: `Are you sure you want to ${actionText.toLowerCase()} variant "${variant.sku}"?`,
            variant: 'info',
            onConfirm: () => {
                if (variant.is_active) {
                    setVariantLoading(variant.id, 'deactivate', true);
                    deactivateMutation.mutate(variant.id, {
                        onSettled: () => {
                            setVariantLoading(variant.id, 'deactivate', false);
                        }
                    });
                } else {
                    setVariantLoading(variant.id, 'activate', true);
                    activateMutation.mutate(variant.id, {
                        onSettled: () => {
                            setVariantLoading(variant.id, 'activate', false);
                        }
                    });
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    const handleToggleDefault = (variant: Variant) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        const action = variant.is_default ? 'unset_default' : 'set_default';
        const actionText = variant.is_default ? 'Unset as Default' : 'Set as Default';

        setConfirmDialog({
            open: true,
            title: actionText,
            message: `Are you sure you want to ${actionText.toLowerCase()} variant "${variant.sku}"?`,
            variant: 'info',
            onConfirm: () => {
                if (variant.is_default) {
                    setVariantLoading(variant.id, 'unsetDefault', true);
                    unsetDefaultMutation.mutate(variant.id, {
                        onSettled: () => {
                            setVariantLoading(variant.id, 'unsetDefault', false);
                        }
                    });
                } else {
                    setVariantLoading(variant.id, 'setDefault', true);
                    setDefaultMutation.mutate(variant.id, {
                        onSettled: () => {
                            setVariantLoading(variant.id, 'setDefault', false);
                        }
                    });
                }
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    // Bulk actions with loading state
    const handleBulkActivate = (selectedItems: Variant[]) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Activate Variants',
            message: `Are you sure you want to activate ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('activate');
                bulkActionMutation.mutate({ action: 'activate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDeactivate = (selectedItems: Variant[]) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Deactivate Variants',
            message: `Are you sure you want to deactivate ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('deactivate');
                bulkActionMutation.mutate({ action: 'deactivate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkSetDefault = (selectedItems: Variant[]) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Set as Default',
            message: `Are you sure you want to set ${selectedItems.length} variant${selectedItems.length !== 1 ? 's' : ''} as default? Note: Only one variant per product can be default.`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('set_default');
                bulkActionMutation.mutate({ action: 'set_default', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDelete = (selectedItems: Variant[]) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Delete Variants',
            message: `Are you sure you want to delete ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('delete');
                bulkActionMutation.mutate({ action: 'delete', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: Variant[]) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }

        const exportData = selectedItems.map(item => ({
            sku: item.sku,
            product: item.product.title,
            price: item.price,
            discounted_price: item.discounted_price,
            stock: item.stock,
            is_default: item.is_default,
            is_active: item.is_active,
            attributes: item.attributes,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `variants_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} variants`);
    };

    // Row actions
    const getVariantActions = (variant: Variant): ActionItem[] => {
        const isAnyLoading = isAnyActionLoading();
        const isRowLoading = isVariantLoading(variant.id);
        const isModifyDisabled = isAnyLoading;

        return [
            {
                label: 'View Details',
                icon: <Eye size={14} />,
                onClick: () => setViewingVariant(variant),
                color: 'blue',
                disabled: false,
            },
            {
                label: 'Edit Variant',
                icon: <Edit size={14} />,
                onClick: () => setEditingVariant(variant),
                color: 'emerald',
                disabled: isModifyDisabled,
            },
            {
                label: variant.is_active ? 'Deactivate' : 'Activate',
                icon: variant.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
                onClick: () => handleToggleActive(variant),
                color: variant.is_active ? 'rose' : 'emerald',
                disabled: isModifyDisabled,
                loading: isRowLoading && (loadingStates[variant.id]?.activate || loadingStates[variant.id]?.deactivate),
            },
            {
                label: variant.is_default ? 'Unset as Default' : 'Set as Default',
                icon: <Star size={14} />,
                onClick: () => handleToggleDefault(variant),
                color: 'amber',
                disabled: isModifyDisabled,
                loading: isRowLoading && (loadingStates[variant.id]?.setDefault || loadingStates[variant.id]?.unsetDefault),
            },
            {
                label: 'Delete Variant',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                onClick: () => handleDelete(variant),
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[variant.id]?.delete,
            },
        ];
    };

    // Bulk actions
    const bulkActions = [
        {
            label: 'Activate Selected',
            icon: activeBulkAction === 'activate' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />,
            onClick: handleBulkActivate,
            color: 'emerald' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Deactivate Selected',
            icon: activeBulkAction === 'deactivate' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />,
            onClick: handleBulkDeactivate,
            color: 'rose' as const,
            variant: 'destructive' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Set as Default',
            icon: activeBulkAction === 'set_default' ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />,
            onClick: handleBulkSetDefault,
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

    const variants = data?.data?.variants || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Product Variants</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage all product variants across your catalog</p>
                </div>

                <div className="flex justify-between items-center">
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
                        <Plus size={16} />
                        New Variant
                    </Button>
                    <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                        {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </Button>
                </div>

                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading variants: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Product Variants</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage all product variants across your catalog</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" disabled={isAnyActionLoading()}>
                    <Plus size={16} />
                    New Variant
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

            {/* Create Variant Dialog */}
            <CustomDialog
                title="Create New Variant"
                description="Add a new product variant"
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                contentWidth="max-w-[1200px]"
            >
                <ProductVariantForm
                    onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        invalidateVariantQueries();
                        refetch();
                    }}
                />
            </CustomDialog>

            {/* Edit Variant Dialog */}
            <CustomDialog
                title="Edit Variant"
                description="Update variant details"
                open={!!editingVariant}
                onOpenChange={(open) => !open && setEditingVariant(null)}
                contentWidth="max-w-[1200px]"
            >
                {editingVariant && (
                    <ProductVariantForm
                        variantId={editingVariant.id}
                        productId={editingVariant.product.id}
                        onSuccess={() => {
                            setEditingVariant(null);
                            invalidateVariantQueries();
                            refetch();
                        }}
                        onCancel={() => setEditingVariant(null)}
                    />
                )}
            </CustomDialog>

            {/* View Variant Sheet */}
            <CustomSheet
                title="Variant Details"
                description="Full variant information"
                side="bottom"
                size="lg"
                open={!!viewingVariant}
                onOpenChange={(open) => !open && setViewingVariant(null)}
            >
                {viewingVariant && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">SKU</label>
                                <p className="text-gray-900 dark:text-white font-mono">{viewingVariant.sku}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Product</label>
                                <Link href={`/dashboard/products/${viewingVariant.product.slug}`} className="text-blue-600 hover:underline">
                                    {viewingVariant.product.title}
                                </Link>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Price</label>
                                <p className="text-gray-900 dark:text-white">{formatCurrency(viewingVariant.price)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Discounted Price</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingVariant.discounted_price ? formatCurrency(viewingVariant.discounted_price) : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Stock</label>
                                <p className="text-gray-900 dark:text-white">{viewingVariant.stock}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingVariant.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Default Variant</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingVariant.is_default ? 'Yes' : 'No'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Attributes</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(viewingVariant.attributes).map(([key, value]) => (
                                        <span key={key} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {viewingVariant.images && viewingVariant.images.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Images</label>
                                <div className="flex gap-2 mt-2">
                                    {viewingVariant.images.map((img) => (
                                        <img key={img.id} src={img.url} alt={img.alt_text} className="w-16 h-16 object-cover rounded border" />
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
                        data={variants}
                        renderActions={(variant: Variant) => (
                            <ActionsDropdown
                                actions={getVariantActions(variant)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select variants to activate, deactivate, set as default, delete or export"
                        excludeColumns={['id', 'discount_amount', 'created_at', 'updated_at', 'weight', 'height', 'width', 'depth', 'low_stock_threshold', 'attributes']}
                        images={{
                            images: (variant: Variant) => {
                                if (variant.images && variant.images.length > 0) {
                                    return variant.images.map(img => img.url);
                                }
                                return [];
                            }
                        }}
                        dots={{
                            is_active: {
                                true: 'emerald',
                                false: 'rose',
                            },
                            is_default: {
                                true: 'amber',
                                false: 'zinc',
                            },
                        }}
                        badges={{
                            is_active: {
                                true: 'emerald',
                                false: 'rose',
                            },
                            is_default: {
                                true: 'amber',
                                false: 'zinc',
                            },
                        }}
                        links={{
                            sku: (variant: Variant) => `/dashboard/products/variants/${variant.id}`,
                            product_name: (variant: Variant) => `/dashboard/products/${variant.product.slug}`,
                        }}
                        arrays={{
                            attributes: { maxItems: 3 }
                        }}
                        emptyTitle="No Variants Found"
                        emptyDescription="Create your first variant to get started."
                        onSelectionChange={(selected) => console.log('Selected variants:', selected.length)}
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
export default function VariantsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        }>
            <VariantsPageContent />
        </Suspense>
    );
}
