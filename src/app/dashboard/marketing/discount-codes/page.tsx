'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, Pencil, Plus, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { formatCurrency } from '@/lib/currency';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { CustomFilter, type FilterConfig } from '@/widgets/custom-filter/CustomFilter';
import { CustomPagination, type PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomSort, type SortConfig } from '@/widgets/custom-sort/CustomSort';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

interface DiscountCode {
    id: string;
    code: string;
    name: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
    min_subtotal: number;
    max_discount_amount: number | null;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    is_affiliate_code: boolean;
    affiliate: {
        id: string;
        email: string;
        referral_code: string;
    } | null;
    affiliate_email?: string | null;
    affiliate_referral_code?: string | null;
    created_by: {
        id: string;
        email: string;
    } | null;
    created_at: string;
    updated_at: string;
}

interface DiscountCodePayload {
    code: string;
    name: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    value: string;
    min_subtotal: string;
    max_discount_amount: string;
    is_active: boolean;
    starts_at: string;
    ends_at: string;
}

const normalizeDiscountCode = (discountCode: DiscountCode): DiscountCode => ({
    ...discountCode,
    affiliate_email: discountCode.affiliate?.email || null,
    affiliate_referral_code: discountCode.affiliate?.referral_code || null,
});

const fetchDiscountCodes = async (params?: any): Promise<{
    data: {
        discount_codes: DiscountCode[];
        total: number;
        pagination: PaginationMeta;
    };
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    if (params?.affiliate_only) queryParams.append('affiliate_only', params.affiliate_only);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const response = await securityAxios.get(
        `${endpoints.promotions.adminDiscountCodes}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    return {
        ...response.data,
        data: {
            ...response.data.data,
            discount_codes: (response.data.data.discount_codes || []).map(normalizeDiscountCode),
        },
    };
};

const createDiscountCode = async (payload: Record<string, any>) => {
    const response = await securityAxios.post(endpoints.promotions.adminDiscountCodeCreate, payload);
    return response.data;
};

const updateDiscountCode = async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
    const response = await securityAxios.put(
        endpoints.promotions.adminDiscountCodeUpdate.replace(':id', id),
        payload
    );
    return response.data;
};

const toggleDiscountCodeStatus = async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const response = await securityAxios.post(
        endpoints.promotions.adminDiscountCodeStatus.replace(':id', id),
        { is_active: isActive }
    );
    return response.data;
};

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
            width: '120px',
        },
        {
            name: 'affiliate_only',
            type: 'select',
            placeholder: 'Code Type',
            options: [
                { value: 'true', label: 'Affiliate Codes' },
                { value: 'false', label: 'Direct Discounts' },
            ],
            defaultValue: '',
            width: '140px',
        },
    ],
    searchPlaceholder: 'Search by code, name, or affiliate email...',
    showSearch: true,
};

const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'code', label: 'Code' },
        { value: 'value', label: 'Discount Value' },
        { value: 'min_subtotal', label: 'Minimum Subtotal' },
        { value: 'is_active', label: 'Status' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

const emptyPayload: DiscountCodePayload = {
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    value: '',
    min_subtotal: '0',
    max_discount_amount: '',
    is_active: true,
    starts_at: '',
    ends_at: '',
};

const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

function DiscountCodeForm({
    discountCode,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    discountCode?: DiscountCode | null;
    onSubmit: (payload: Record<string, any>) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<DiscountCodePayload>(emptyPayload);

    useEffect(() => {
        if (!discountCode) {
            setForm(emptyPayload);
            return;
        }

        setForm({
            code: discountCode.code,
            name: discountCode.name,
            description: discountCode.description || '',
            discount_type: discountCode.discount_type,
            value: String(discountCode.value),
            min_subtotal: String(discountCode.min_subtotal),
            max_discount_amount: discountCode.max_discount_amount !== null ? String(discountCode.max_discount_amount) : '',
            is_active: discountCode.is_active,
            starts_at: toDateTimeLocal(discountCode.starts_at),
            ends_at: toDateTimeLocal(discountCode.ends_at),
        });
    }, [discountCode]);

    const updateField = (field: keyof DiscountCodePayload, value: string | boolean) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit({
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            description: form.description.trim(),
            discount_type: form.discount_type,
            value: form.value,
            min_subtotal: form.min_subtotal || '0',
            max_discount_amount: form.max_discount_amount,
            is_active: form.is_active,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : '',
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : '',
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                    <input
                        value={form.code}
                        onChange={(e) => updateField('code', e.target.value)}
                        disabled={discountCode?.is_affiliate_code}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</label>
                    <select
                        value={form.discount_type}
                        onChange={(e) => updateField('discount_type', e.target.value as 'percentage' | 'fixed')}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.value}
                        onChange={(e) => updateField('value', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Subtotal</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.min_subtotal}
                        onChange={(e) => updateField('min_subtotal', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.max_discount_amount}
                        onChange={(e) => updateField('max_discount_amount', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Starts At</label>
                    <input
                        type="datetime-local"
                        value={form.starts_at}
                        onChange={(e) => updateField('starts_at', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ends At</label>
                    <input
                        type="datetime-local"
                        value={form.ends_at}
                        onChange={(e) => updateField('ends_at', e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                />
                Active
            </label>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : discountCode ? 'Update Code' : 'Create Code'}
                </Button>
            </div>
        </div>
    );
}

export default function DiscountCodesPage() {
    const queryClient = useQueryClient();
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
    const [viewingCode, setViewingCode] = useState<DiscountCode | null>(null);
    const [creatingCode, setCreatingCode] = useState(false);
    const [filters, setFilters] = useState({ page: 1, limit: 20 });
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        is_active: '',
        affiliate_only: '',
        sort_by: 'created_at',
        sort_order: 'desc',
    });
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['discount-codes', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchDiscountCodes({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    const createMutation = useMutation({
        mutationFn: createDiscountCode,
        onSuccess: () => {
            toast.success('Discount code created');
            setCreatingCode(false);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create discount code');
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateDiscountCode,
        onSuccess: () => {
            toast.success('Discount code updated');
            setEditingCode(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update discount code');
        },
    });

    const toggleMutation = useMutation({
        mutationFn: toggleDiscountCodeStatus,
        onSuccess: () => {
            toast.success('Discount code status updated');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update code status');
        },
    });

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters((current) => ({
            ...current,
            search: newFilters.search || '',
            is_active: newFilters.is_active || '',
            affiliate_only: newFilters.affiliate_only || '',
        }));
        setFilters((current) => ({ ...current, page: 1 }));
    };

    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setAppliedFilters((current) => ({
            ...current,
            sort_by: sortBy,
            sort_order: sortOrder,
        }));
        setFilters((current) => ({ ...current, page: 1 }));
    };

    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            is_active: '',
            affiliate_only: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters((current) => ({ ...current, page: 1 }));
    };

    const handleRefresh = () => refetch();

    const handleCreate = (payload: Record<string, any>) => {
        createMutation.mutate(payload);
    };

    const handleUpdate = (payload: Record<string, any>) => {
        if (!editingCode) return;
        updateMutation.mutate({ id: editingCode.id, payload });
    };

    const handleToggle = (discountCode: DiscountCode) => {
        const nextStatus = !discountCode.is_active;
        setConfirmDialog({
            open: true,
            title: `${nextStatus ? 'Activate' : 'Deactivate'} Discount Code`,
            message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} ${discountCode.code}?`,
            onConfirm: () => {
                toggleMutation.mutate({ id: discountCode.id, isActive: nextStatus });
                setConfirmDialog((current) => ({ ...current, open: false }));
            },
        });
    };

    const getActions = (discountCode: DiscountCode): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingCode(discountCode),
            color: 'blue',
        },
        {
            label: 'Edit Code',
            icon: <Pencil size={14} />,
            onClick: () => setEditingCode(discountCode),
            color: 'violet',
        },
        {
            label: discountCode.is_active ? 'Deactivate' : 'Activate',
            icon: discountCode.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
            onClick: () => handleToggle(discountCode),
            color: discountCode.is_active ? 'rose' : 'emerald',
        },
    ];

    const discountCodes = data?.data?.discount_codes || [];
    const pagination = data?.data?.pagination;
    const total = data?.data?.total || 0;
    const activeCount = discountCodes.filter((discountCode) => discountCode.is_active).length;
    const affiliateCount = discountCodes.filter((discountCode) => discountCode.is_affiliate_code).length;

    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Discount Codes</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage checkout discounts and affiliate codes.</p>
                </div>
                <div className="flex justify-between items-center">
                    <Button onClick={() => setCreatingCode(true)} className="gap-2">
                        <Plus size={16} />
                        New Code
                    </Button>
                    <RefreshButton onRefresh={handleRefresh} successMessage="Discount codes refreshed" />
                </div>
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                search: appliedFilters.search,
                                is_active: appliedFilters.is_active,
                                affiliate_only: appliedFilters.affiliate_only,
                            }}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </div>
                    <CustomSort config={sortConfig} onSortChange={handleSortChange} />
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading discount codes: {(error as Error)?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Discount Codes</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage checkout discounts and affiliate codes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Codes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Codes</p>
                    <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Affiliate Codes</p>
                    <p className="text-2xl font-bold text-violet-600">{affiliateCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Button onClick={() => setCreatingCode(true)} className="gap-2">
                    <Plus size={16} />
                    New Code
                </Button>
                <RefreshButton onRefresh={handleRefresh} successMessage="Discount codes refreshed" />
            </div>

            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            is_active: appliedFilters.is_active,
                            affiliate_only: appliedFilters.affiliate_only,
                        }}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>
                <CustomSort config={sortConfig} onSortChange={handleSortChange} />
            </div>

            <InfoDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((current) => ({ ...current, open }))}
                title={confirmDialog.title}
                infoMessage={confirmDialog.message}
                variant="info"
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                primaryAction={confirmDialog.onConfirm}
                secondaryAction={() => setConfirmDialog((current) => ({ ...current, open: false }))}
            />

            <CustomDialog
                title="Create Discount Code"
                description="Create a checkout discount code for direct promotions."
                open={creatingCode}
                onOpenChange={(open) => !open && setCreatingCode(false)}
                contentWidth="max-w-3xl"
            >
                <DiscountCodeForm
                    onSubmit={handleCreate}
                    onCancel={() => setCreatingCode(false)}
                    isSubmitting={createMutation.isPending}
                />
            </CustomDialog>

            <CustomDialog
                title={`Edit ${editingCode?.code || 'Discount Code'}`}
                description="Update the discount code settings."
                open={!!editingCode}
                onOpenChange={(open) => !open && setEditingCode(null)}
                contentWidth="max-w-3xl"
            >
                <DiscountCodeForm
                    discountCode={editingCode}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingCode(null)}
                    isSubmitting={updateMutation.isPending}
                />
            </CustomDialog>

            <CustomSheet
                title="Discount Code Details"
                description="Review the current discount and affiliate attribution settings."
                side="bottom"
                size="lg"
                open={!!viewingCode}
                onOpenChange={(open) => !open && setViewingCode(null)}
            >
                {viewingCode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Code</label>
                            <p className="text-gray-900 dark:text-white font-mono">{viewingCode.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Type</label>
                            <p className="text-gray-900 dark:text-white capitalize">{viewingCode.discount_type}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Value</label>
                            <p className="text-gray-900 dark:text-white">
                                {viewingCode.discount_type === 'percentage'
                                    ? `${viewingCode.value}%`
                                    : formatCurrency(viewingCode.value)}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Minimum Subtotal</label>
                            <p className="text-gray-900 dark:text-white">{formatCurrency(viewingCode.min_subtotal)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Max Discount</label>
                            <p className="text-gray-900 dark:text-white">
                                {viewingCode.max_discount_amount !== null ? formatCurrency(viewingCode.max_discount_amount) : 'No cap'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Code Class</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.is_affiliate_code ? 'Affiliate Code' : 'Direct Discount'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Affiliate Email</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.affiliate_email || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Referral Code</label>
                            <p className="text-gray-900 dark:text-white font-mono">{viewingCode.affiliate_referral_code || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Starts At</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.starts_at ? new Date(viewingCode.starts_at).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Ends At</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.ends_at ? new Date(viewingCode.ends_at).toLocaleString() : '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-gray-900 dark:text-white">{viewingCode.description || '-'}</p>
                        </div>
                    </div>
                )}
            </CustomSheet>

            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={discountCodes}
                        renderActions={(discountCode: DiscountCode) => (
                            <ActionsDropdown
                                actions={getActions(discountCode)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        excludeColumns={['id', 'description', 'affiliate', 'created_by', 'updated_at']}
                        dots={{
                            is_active: {
                                true: 'emerald',
                                false: 'rose',
                            },
                            is_affiliate_code: {
                                true: 'violet',
                                false: 'blue',
                            },
                        }}
                        badges={{
                            discount_type: {
                                percentage: 'blue',
                                fixed: 'amber',
                            },
                        }}
                        emptyTitle="No Discount Codes"
                        emptyDescription="Create a discount code to enable checkout promotions."
                    />

                    {pagination && pagination.total_pages > 1 && (
                        <CustomPagination
                            pagination={pagination}
                            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                            onLimitChange={(limit) => setFilters({ page: 1, limit })}
                            showLimitSelector={true}
                            limitOptions={[10, 20, 50, 100]}
                        />
                    )}
                </>
            )}
        </div>
    );
}
