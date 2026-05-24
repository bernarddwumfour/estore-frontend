// app/dashboard/users/affiliates/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Eye, RefreshCw, TrendingUp, DollarSign, Users,
    CheckCircle, XCircle, Star, Trophy, Award,
    Calendar, Mail, Phone, Upload, Link as LinkIcon,
    CreditCard, Wallet, BarChart3, UserPlus, UserMinus
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
import Link from 'next/link';

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
    total_earnings?: number;
    total_referrals?: number;
    pending_earnings?: number;
    paid_earnings?: number;
    affiliate_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
    joined_affiliate_at?: string;
}

// Fetch affiliates with pagination
const fetchAffiliates = async (params?: any): Promise<{
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
    if (params?.min_earnings) queryParams.append('min_earnings', params.min_earnings);
    if (params?.max_earnings) queryParams.append('max_earnings', params.max_earnings);
    if (params?.min_referrals) queryParams.append('min_referrals', params.min_referrals);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.users.listAffiliateUsers}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Make user an affiliate
const makeAffiliate = async (userId: string) => {
    const response = await securityAxios.post(endpoints.users.makeAffiliate.replace(':id', userId));
    return response.data;
};

// Remove affiliate status
const removeAffiliate = async (userId: string) => {
    const response = await securityAxios.post(endpoints.users.removeAffiliate.replace(':id', userId));
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
    ],
    searchPlaceholder: 'Search by name, email, or phone...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'total_earnings', label: 'Earnings' },
        { value: 'total_referrals', label: 'Referrals' },
        { value: 'created_at', label: 'Joined Date' },
        { value: 'email', label: 'Email' },
        { value: 'first_name', label: 'First Name' },
    ],
    defaultSortBy: 'total_earnings',
    defaultSortOrder: 'desc',
};

