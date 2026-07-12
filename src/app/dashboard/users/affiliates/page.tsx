// app/dashboard/users/affiliates/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
    Eye, RefreshCw, TrendingUp, DollarSign, Users,
    CheckCircle, XCircle, Upload, UserPlus, UserMinus, BarChart3, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/custom-sort/CustomSort';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { formatCurrency } from '@/lib/currency';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

// Types
interface Affiliate {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    is_active: boolean;
    email_verified: boolean;
    is_affiliate: boolean;
    created_at: string;
    last_login: string | null;
    referral_code?: string;
    discount_code?: string;
    total_earnings?: number;
    total_referrals?: number;
    active_referrals?: number;
    pending_earnings?: number;
    paid_earnings?: number;
    affiliate_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
    commission_rate?: number;
    commission_basis?: string;
    joined_affiliate_at?: string;
    last_payout_at?: string | null;
    attributed_orders_count?: number;
    attributed_sales_total?: number;
    pending_commissions_count?: number;
    accrued_commissions_count?: number;
    reversed_commissions_count?: number;
    user_is_active?: boolean;
}

interface AvailableDiscountCode {
    id: string;
    code: string;
    name: string;
    discount_type: 'percentage' | 'fixed';
    value: number;
}

interface AffiliateFilters {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: string;
    email_verified?: string;
    affiliate_level?: string;
    earnings_range?: { min: string; max: string };
    min_referrals?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface ApiErrorResponse {
    message?: string;
}

// Fetch affiliates with pagination
const fetchAffiliates = async (params?: AffiliateFilters): Promise<{
    data: {
        affiliates: Affiliate[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.is_active && params.is_active !== '') queryParams.append('is_active', params.is_active);
    if (params?.email_verified && params.email_verified !== '') queryParams.append('email_verified', params.email_verified);
    if (params?.affiliate_level && params.affiliate_level !== '') queryParams.append('affiliate_level', params.affiliate_level);
    if (params?.earnings_range?.min && params.earnings_range.min !== '') queryParams.append('min_earnings', params.earnings_range.min);
    if (params?.earnings_range?.max && params.earnings_range.max !== '') queryParams.append('max_earnings', params.earnings_range.max);
    if (params?.min_referrals && params.min_referrals !== '') queryParams.append('min_referrals', params.min_referrals);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.users.listAffiliateUsers}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Make user an affiliate
const fetchAvailableDiscountCodes = async (): Promise<AvailableDiscountCode[]> => {
    const queryParams = new URLSearchParams({
        limit: '100',
        affiliate_only: 'false',
        is_active: 'true',
    });
    const response = await securityAxios.get(`${endpoints.promotions.adminDiscountCodes}?${queryParams.toString()}`);
    return response.data.data.discount_codes || [];
};

const makeAffiliate = async ({
    email,
    discountCodeId,
    referralCode,
    commissionRate,
    commissionBasis,
}: {
    email: string;
    discountCodeId: string;
    referralCode?: string;
    commissionRate?: string;
    commissionBasis?: string;
}) => {
    const response = await securityAxios.post(endpoints.users.makeAffiliateByEmail, {
        email,
        discount_code_id: discountCodeId,
        referral_code: referralCode?.trim() || undefined,
        commission_rate: commissionRate || undefined,
        commission_basis: commissionBasis || undefined,
    });
    return response.data;
};

// Update an affiliate's commission rate/basis (future orders only)
const updateAffiliateCommission = async ({
    userId,
    commissionRate,
    commissionBasis,
}: {
    userId: string;
    commissionRate: string;
    commissionBasis: string;
}) => {
    const response = await securityAxios.put(
        endpoints.users.updateAffiliateCommission.replace(':id', userId),
        { commission_rate: commissionRate, commission_basis: commissionBasis }
    );
    return response.data;
};

const COMMISSION_BASIS_OPTIONS = [
    { value: 'sale_amount', label: 'Sale amount (order total after discount)' },
    { value: 'profit', label: 'Profit (price − cost, after discount)' },
];

const commissionBasisLabel = (basis?: string) => (basis === 'profit' ? 'profit' : 'sale amount');

// Remove affiliate status
const removeAffiliate = async (userId: string) => {
    const response = await securityAxios.post(endpoints.users.removeAffiliate.replace(':id', userId));
    return response.data;
};

// Filter configuration - ALL filters now in CustomFilter
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
            name: 'email_verified',
            type: 'select',
            placeholder: 'Email Verified',
            options: [
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Not Verified' },
            ],
            defaultValue: '',
            width: '130px',
        },
        {
            name: 'affiliate_level',
            type: 'select',
            placeholder: 'Level',
            options: [
                { value: 'bronze', label: 'Bronze' },
                { value: 'silver', label: 'Silver' },
                { value: 'gold', label: 'Gold' },
                { value: 'platinum', label: 'Platinum' },
            ],
            defaultValue: '',
            width: '110px',
        },
        {
            name: 'earnings_range',
            type: 'number_range',
            placeholder: 'Earnings',
            defaultValue: { min: '', max: '' },
            width: '220px',
            min: 0,
            step: 0.01,
        },
        {
            name: 'min_referrals',
            type: 'number',
            placeholder: 'Min Referrals',
            defaultValue: '',
            width: '130px',
            min: 0,
            step: 1,
        },
    ],
    searchPlaceholder: 'Search by name, email, or phone...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'total_earnings', label: 'Earnings' },
        { value: 'total_referrals', label: 'Referrals' },
        { value: 'joined_at', label: 'Joined Date' },
        { value: 'attributed_orders_count', label: 'Attributed Orders' },
        { value: 'attributed_sales_total', label: 'Attributed Sales' },
        { value: 'level', label: 'Level' },
    ],
    defaultSortBy: 'total_earnings',
    defaultSortOrder: 'desc',
};

