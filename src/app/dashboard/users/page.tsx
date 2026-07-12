// app/dashboard/users/customers/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Eye, RefreshCw, ShoppingBag, DollarSign, Star,
  CheckCircle, XCircle, Users, TrendingUp, Calendar,
  Mail, Phone, MapPin, Filter, Search, Upload, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Link from 'next/link';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

// Types
interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
  total_orders?: number;
  total_spent?: number;
  average_rating?: number;
}

// Fetch customers with pagination
const fetchCustomers = async (params?: any): Promise<{
  data: {
    customers: Customer[];
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
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

  const url = `${endpoints.users.listCustomers}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
    { value: 'last_login', label: 'Last Login' },
  ],
  defaultSortBy: 'created_at',
  defaultSortOrder: 'desc',
};

export default function CustomersPage() {
  const queryClient = useQueryClient();

  // State for dialogs/sheets
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

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

  // Query for customers
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', filters.page, filters.limit, appliedFilters],
    queryFn: () => fetchCustomers({
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
      toast.success('Customer status updated successfully');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update customer status');
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
      is_active: '',
      email_verified: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setFilters({ page: 1, limit: filters.limit });
  };

  // Single action helpers with confirmation
  const handleToggleActive = (customer: Customer) => {
    const actionText = customer.is_active ? 'Deactivate' : 'Activate';

    setConfirmDialog({
      open: true,
      title: `${actionText} Customer`,
      message: `Are you sure you want to ${actionText.toLowerCase()} "${customer.email}"?`,
      variant: 'info',
      onConfirm: () => {
        toggleStatusMutation.mutate({ userId: customer.id, isActive: !customer.is_active });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
      itemName: customer.email,
    });
  };

  // Export customers
  const handleExport = (selectedItems: Customer[]) => {
    const exportData = selectedItems.map(item => ({
      email: item.email,
      first_name: item.first_name,
      last_name: item.last_name,
      full_name: item.full_name,
      phone: item.phone,
      is_active: item.is_active,
      email_verified: item.email_verified,
      created_at: item.created_at,
      last_login: item.last_login,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedItems.length} customers`);
  };

  // Row actions
  const getCustomerActions = (customer: Customer): ActionItem[] => [
    {
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: () => setViewingCustomer(customer),
      color: 'blue',
    },
    {
      label: customer.is_active ? 'Deactivate' : 'Activate',
      icon: customer.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />,
      onClick: () => handleToggleActive(customer),
      color: customer.is_active ? 'rose' : 'emerald',
    },
  ];

  // Bulk actions
  const bulkActions = [
    { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleExport, color: 'blue' as const },
  ];

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination;
  const total = data?.data?.total || 0;

  // Stats calculations
  const activeCount = customers.filter(c => c.is_active).length;
  const verifiedCount = customers.filter(c => c.email_verified).length;
  const newThisMonthCount = customers.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear();
  }).length;

  // Error state - Keep UI visible
  if (isError) {
    return (
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all registered customers</p>
        </div>

        {/* Stats Cards Skeleton - Show placeholder stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Refresh Button - Always visible */}
        <div className="flex justify-end">
          <RefreshButton onRefresh={handleRefresh} successMessage="Customer list refreshed" />
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
          <p className="text-red-600 dark:text-red-400">Error loading customers: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Description - Always visible */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage all registered customers</p>
      </div>

      {/* Stats Cards - Always visible (show actual stats or skeletons while loading) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
              </div>
              <Mail className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-amber-600">{newThisMonthCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button - Always visible */}
      <div className="flex justify-end">
        <RefreshButton onRefresh={handleRefresh} successMessage="Customer list refreshed" />
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

      {/* View Customer Details Sheet */}
      <CustomSheet
        title="Customer Details"
        description="Full customer information"
        side="bottom"
        size="lg"
        open={!!viewingCustomer}
        onOpenChange={(open) => !open && setViewingCustomer(null)}
      >
        {viewingCustomer && (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 dark:text-white">{viewingCustomer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 dark:text-white">{viewingCustomer.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-gray-900 dark:text-white">{viewingCustomer.first_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-gray-900 dark:text-white">{viewingCustomer.last_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 dark:text-white">{viewingCustomer.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${viewingCustomer.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{viewingCustomer.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${viewingCustomer.email_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{viewingCustomer.email_verified ? 'Verified' : 'Not Verified'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Joined Date</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingCustomer.created_at ? new Date(viewingCustomer.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-900 dark:text-white">
                  {viewingCustomer.last_login ? new Date(viewingCustomer.last_login).toLocaleDateString() : '-'}
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
            data={customers}
            renderActions={(customer: Customer) => (
              <ActionsDropdown
                actions={getCustomerActions(customer)}
                maxVisible={3}
                showLabels={false}
                buttonSize="sm"
              />
            )}
            bulkActions={bulkActions}
            bulkActionsMessage="Select customers to export"
            excludeColumns={['id', 'full_name', 'created_at', 'last_login']}
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
            badges={{}}
            links={{
              email: (customer: Customer) => `/dashboard/users/${customer.id}`,
            }}
            emptyTitle="No Customers Found"
            emptyDescription="No registered customers yet"
            onSelectionChange={(selected) => console.log('Selected customers:', selected.length)}
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