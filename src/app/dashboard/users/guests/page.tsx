// app/dashboard/users/guests/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Eye, RefreshCw, UserPlus, Mail, Phone, Calendar,
    CheckCircle, XCircle, Users, UserX, Clock, Upload,
    UserCheck, UserCog, MoreHorizontal
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
interface Guest {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    is_active: boolean;
    email_verified: boolean;
    is_guest: boolean;
    converted_to_registered: boolean;
    created_at: string;
    last_login: string | null;
    checkout_count?: number;
}

// Fetch guests with pagination
const fetchGuests = async (params?: any): Promise<{
    data: {
        guests: Guest[];
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
    if (params?.converted && params.converted !== '') queryParams.append('converted', params.converted);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.users.listGuestUsers}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
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
            name: 'converted',
            type: 'select',
            placeholder: 'Converted',
            options: [
                { value: 'true', label: 'Converted' },
                { value: 'false', label: 'Not Converted' },
            ],
            defaultValue: '',
            width: '120px',
        },
    ],
    searchPlaceholder: 'Search by name, email, or phone...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'email', label: 'Email' },
        { value: 'first_name', label: 'First Name' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

export default function GuestsPage() {
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
    const [convertingGuest, setConvertingGuest] = useState<Guest | null>(null);

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
        converted: '',
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

    // Form state for conversion
    const [conversionForm, setConversionForm] = useState({
        password: '',
        confirm_password: '',
    });
    const [conversionErrors, setConversionErrors] = useState<Record<string, string>>({});
    const [isConverting, setIsConverting] = useState(false);

    // Query for guests
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['guests', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchGuests({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    // Activate/Deactivate mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
            const response = await securityAxios.post(endpoints.users.activateOrDeactivate.replace(':id', userId));
            return response.data;
        },
        onSuccess: () => {
            toast.success('Guest status updated successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['guests'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update guest status');
        },
    });

    const convertGuestMutation = useMutation({
        mutationFn: async ({ email, password, first_name, last_name, phone }: any) => {
            const response = await securityAxios.post(endpoints.auth.guestConvert, {
                email,
                password,
                first_name,
                last_name,
                phone,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Guest converted to registered user successfully');
            setConvertingGuest(null);
            setConversionForm({ password: '', confirm_password: '' });
            refetch();
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to convert guest');
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
            converted: newFilters.converted || '',
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
        toast.success('Guest list refreshed');
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            is_active: '',
            email_verified: '',
            converted: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Single action helpers with confirmation
    const handleToggleActive = (guest: Guest) => {
        const actionText = guest.is_active ? 'Deactivate' : 'Activate';

        setConfirmDialog({
            open: true,
            title: `${actionText} Guest`,
            message: `Are you sure you want to ${actionText.toLowerCase()} "${guest.email}"?`,
            variant: 'info',
            onConfirm: () => {
                toggleStatusMutation.mutate({ userId: guest.id, isActive: !guest.is_active });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: guest.email,
        });
    };

    const handleConvertGuest = (guest: Guest) => {
        setConvertingGuest(guest);
        setConversionForm({ password: '', confirm_password: '' });
        setConversionErrors({});
    };

    const handleConversionSubmit = () => {
        const errors: Record<string, string> = {};
        if (!conversionForm.password) {
            errors.password = 'Password is required';
        } else if (conversionForm.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (conversionForm.password !== conversionForm.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setConversionErrors(errors);
            return;
        }

        convertGuestMutation.mutate({
            email: convertingGuest?.email,
            password: conversionForm.password,
            first_name: convertingGuest?.first_name,
            last_name: convertingGuest?.last_name,
            phone: convertingGuest?.phone,
        });
    };

    // Export guests
    const handleExport = (selectedItems: Guest[]) => {
        const exportData = selectedItems.map(item => ({
            email: item.email,
            first_name: item.first_name,
            last_name: item.last_name,
            full_name: item.full_name,
            phone: item.phone,
            is_active: item.is_active,
            email_verified: item.email_verified,
            converted_to_registered: item.converted_to_registered,
            created_at: item.created_at,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `guests_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} guests`);
    };

    // Row actions
    const getGuestActions = (guest: Guest): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                label: 'View Details',
                icon: <Eye size={14} />,
                onClick: () => setViewingGuest(guest),
                color: 'blue',
            },
            {
                label: guest.is_active ? 'Deactivate' : 'Activate',
                icon: guest.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
                onClick: () => handleToggleActive(guest),
                color: guest.is_active ? 'rose' : 'emerald',
            },
        ];

        if (!guest.converted_to_registered) {
            actions.push({
                label: 'Convert to Registered',
                icon: <UserCheck size={14} />,
                onClick: () => handleConvertGuest(guest),
                color: 'violet',
            });
        }

        return actions;
    };

    // Bulk actions
    const bulkActions = [
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleExport, color: 'blue' as const },
    ];

    const guests = data?.data?.guests || [];
    const pagination = data?.data?.pagination;
    const total = data?.data?.total || 0;

    // Stats
    const activeCount = guests.filter(g => g.is_active).length;
    const convertedCount = guests.filter(g => g.converted_to_registered).length;
    const pendingCount = total - convertedCount;

    if (isLoading && !guests.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error loading guests: {error?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Title and Description */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Guest Users</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage guest users who checked out without registration</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Guests</p>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Converted</p>
                            <p className="text-2xl font-bold text-emerald-600">{convertedCount}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Conversion</p>
                            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                        </div>
                        <UserX className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                            <p className="text-2xl font-bold text-blue-600">0</p>
                        </div>
                        <Mail className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
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
                            converted: appliedFilters.converted,
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

            {/* Convert Guest Dialog */}
            <CustomDialog
                title="Convert Guest to Registered User"
                description={`Create a registered account for ${convertingGuest?.email}`}
                open={!!convertingGuest}
                onOpenChange={(open) => !open && setConvertingGuest(null)}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Password *</label>
                        <Input
                            type="password"
                            placeholder="Enter password"
                            value={conversionForm.password}
                            onChange={(e) => setConversionForm({ ...conversionForm, password: e.target.value })}
                            className={conversionErrors.password ? 'border-red-500' : ''}
                        />
                        {conversionErrors.password && <p className="text-sm text-red-500 mt-1">{conversionErrors.password}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Confirm Password *</label>
                        <Input
                            type="password"
                            placeholder="Confirm password"
                            value={conversionForm.confirm_password}
                            onChange={(e) => setConversionForm({ ...conversionForm, confirm_password: e.target.value })}
                            className={conversionErrors.confirm_password ? 'border-red-500' : ''}
                        />
                        {conversionErrors.confirm_password && <p className="text-sm text-red-500 mt-1">{conversionErrors.confirm_password}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setConvertingGuest(null)}>Cancel</Button>
                        <Button onClick={handleConversionSubmit} disabled={convertGuestMutation.isPending}>
                            {convertGuestMutation.isPending ? 'Converting...' : 'Convert to Registered'}
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* View Guest Details Sheet */}
            <CustomSheet
                title="Guest Details"
                description="Full guest information"
                side="bottom"
                size="lg"
                open={!!viewingGuest}
                onOpenChange={(open) => !open && setViewingGuest(null)}
            >
                {viewingGuest && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 dark:text-white">{viewingGuest.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingGuest.full_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">First Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingGuest.first_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingGuest.last_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="text-gray-900 dark:text-white">{viewingGuest.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${viewingGuest.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span>{viewingGuest.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Converted to Registered</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${viewingGuest.converted_to_registered ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span>{viewingGuest.converted_to_registered ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Created Date</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingGuest.created_at ? new Date(viewingGuest.created_at).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            {viewingGuest.checkout_count !== undefined && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Checkout Count</label>
                                    <p className="text-gray-900 dark:text-white">{viewingGuest.checkout_count}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CustomSheet>

            {/* Data Table */}
            <DataTable
                data={guests}
                renderActions={(guest: Guest) => (
                    <ActionsDropdown
                        actions={getGuestActions(guest)}
                        maxVisible={3}
                        showLabels={false}
                        buttonSize="sm"
                    />
                )}
                bulkActions={bulkActions}
                bulkActionsMessage="Select guests to export"
                excludeColumns={['id', 'full_name', 'created_at', 'last_login', 'converted_to_registered', 'checkout_count']}
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
                    converted_to_registered: {
                        true: 'emerald',
                        false: 'amber',
                    },
                }}
                links={{
                    email: (guest: Guest) => `/dashboard/users/${guest.id}`,
                }}

                emptyTitle="No Guest Users Found"
                emptyDescription="No guest checkouts yet"
                onSelectionChange={(selected) => console.log('Selected guests:', selected.length)}
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