export default function AffiliatesPage() {
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [viewingAffiliate, setViewingAffiliate] = useState<Affiliate | null>(null);
    const [makingAffiliate, setMakingAffiliate] = useState<{ open: boolean; user: Affiliate | null }>({ open: false, user: null });

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        is_active: '',
        email_verified: '',
        affiliate_level: '',
        min_earnings: '',
        max_earnings: '',
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

    // Make affiliate mutation
    const makeAffiliateMutation = useMutation({
        mutationFn: makeAffiliate,
        onSuccess: () => {
            toast.success('User is now an affiliate');
            setMakingAffiliate({ open: false, user: null });
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to make user an affiliate');
        },
    });

    // Remove affiliate mutation
    const removeAffiliateMutation = useMutation({
        mutationFn: removeAffiliate,
        onSuccess: () => {
            toast.success('Affiliate status removed');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to remove affiliate status');
        },
    });

    // Activate/Deactivate mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
            const response = await securityAxios.post(endpoints.users.activateOrDeactivate.replace(':id', userId));
            return response.data;
        },
        onSuccess: () => {
            toast.success('Affiliate status updated');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['affiliates'] });
        },
        onError: (error: any) => {
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

    // Handle filter changes
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            ...appliedFilters,
            search: newFilters.search || '',
            is_active: newFilters.is_active || '',
            email_verified: newFilters.email_verified || '',
            affiliate_level: newFilters.affiliate_level || '',
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle earnings filter changes
    const handleEarningsChange = (field: string, value: string) => {
        setAppliedFilters({
            ...appliedFilters,
            [field]: value,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle referrals filter changes
    const handleReferralsChange = (value: string) => {
        setAppliedFilters({
            ...appliedFilters,
            min_referrals: value,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle sort changes
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
        toast.success('Affiliate list refreshed');
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            is_active: '',
            email_verified: '',
            affiliate_level: '',
            min_earnings: '',
            max_earnings: '',
            min_referrals: '',
            sort_by: 'total_earnings',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

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
        if (makingAffiliate.user) {
            makeAffiliateMutation.mutate(makingAffiliate.user.id);
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

    // Stats
    const totalEarnings = affiliates.reduce((sum, a) => sum + (a.total_earnings || 0), 0);
    const totalReferrals = affiliates.reduce((sum, a) => sum + (a.total_referrals || 0), 0);
    const activeCount = affiliates.filter(a => a.is_active).length;

    // Affiliate level colors
    const getLevelColor = (level?: string) => {
        switch (level) {
            case 'platinum': return 'purple';
            case 'gold': return 'amber';
            case 'silver': return 'gray';
            default: return 'zinc';
        }
    };

    if (isLoading && !affiliates.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error loading affiliates: {error?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Title and Description */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Affiliates</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage affiliate marketers and their earnings</p>
            </div>

            {/* Stats Cards */}
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
                            <p className="text-2xl font-bold text-emerald-600">${totalEarnings.toFixed(2)}</p>
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
                            <p className="text-2xl font-bold text-blue-600">
                                ${total > 0 ? (totalEarnings / total).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Make Affiliate Button and Refresh */}
            <div className="flex justify-between items-center">
                <Button
                    onClick={() => setMakingAffiliate({ open: true, user: null })}
                    className="gap-2"
                >
                    <UserPlus size={16} />
                    Make Affiliate
                </Button>
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Filters and Sort Row */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            is_active: appliedFilters.is_active,
                            email_verified: appliedFilters.email_verified,
                            affiliate_level: appliedFilters.affiliate_level,
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

            {/* Additional Filters - Earnings and Referrals */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Earnings:</span>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={appliedFilters.min_earnings}
                        onChange={(e) => handleEarningsChange('min_earnings', e.target.value)}
                        className="w-28 h-9 border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={appliedFilters.max_earnings}
                        onChange={(e) => handleEarningsChange('max_earnings', e.target.value)}
                        className="w-28 h-9 border-gray-300 dark:border-gray-700"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Min Referrals:</span>
                    <Input
                        type="number"
                        placeholder="Min referrals"
                        value={appliedFilters.min_referrals}
                        onChange={(e) => handleReferralsChange(e.target.value)}
                        className="w-28 h-9 border-gray-300 dark:border-gray-700"
                    />
                </div>
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
                description="Select a user to make an affiliate marketer"
                open={makingAffiliate.open}
                onOpenChange={(open) => !open && setMakingAffiliate({ open: false, user: null })}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">User Email</label>
                        <Input
                            placeholder="Search by email..."
                            onChange={(e) => {
                                // Search for user by email
                                const searchEmail = e.target.value;
                                if (searchEmail) {
                                    // You can implement user search here
                                    // For now, just show a message
                                }
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter user email to make them an affiliate</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setMakingAffiliate({ open: false, user: null })}>Cancel</Button>
                        <Button
                            onClick={handleMakeAffiliate}
                            disabled={!makingAffiliate.user}
                        >
                            Make Affiliate
                        </Button>
                    </div>
                </div>
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
                                <label className="text-sm font-medium text-gray-500">Affiliate Level</label>
                                <p className="text-gray-900 dark:text-white capitalize">{viewingAffiliate.affiliate_level || 'Bronze'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">
                                    ${(viewingAffiliate.total_earnings || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Referrals</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">{viewingAffiliate.total_referrals || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Pending Earnings</label>
                                <p className="text-amber-600">${(viewingAffiliate.pending_earnings || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Paid Earnings</label>
                                <p className="text-emerald-600">${(viewingAffiliate.paid_earnings || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Joined Affiliate Program</label>
                                <p>{viewingAffiliate.joined_affiliate_at ? new Date(viewingAffiliate.joined_affiliate_at).toLocaleDateString() : '-'}</p>
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

            {/* Data Table */}
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
                excludeColumns={['id', 'full_name', 'last_login', 'joined_affiliate_at', 'pending_earnings', 'paid_earnings']}
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
        </div>
    );
}