export default function AffiliatesPage() {
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [viewingAffiliate, setViewingAffiliate] = useState<Affiliate | null>(null);
    const [makingAffiliate, setMakingAffiliate] = useState<{ open: boolean; user: Affiliate | null }>({ open: false, user: null });
    const [searchEmail, setSearchEmail] = useState('');
    const [selectedDiscountCodeId, setSelectedDiscountCodeId] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [commissionRate, setCommissionRate] = useState('2');
    const [commissionBasis, setCommissionBasis] = useState('sale_amount');
    const [editingCommissionFor, setEditingCommissionFor] = useState<Affiliate | null>(null);
    const [editRate, setEditRate] = useState('');
    const [editBasis, setEditBasis] = useState('sale_amount');

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters - matches the filterConfig structure
    const [appliedFilters, setAppliedFilters] = useState<{
        search: string;
        is_active: string;
        email_verified: string;
        affiliate_level: string;
        earnings_range: { min: string; max: string };
        min_referrals: string;
        sort_by: string;
        sort_order: 'asc' | 'desc';
    }>({
        search: '',
        is_active: '',
        email_verified: '',
        affiliate_level: '',
        earnings_range: { min: '', max: '' },
        min_referrals: '',
        sort_by: 'total_earnings',
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

    // Query for affiliates
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['affiliates', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchAffiliates({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    const { data: availableDiscountCodes = [], isLoading: isLoadingDiscountCodes } = useQuery({
        queryKey: ['available-affiliate-discount-codes'],
        queryFn: fetchAvailableDiscountCodes,
    });

    // Make affiliate mutation
    const makeAffiliateMutation = useMutation({
        mutationFn: makeAffiliate,
        onSuccess: () => {
            toast.success('User is now an affiliate');
            setMakingAffiliate({ open: false, user: null });
            setSearchEmail('');
            setSelectedDiscountCodeId('');
            setReferralCode('');
            setCommissionRate('2');
            setCommissionBasis('sale_amount');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
            queryClient.invalidateQueries({ queryKey: ['available-affiliate-discount-codes'] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error?.response?.data?.message || 'Failed to make user an affiliate');
        },
    });

    // Edit commission mutation (applies to future orders only)
    const updateCommissionMutation = useMutation({
        mutationFn: updateAffiliateCommission,
        onSuccess: () => {
            toast.success('Commission updated — applies to future orders');
            setEditingCommissionFor(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error?.response?.data?.message || 'Failed to update commission');
        },
    });

    // Remove affiliate mutation
    const removeAffiliateMutation = useMutation({
        mutationFn: removeAffiliate,
        onSuccess: () => {
            toast.success('Affiliate status removed');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
            queryClient.invalidateQueries({ queryKey: ['available-affiliate-discount-codes'] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error?.response?.data?.message || 'Failed to remove affiliate status');
        },
    });

    // Activate/Deactivate mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
            const response = await securityAxios.post(
                endpoints.users.toggleAffiliateStatus.replace(':id', userId),
                { is_active: isActive }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success('Affiliate status updated');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error?.response?.data?.message || 'Failed to update affiliate status');
        },
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
            email_verified: newFilters.email_verified || '',
            affiliate_level: newFilters.affiliate_level || '',
            earnings_range: newFilters.earnings_range || { min: '', max: '' },
            min_referrals: newFilters.min_referrals || '',
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

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            is_active: '',
            email_verified: '',
            affiliate_level: '',
            earnings_range: { min: '', max: '' },
            min_referrals: '',
            sort_by: 'total_earnings',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Refresh handler
    const handleRefresh = () => refetch();

    // Single action helpers with confirmation
    const handleToggleActive = (affiliate: Affiliate) => {
        const actionText = affiliate.is_active ? 'Deactivate' : 'Activate';

        setConfirmDialog({
            open: true,
            title: `${actionText} Affiliate`,
            message: `Are you sure you want to ${actionText.toLowerCase()} "${affiliate.email}"?`,
            variant: 'info',
            onConfirm: () => {
                toggleStatusMutation.mutate({ userId: affiliate.id, isActive: !affiliate.is_active });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: affiliate.email,
        });
    };

    const handleRemoveAffiliate = (affiliate: Affiliate) => {
        setConfirmDialog({
            open: true,
            title: 'Remove Affiliate Status',
            message: `Are you sure you want to remove affiliate status from "${affiliate.email}"?`,
            variant: 'error',
            onConfirm: () => {
                removeAffiliateMutation.mutate(affiliate.id);
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: affiliate.email,
        });
    };

    const handleMakeAffiliate = () => {
        const email = searchEmail.trim().toLowerCase();
        const rate = parseFloat(commissionRate);
        if (commissionRate !== '' && (isNaN(rate) || rate < 0 || rate > 100)) {
            toast.error('Commission rate must be between 0 and 100');
            return;
        }
        if (email && selectedDiscountCodeId) {
            makeAffiliateMutation.mutate({
                email,
                discountCodeId: selectedDiscountCodeId,
                referralCode,
                commissionRate,
                commissionBasis,
            });
        }
    };

    // Export affiliates
    const handleExport = (selectedItems: Affiliate[]) => {
        const exportData = selectedItems.map(item => ({
            email: item.email,
            first_name: item.first_name,
            last_name: item.last_name,
            full_name: item.full_name,
            phone: item.phone,
            is_active: item.is_active,
            email_verified: item.email_verified,
            total_earnings: item.total_earnings,
            total_referrals: item.total_referrals,
            discount_code: item.discount_code,
            commission_rate: item.commission_rate,
            attributed_orders_count: item.attributed_orders_count,
            attributed_sales_total: item.attributed_sales_total,
            affiliate_level: item.affiliate_level,
            created_at: item.created_at,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `affiliates_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} affiliates`);
    };

    // Row actions
    const getAffiliateActions = (affiliate: Affiliate): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                label: 'View Details',
                icon: <Eye size={14} />,
                onClick: () => setViewingAffiliate(affiliate),
                color: 'blue',
            },
            {
                label: affiliate.is_active ? 'Deactivate' : 'Activate',
                icon: affiliate.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
                onClick: () => handleToggleActive(affiliate),
                color: affiliate.is_active ? 'rose' : 'emerald',
            },
        ];

        if (affiliate.is_affiliate) {
            actions.push({
                label: 'Edit Commission',
                icon: <Pencil size={14} />,
                onClick: () => {
                    setEditRate(String(affiliate.commission_rate ?? 2));
                    setEditBasis(affiliate.commission_basis || 'sale_amount');
                    setEditingCommissionFor(affiliate);
                },
                color: 'violet',
            });
            actions.push({
                label: 'Remove Affiliate Status',
                icon: <UserMinus size={14} />,
                onClick: () => handleRemoveAffiliate(affiliate),
                variant: 'destructive',
                color: 'rose',
            });
        }

        return actions;
    };

    // Bulk actions
    const bulkActions = [
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleExport, color: 'blue' as const },
    ];

    const affiliates = data?.data?.affiliates || [];
    const pagination = data?.data?.pagination;
    const total = data?.data?.total || 0;

    // Stats calculations
    const totalEarnings = affiliates.reduce((sum, a) => sum + (a.total_earnings || 0), 0);
    const totalReferrals = affiliates.reduce((sum, a) => sum + (a.total_referrals || 0), 0);
    const activeCount = affiliates.filter(a => a.is_active).length;
    const avgEarnings = total > 0 ? totalEarnings / total : 0;

    // Error state - Keep UI visible
    if (isError) {
        return (
            <div className="space-y-6">
                {/* Header - Always visible */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Affiliates</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate marketers and their earnings</p>
                </div>

                {/* Stats Cards Skeleton - Show placeholder stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Buttons - Always visible */}
                <div className="flex justify-between items-center">
                    <Button className="gap-2" disabled>
                        <UserPlus size={16} />
                        Make Affiliate
                    </Button>
                    <RefreshButton onRefresh={handleRefresh} successMessage="Affiliate list refreshed" />
                </div>

                {/* Filters and Sort - Always visible */}
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                search: appliedFilters.search,
                                is_active: appliedFilters.is_active,
                                email_verified: appliedFilters.email_verified,
                                affiliate_level: appliedFilters.affiliate_level,
                                earnings_range: appliedFilters.earnings_range,
                                min_referrals: appliedFilters.min_referrals,
                            }}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </div>
                    <CustomSort
                        config={sortConfig}
                        onSortChange={handleSortChange}
                    />
                </div>

                {/* Error Message */}
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading affiliates: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Title and Description - Always visible */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Affiliates</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate marketers and their earnings</p>
            </div>

            {/* Stats Cards - Always visible (show actual stats or skeletons while loading) */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Affiliates</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEarnings)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</p>
                                <p className="text-2xl font-bold text-amber-600">{totalReferrals}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-amber-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Earnings</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgEarnings)}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Make Affiliate Button and Refresh - Always visible */}
            <div className="flex justify-between items-center">
                <Button
                    onClick={() => setMakingAffiliate({ open: true, user: null })}
                    className="gap-2"
                >
                    <UserPlus size={16} />
                    Make Affiliate
                </Button>
                <RefreshButton onRefresh={handleRefresh} successMessage="Affiliate list refreshed" />
            </div>

            {/* Filters and Sort Row - Always visible and interactive */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            is_active: appliedFilters.is_active,
                            email_verified: appliedFilters.email_verified,
                            affiliate_level: appliedFilters.affiliate_level,
                            earnings_range: appliedFilters.earnings_range,
                            min_referrals: appliedFilters.min_referrals,
                        }}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>
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

            {/* Make Affiliate Dialog */}
            <CustomDialog
                title="Make User an Affiliate"
                description="Enter the user email, choose an existing discount code, and optionally set a custom reference code."
                open={makingAffiliate.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setMakingAffiliate({ open: false, user: null });
                        setSearchEmail('');
                        setSelectedDiscountCodeId('');
                        setReferralCode('');
                    }
                }}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">User Email</label>
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter user email to make them an affiliate</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Referral Code</label>
                        <input
                            type="text"
                            placeholder="Optional custom reference code"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave blank to let the system generate one. This value must be unique and cannot match any discount code.
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Discount Code</label>
                        <select
                            value={selectedDiscountCodeId}
                            onChange={(e) => setSelectedDiscountCodeId(e.target.value)}
                            className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                        >
                            <option value="">Select a discount code</option>
                            {availableDiscountCodes.map((discountCode) => (
                                <option key={discountCode.id} value={discountCode.id}>
                                    {discountCode.code} · {discountCode.name} · {discountCode.discount_type === 'percentage' ? `${discountCode.value}%` : formatCurrency(discountCode.value)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {isLoadingDiscountCodes
                                ? 'Loading available discount codes...'
                                : 'Only active, unassigned discount codes are available for affiliate assignment.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Commission Rate (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Applies To</label>
                            <select
                                value={commissionBasis}
                                onChange={(e) => setCommissionBasis(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                            >
                                {COMMISSION_BASIS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 col-span-2">
                            The affiliate earns this percentage of each attributed order — of the sale amount, or of the profit (selling price minus cost, after the discount).
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setMakingAffiliate({ open: false, user: null });
                                setSelectedDiscountCodeId('');
                                setReferralCode('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMakeAffiliate}
                            disabled={!searchEmail || !selectedDiscountCodeId || isLoadingDiscountCodes}
                        >
                            Make Affiliate
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Edit Commission Dialog */}
            <CustomDialog
                title="Edit Commission"
                description={`Update the commission for ${editingCommissionFor?.email || ''} — applies to future orders only`}
                open={!!editingCommissionFor}
                onOpenChange={(open) => !open && setEditingCommissionFor(null)}
                contentWidth="max-w-md"
            >
                {editingCommissionFor && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Commission Rate (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={editRate}
                                    onChange={(e) => setEditRate(e.target.value)}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Applies To</label>
                                <select
                                    value={editBasis}
                                    onChange={(e) => setEditBasis(e.target.value)}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                                >
                                    {COMMISSION_BASIS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Already-recorded commissions keep their original amounts; only new orders use the updated rate and basis.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditingCommissionFor(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const rate = parseFloat(editRate);
                                    if (isNaN(rate) || rate < 0 || rate > 100) {
                                        toast.error('Commission rate must be between 0 and 100');
                                        return;
                                    }
                                    updateCommissionMutation.mutate({
                                        userId: editingCommissionFor.id,
                                        commissionRate: editRate,
                                        commissionBasis: editBasis,
                                    });
                                }}
                                disabled={updateCommissionMutation.isPending || !editRate}
                            >
                                {updateCommissionMutation.isPending ? 'Saving...' : 'Save Commission'}
                            </Button>
                        </div>
                    </div>
                )}
            </CustomDialog>

            {/* View Affiliate Details Sheet */}
            <CustomSheet
                title="Affiliate Details"
                description="Full affiliate information"
                side="bottom"
                size="lg"
                open={!!viewingAffiliate}
                onOpenChange={(open) => !open && setViewingAffiliate(null)}
            >
                {viewingAffiliate && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 dark:text-white">{viewingAffiliate.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingAffiliate.full_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Referral Code</label>
                                <p className="text-gray-900 dark:text-white font-mono">{viewingAffiliate.referral_code || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Discount Code</label>
                                <p className="text-gray-900 dark:text-white font-mono">{viewingAffiliate.discount_code || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Affiliate Level</label>
                                <p className="text-gray-900 dark:text-white capitalize">{viewingAffiliate.affiliate_level || 'Bronze'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingAffiliate.commission_rate || 0}% of {commissionBasisLabel(viewingAffiliate.commission_basis)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">
                                    {formatCurrency(viewingAffiliate.total_earnings || 0)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Referrals</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">{viewingAffiliate.total_referrals || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Attributed Orders</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">{viewingAffiliate.attributed_orders_count || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Attributed Sales</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">
                                    {formatCurrency(viewingAffiliate.attributed_sales_total || 0)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Pending Earnings</label>
                                <p className="text-amber-600">{formatCurrency(viewingAffiliate.pending_earnings || 0)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Paid Earnings</label>
                                <p className="text-emerald-600">{formatCurrency(viewingAffiliate.paid_earnings || 0)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Joined Affiliate Program</label>
                                <p>{viewingAffiliate.joined_affiliate_at ? new Date(viewingAffiliate.joined_affiliate_at).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Payout</label>
                                <p>{viewingAffiliate.last_payout_at ? new Date(viewingAffiliate.last_payout_at).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Commission States</label>
                                <p className="text-gray-900 dark:text-white">
                                    Pending {viewingAffiliate.pending_commissions_count || 0} • Accrued {viewingAffiliate.accrued_commissions_count || 0} • Reversed {viewingAffiliate.reversed_commissions_count || 0}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${viewingAffiliate.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span>{viewingAffiliate.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CustomSheet>

            {/* Data Table or Skeleton - Only this shows loading state */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={affiliates}
                        renderActions={(affiliate: Affiliate) => (
                            <ActionsDropdown
                                actions={getAffiliateActions(affiliate)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select affiliates to export"
                        excludeColumns={['id', 'full_name', 'last_login', 'joined_affiliate_at', 'pending_earnings', 'paid_earnings', 'user_is_active', 'active_referrals', 'pending_commissions_count', 'accrued_commissions_count', 'reversed_commissions_count', 'last_payout_at']}
                        dots={{
                            is_active: {
                                true: 'emerald',
                                false: 'rose',
                            },
                            email_verified: {
                                true: 'emerald',
                                false: 'amber',
                            },
                        }}
                        badges={{
                            affiliate_level: {
                                platinum: 'orange',
                                gold: 'amber',
                                silver: 'zinc',
                                bronze: 'violet',
                            },
                        }}
                        links={{
                            email: (affiliate: Affiliate) => `/dashboard/users/${affiliate.id}`,
                        }}
                        emptyTitle="No Affiliates Found"
                        emptyDescription="No affiliate marketers yet. Make your first affiliate to get started."
                        onSelectionChange={(selected) => console.log('Selected affiliates:', selected.length)}
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
