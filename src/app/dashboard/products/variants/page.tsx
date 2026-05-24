// app/dashboard/products/variants/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Plus, Edit, Trash2, Eye,
    CheckCircle, XCircle, Star,
    Package, Archive, FileText, Upload, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import ProductVariantForm from '../ProductVariantForm';
import Link from 'next/link';

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

// Fetch variants with pagination
const fetchVariants = async (params?: any): Promise<{
    data: {
        variants: Variant[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.is_active && params.is_active !== '') queryParams.append('is_active', params.is_active);
    if (params?.is_default && params.is_default !== '') queryParams.append('is_default', params.is_default);
    if (params?.in_stock && params.in_stock !== '') queryParams.append('in_stock', params.in_stock);
    if (params?.min_price && params.min_price !== '') queryParams.append('min_price', params.min_price);
    if (params?.max_price && params.max_price !== '') queryParams.append('max_price', params.max_price);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.products.listVariants}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Bulk action mutation
const bulkVariantAction = async (action: string, variantIds: string[]) => {
    const response = await securityAxios.post(endpoints.products.bulkVariantAction, {
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
    ],
    searchPlaceholder: 'Search by SKU or product title...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'price', label: 'Price' },
        { value: 'stock', label: 'Stock' },
        { value: 'sku_asc', label: 'SKU' },
        { value: 'product_title_asc', label: 'Product Title' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

export default function VariantsPage() {
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [viewingVariant, setViewingVariant] = useState<Variant | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Filter and pagination state - NO filters on initial load
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        is_active: '',
        is_default: '',
        in_stock: '',
        min_price: '',
        max_price: '',
        sort_by: 'created_at',
        sort_order: 'desc',
    });

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

    // Query for variants
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-variants', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchVariants({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (variantId: string) => {
            const response = await securityAxios.delete(endpoints.products.deleteVariant.replace(':id', variantId));
            return response.data;
        },
        onSuccess: () => {
            toast.success('Variant deleted successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete variant');
        },
    });

    // Bulk action mutation
    const bulkActionMutation = useMutation({
        mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
            bulkVariantAction(action, ids),
        onSuccess: (response) => {
            const { data, message } = response;
            const { success_count, failed_count } = data;
            if (success_count > 0) toast.success(message || `Processed ${success_count} variants`);
            if (failed_count > 0) toast.error(`${failed_count} failed`);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Bulk action failed'),
    });

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    const handleLimitChange = (limit: number) => {
        setFilters({ page: 1, limit });
    };

    // Handle filter changes from CustomFilter
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            ...appliedFilters,
            search: newFilters.search || '',
            is_active: newFilters.is_active || '',
            is_default: newFilters.is_default || '',
            in_stock: newFilters.in_stock || '',
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle price filter changes
    const handlePriceChange = (field: string, value: string) => {
        setAppliedFilters({
            ...appliedFilters,
            [field]: value,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle sort changes from CustomSort
    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setAppliedFilters({
            ...appliedFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Refresh handler
    const handleRefresh = () => {
        refetch();
        toast.success('Variants refreshed');
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            is_active: '',
            is_default: '',
            in_stock: '',
            min_price: '',
            max_price: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Single action helpers with confirmation
    const handleDelete = (variant: Variant) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Variant',
            message: `Are you sure you want to delete variant "${variant.sku}"? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                deleteMutation.mutate(variant.id);
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    const handleToggleActive = (variant: Variant) => {
        const action = variant.is_active ? 'deactivate' : 'activate';
        const actionText = variant.is_active ? 'Deactivate' : 'Activate';

        setConfirmDialog({
            open: true,
            title: `${actionText} Variant`,
            message: `Are you sure you want to ${actionText.toLowerCase()} variant "${variant.sku}"?`,
            variant: 'info',
            onConfirm: () => {
                bulkActionMutation.mutate({ action, ids: [variant.id] });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    const handleToggleDefault = (variant: Variant) => {
        const action = variant.is_default ? 'unset_default' : 'set_default';
        const actionText = variant.is_default ? 'Unset as Default' : 'Set as Default';

        setConfirmDialog({
            open: true,
            title: actionText,
            message: `Are you sure you want to ${actionText.toLowerCase()} variant "${variant.sku}"?`,
            variant: 'info',
            onConfirm: () => {
                bulkActionMutation.mutate({ action, ids: [variant.id] });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: variant.sku,
        });
    };

    // Bulk actions with confirmation
    const handleBulkActivate = (selectedItems: Variant[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Activate Variants',
            message: `Are you sure you want to activate ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'activate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDeactivate = (selectedItems: Variant[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Deactivate Variants',
            message: `Are you sure you want to deactivate ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'deactivate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkSetDefault = (selectedItems: Variant[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Set as Default',
            message: `Are you sure you want to set ${selectedItems.length} variant${selectedItems.length !== 1 ? 's' : ''} as default? Note: Only one variant per product can be default.`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'set_default', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDelete = (selectedItems: Variant[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Delete Variants',
            message: `Are you sure you want to delete ${selectedItems.length} selected variant${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'delete', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: Variant[]) => {
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
    const getVariantActions = (variant: Variant): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingVariant(variant),
            color: 'blue',
        },
        {
            label: 'Edit Variant',
            icon: <Edit size={14} />,
            onClick: () => setEditingVariant(variant),
            color: 'emerald',
        },
        {
            label: variant.is_active ? 'Deactivate' : 'Activate',
            icon: variant.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
            onClick: () => handleToggleActive(variant),
            color: variant.is_active ? 'rose' : 'emerald',
        },
        {
            label: variant.is_default ? 'Unset as Default' : 'Set as Default',
            icon: <Star size={14} />,
            onClick: () => handleToggleDefault(variant),
            color: 'amber',
        },
        {
            label: 'Delete Variant',
            icon: <Trash2 size={14} />,
            variant: 'destructive',
            onClick: () => handleDelete(variant),
        },
    ];

    // Bulk actions
    const bulkActions = [
        { label: 'Activate Selected', icon: <CheckCircle size={14} />, onClick: handleBulkActivate, color: 'emerald' as const },
        { label: 'Deactivate Selected', icon: <XCircle size={14} />, onClick: handleBulkDeactivate, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Set as Default', icon: <Star size={14} />, onClick: handleBulkSetDefault, color: 'amber' as const },
        { label: 'Delete Selected', icon: <Trash2 size={14} />, onClick: handleBulkDelete, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'blue' as const },
    ];

    const variants = data?.data?.variants || [];
    const pagination = data?.data?.pagination;

    if (isLoading && !variants.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error loading variants: {error?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Title and Description */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Product Variants</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage all product variants across your catalog</p>
            </div>

            {/* New Variant Button and Refresh */}
            <div className="flex justify-between items-center">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus size={16} />
                    New Variant
                </Button>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Filters and Sort Row - All on one line */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex flex-wrap gap-4 items-center flex-1">
                    {/* Custom Filter Component */}
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            is_active: appliedFilters.is_active,
                            is_default: appliedFilters.is_default,
                            in_stock: appliedFilters.in_stock,
                        }}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />

                    {/* Price Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={appliedFilters.min_price}
                            onChange={(e) => handlePriceChange('min_price', e.target.value)}
                            className="w-28 h-9 border-gray-300 dark:border-gray-700"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={appliedFilters.max_price}
                            onChange={(e) => handlePriceChange('max_price', e.target.value)}
                            className="w-28 h-9 border-gray-300 dark:border-gray-700"
                        />
                    </div>
                </div>

                {/* Sort Component */}
                <CustomSort
                    config={sortConfig}
                    onSortChange={handleSortChange}
                />
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
                        refetch();
                        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                        queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
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
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                            queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
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
                                <p className="text-gray-900 dark:text-white">${viewingVariant.price.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Discounted Price</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingVariant.discounted_price ? `$${viewingVariant.discounted_price.toFixed(2)}` : '-'}
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
            <DataTable
                data={variants.map(v => {
                    const { sku, images, ...rest } = v;
                    return { sku: v.sku, product_name: v.product.title, images: v.images, ...rest };
                })}
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
        </div>
    );
}