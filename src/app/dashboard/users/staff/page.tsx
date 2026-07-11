// app/dashboard/users/staff/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Plus, Edit, Trash2, Eye,
    CheckCircle, XCircle, Star,
    Package, Archive, FileText, Upload, RefreshCw,
    UserCog, Shield, ShieldAlert, ShieldCheck, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';
import RefreshButton from '@/widgets/RefreshButton/RefreshButton';

// Types
interface StaffUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    role: 'admin' | 'staff';
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    last_login: string | null;
    date_joined: string;
}

// Fetch staff users with pagination
const fetchStaffUsers = async (params?: any): Promise<{
    data: {
        staff: StaffUser[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.role && params.role !== '') queryParams.append('role', params.role);
    if (params?.is_active && params.is_active !== '') queryParams.append('is_active', params.is_active);
    if (params?.email_verified && params.email_verified !== '') queryParams.append('email_verified', params.email_verified);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.users.listStaffUsers}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Create staff user mutation
const createStaffUser = async (data: any) => {
    const response = await securityAxios.post(endpoints.users.createStaffUser, data);
    return response.data;
};

// Bulk action mutation
const bulkStaffAction = async (action: string, userIds: string[]) => {
    const response = await securityAxios.post(endpoints.users.bulkStaffAction, {
        action,
        user_ids: userIds,
    });
    return response.data;
};

// Delete staff user
const deleteStaffUser = async (userId: string) => {
    const response = await securityAxios.delete(endpoints.users.deleteStaffUser.replace(':id', userId));
    return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'role',
            type: 'select',
            placeholder: 'Role',
            options: [
                { value: 'staff', label: 'Staff' },
                { value: 'admin', label: 'Admin' },
            ],
            defaultValue: '',
            width: '110px',
        },
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
    ],
    searchPlaceholder: 'Search by name, email, or phone...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'date_joined', label: 'Joined Date' },
        { value: 'email', label: 'Email' },
        { value: 'first_name', label: 'First Name' },
        { value: 'last_login', label: 'Last Login' },
    ],
    defaultSortBy: 'date_joined',
    defaultSortOrder: 'desc',
};

// Create Staff Form Component
function CreateStaffForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'staff',
        password: '',
        confirm_password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await createStaffUser({
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                role: formData.role,
                password: formData.password,
            });

            if (response.success) {
                toast.success('Staff member created successfully');
                onSuccess();
            } else {
                toast.error(response.error || 'Failed to create staff member');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to create staff member');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Email *</Label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>First Name *</Label>
                    <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="John"
                        className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                    <Label>Last Name *</Label>
                    <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Doe"
                        className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                </div>
            </div>
            <div>
                <Label>Phone</Label>
                <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                />
            </div>
            <div>
                <Label>Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Password *</Label>
                <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
                <Label>Confirm Password *</Label>
                <Input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="••••••••"
                    className={errors.confirm_password ? 'border-red-500' : ''}
                />
                {errors.confirm_password && <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Staff'}
                </Button>
            </div>
        </form>
    );
}

export default function StaffUsersPage() {
    const queryClient = useQueryClient();

    // State for dialogs/sheets
    const [viewingUser, setViewingUser] = useState<StaffUser | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        role: '',
        is_active: '',
        email_verified: '',
        sort_by: 'date_joined',
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

    // Query for staff users
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['staff-users', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchStaffUsers({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createStaffUser,
        onSuccess: () => {
            toast.success('Staff member created successfully');
            setIsCreateDialogOpen(false);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['staff-users'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create staff member');
        },
    });

    // Bulk action mutation
    const bulkActionMutation = useMutation({
        mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
            bulkStaffAction(action, ids),
        onSuccess: (response) => {
            const { data, message } = response;
            const { success_count, failed_count } = data;
            if (success_count > 0) toast.success(message || `Processed ${success_count} staff members`);
            if (failed_count > 0) toast.error(`${failed_count} failed`);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['staff-users'] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Bulk action failed'),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteStaffUser,
        onSuccess: () => {
            toast.success('Staff member removed successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['staff-users'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to remove staff member');
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
            role: newFilters.role || '',
            is_active: newFilters.is_active || '',
            email_verified: newFilters.email_verified || '',
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
    const handleRefresh = () => refetch();

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            role: '',
            is_active: '',
            email_verified: '',
            sort_by: 'date_joined',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Single action helpers with confirmation
    const handleToggleActive = (user: StaffUser) => {
        const action = user.is_active ? 'deactivate' : 'activate';
        const actionText = user.is_active ? 'Deactivate' : 'Activate';

        setConfirmDialog({
            open: true,
            title: `${actionText} Staff Member`,
            message: `Are you sure you want to ${actionText.toLowerCase()} "${user.email}"?`,
            variant: 'info',
            onConfirm: () => {
                bulkActionMutation.mutate({ action, ids: [user.id] });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: user.email,
        });
    };

    const handleDelete = (user: StaffUser) => {
        setConfirmDialog({
            open: true,
            title: 'Remove Staff Member',
            message: `Are you sure you want to remove "${user.email}" from staff? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                deleteMutation.mutate(user.id);
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName: user.email,
        });
    };

    // Bulk actions with confirmation
    const handleBulkActivate = (selectedItems: StaffUser[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Activate Staff',
            message: `Are you sure you want to activate ${selectedItems.length} selected staff member${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'activate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDeactivate = (selectedItems: StaffUser[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Deactivate Staff',
            message: `Are you sure you want to deactivate ${selectedItems.length} selected staff member${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'deactivate', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDelete = (selectedItems: StaffUser[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Remove Staff',
            message: `Are you sure you want to remove ${selectedItems.length} selected staff member${selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                bulkActionMutation.mutate({ action: 'delete', ids });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: StaffUser[]) => {
        const exportData = selectedItems.map(item => ({
            email: item.email,
            first_name: item.first_name,
            last_name: item.last_name,
            phone: item.phone,
            role: item.role,
            is_active: item.is_active,
            email_verified: item.email_verified,
            date_joined: item.date_joined,
            last_login: item.last_login,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `staff_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} staff members`);
    };

    // Row actions
    const getStaffActions = (user: StaffUser): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingUser(user),
            color: 'blue',
        },
        {
            label: user.is_active ? 'Deactivate' : 'Activate',
            icon: user.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
            onClick: () => handleToggleActive(user),
            color: user.is_active ? 'rose' : 'emerald',
        },
        {
            label: 'Remove from Staff',
            icon: <Trash2 size={14} />,
            variant: 'destructive',
            onClick: () => handleDelete(user),
        },
    ];

    // Bulk actions
    const bulkActions = [
        { label: 'Activate Selected', icon: <CheckCircle size={14} />, onClick: handleBulkActivate, color: 'emerald' as const },
        { label: 'Deactivate Selected', icon: <XCircle size={14} />, onClick: handleBulkDeactivate, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Remove Selected', icon: <Trash2 size={14} />, onClick: handleBulkDelete, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'blue' as const },
    ];

    const staff = data?.data?.staff || [];
    const pagination = data?.data?.pagination;

    // Error state - Keep UI visible
    if (isError) {
        return (
            <div className="space-y-6">
                {/* Header - Always visible */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Staff Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff members and administrators</p>
                </div>

                {/* Buttons - Always visible */}
                <div className="flex justify-between items-center">
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                        <Plus size={16} />
                        Add Staff Member
                    </Button>
                    <RefreshButton onRefresh={handleRefresh} successMessage="Staff list refreshed" />
                </div>

                {/* Filters and Sort - Always visible */}
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                search: appliedFilters.search,
                                role: appliedFilters.role,
                                is_active: appliedFilters.is_active,
                                email_verified: appliedFilters.email_verified,
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
                    <p className="text-red-600 dark:text-red-400">Error loading staff users: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Title and Description - Always visible */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Staff Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff members and administrators</p>
            </div>

            {/* New Staff Button and Refresh - Always visible */}
            <div className="flex justify-between items-center">
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus size={16} />
                    Add Staff Member
                </Button>
                <RefreshButton onRefresh={handleRefresh} successMessage="Staff list refreshed" />
            </div>

            {/* Filters and Sort Row - Always visible and interactive */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            role: appliedFilters.role,
                            is_active: appliedFilters.is_active,
                            email_verified: appliedFilters.email_verified,
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

            {/* Create Staff Dialog */}
            <CustomDialog
                title="Add Staff Member"
                description="Create a new staff account"
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                contentWidth="max-w-md"
            >
                <CreateStaffForm
                    onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        refetch();
                        queryClient.invalidateQueries({ queryKey: ['staff-users'] });
                    }}
                    onCancel={() => setIsCreateDialogOpen(false)}
                />
            </CustomDialog>

            {/* View Staff Details Sheet */}
            <CustomSheet
                title="Staff Details"
                description="Full staff member information"
                side="bottom"
                size="lg"
                open={!!viewingUser}
                onOpenChange={(open) => !open && setViewingUser(null)}
            >
                {viewingUser && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 dark:text-white">{viewingUser.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Role</label>
                                <p className="text-gray-900 dark:text-white capitalize">{viewingUser.role}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">First Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingUser.first_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingUser.last_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="text-gray-900 dark:text-white">{viewingUser.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${viewingUser.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span>{viewingUser.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${viewingUser.email_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span>{viewingUser.email_verified ? 'Verified' : 'Not Verified'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Joined Date</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingUser.date_joined ? new Date(viewingUser.date_joined).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Login</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingUser.last_login ? new Date(viewingUser.last_login).toLocaleDateString() : '-'}
                                </p>
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
                        data={staff}
                        renderActions={(user: StaffUser) => (
                            <ActionsDropdown
                                actions={getStaffActions(user)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select staff members to activate, deactivate, remove, or export"
                        excludeColumns={['id', 'full_name', 'date_joined', 'last_login', 'created_at']}
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
                            role: {
                                admin: 'rose',
                                staff: 'amber',
                            },
                        }}
                        links={{
                            email: (user: StaffUser) => `/dashboard/users/${user.id}`,
                        }}
                        emptyTitle="No Staff Members Found"
                        emptyDescription="Add your first staff member to get started."
                        onSelectionChange={(selected) => console.log('Selected staff:', selected.length)}
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