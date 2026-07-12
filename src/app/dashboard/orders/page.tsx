// app/dashboard/orders/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Eye,
  CheckCircle, CheckCheck, PackageCheck,
  Package, Archive, FileText, ShoppingCart,
  MapPin, Calendar, CreditCard, RefreshCw, Ban,
  ShieldCheck, AlertCircle, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/custom-sort/CustomSort';
import OrderDetailCard from './(components)/OrderDetailCard';
import OrderItemsList from './(components)/OrderItemsList';
import ShippingAddressCard from './(components)/ShippingAddressCard';
import { useRouter } from 'next/navigation';
import { ActionItem, ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

// Types
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  payment_method: string;
  payment_method_display: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  discount_code?: string | null;
  affiliate_email?: string | null;
  affiliate_name?: string | null;
  affiliate_referral_code?: string | null;
  affiliate_commission_amount?: number;
  total: number;
  currency: string;
  item_count: number;
  items: any[];
  shipping_address: any;
  created_at: string;
  ready_for_shipping_at?: string;
  completed_at?: string;
}

// Fetch orders with pagination and filters
const fetchOrders = async (params?: any): Promise<{
  data: {
    orders: Order[];
    total: number;
    pagination: PaginationMeta;
  }
}> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search && params.search !== '') queryParams.append('search', params.search);
  if (params?.status && params.status !== '') queryParams.append('status', params.status);
  if (params?.payment_status && params.payment_status !== '') queryParams.append('payment_status', params.payment_status);
  if (params?.payment_method && params.payment_method !== '') queryParams.append('payment_method', params.payment_method);
  if (params?.has_discount && params.has_discount !== '') queryParams.append('has_discount', params.has_discount);
  if (params?.has_affiliate && params.has_affiliate !== '') queryParams.append('has_affiliate', params.has_affiliate);
  if (params?.date_range?.from) queryParams.append('date_from', params.date_range.from);
  if (params?.date_range?.to) queryParams.append('date_to', params.date_range.to);
  if (params?.total_range?.min && params.total_range.min !== '') queryParams.append('min_total', params.total_range.min);
  if (params?.total_range?.max && params.total_range.max !== '') queryParams.append('max_total', params.total_range.max);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

  const url = `/orders/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await securityAxios.get(url);
  return response.data;
};

// Bulk action mutation
const bulkOrderAction = async (action: string, orderIds: string[]) => {
  const response = await securityAxios.post('/orders/admin/orders/bulk-action', {
    action,
    order_ids: orderIds,
  });
  return response.data;
};

// Update Status
const updateOrderStatus = async (orderId: string, status: string, skipBehavior?: 'skip' | 'complete') => {
  const response = await securityAxios.put(`/orders/admin/orders/${orderId}/status`, {
    status,
    ...(skipBehavior ? { skip_behavior: skipBehavior } : {}),
  });
  return response.data;
};

// 409 payload returned when a status change would silently skip pipeline steps
export interface SkipConflict {
  code: string;
  current_status: string;
  requested_status: string;
  skipped_statuses: string[];
  allowed_skip_behaviors: string[];
}

export const getSkipConflict = (error: any): SkipConflict | null => {
  const errors = error?.response?.data?.errors;
  if (error?.response?.status === 409 && errors?.code === 'steps_skipped') return errors;
  return null;
};

const formatStatus = (s: string) => s.replace(/_/g, ' ');

// Update Payment Status
const updatePaymentStatus = async (orderId: string, payment_status: string) => {
  const response = await securityAxios.put(`/orders/admin/orders/${orderId}/payment-status`, { payment_status });
  return response.data;
};

// Reconcile a pending payment with Paystack
const verifyOrderPayment = async (orderId: string) => {
  const response = await securityAxios.post(`/orders/admin/orders/${orderId}/verify-payment`);
  return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
  fields: [
    {
      name: 'status',
      type: 'select',
      placeholder: 'Order Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'ready_for_shipping', label: 'Ready for Shipping' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
      ],
      defaultValue: '',
      width: '150px',
    },
    {
      name: 'payment_status',
      type: 'select',
      placeholder: 'Payment Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
      ],
      defaultValue: '',
      width: '140px',
    },
    {
      name: 'payment_method',
      type: 'select',
      placeholder: 'Payment Method',
      options: [
        { value: 'paystack', label: 'Paystack' },
        { value: 'pod', label: 'Pay on Delivery' },
        { value: 'pos', label: 'Point of Sale' },
      ],
      defaultValue: '',
      width: '150px',
    },
    {
      name: 'has_discount',
      type: 'select',
      placeholder: 'Discount',
      options: [
        { value: 'true', label: 'With Discount' },
        { value: 'false', label: 'No Discount' },
      ],
      defaultValue: '',
      width: '130px',
    },
    {
      name: 'has_affiliate',
      type: 'select',
      placeholder: 'Affiliate',
      options: [
        { value: 'true', label: 'Affiliate Sale' },
        { value: 'false', label: 'Direct Sale' },
      ],
      defaultValue: '',
      width: '130px',
    },
    {
      name: 'date_range',
      type: 'date_range',
      placeholder: 'Date Range',
      defaultValue: undefined,
      width: '260px',
    },
    {
      name: 'total_range',
      type: 'number_range',
      placeholder: 'Total Amount',
      defaultValue: { min: '', max: '' },
      width: '220px',
      min: 0,
      step: 0.01,
    },
  ],
  searchPlaceholder: 'Search by order number, customer name, or email...',
  showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
  options: [
    { value: 'created_at', label: 'Created Date' },
    { value: 'total', label: 'Total Amount' },
    { value: 'status', label: 'Status' },
    { value: 'payment_status', label: 'Payment Status' },
  ],
  defaultSortBy: 'created_at',
  defaultSortOrder: 'desc',
};

// Update Status Form Component
function UpdateStatusForm({ order, onSuccess, onCancel }: { order: Order; onSuccess: () => void; onCancel: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipConflict, setSkipConflict] = useState<SkipConflict | null>(null);

  // shipped / delivered are managed from the Shipments page (create a
  // shipment to ship; mark its shipment delivered) — not offered here.
  const statusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "ready_for_shipping", label: "Ready for Shipping" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleSubmit = async (skipBehavior?: 'skip' | 'complete') => {
    setIsSubmitting(true);
    try {
      const response = await updateOrderStatus(order.id, selectedStatus, skipBehavior);
      if (response.success) {
        toast.success(
          selectedStatus === 'ready_for_shipping'
            ? 'Order ready for shipping — shipment created, track it on the Shipments page'
            : `Order status updated to ${formatStatus(selectedStatus)}`
        );
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      const conflict = getSkipConflict(error);
      if (conflict) {
        setSkipConflict(conflict);
      } else {
        toast.error(error?.response?.data?.message || "Failed to update status");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (skipConflict) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>
              Moving this order from <strong>{formatStatus(skipConflict.current_status)}</strong> to{' '}
              <strong>{formatStatus(skipConflict.requested_status)}</strong> skips:{' '}
              <strong>{skipConflict.skipped_statuses.map(formatStatus).join(', ')}</strong>.
            </p>
            <p className="mt-1">You can skip those steps or mark them as completed.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setSkipConflict(null)} disabled={isSubmitting}>
            Back
          </Button>
          <Button variant="outline" onClick={() => handleSubmit('skip')} disabled={isSubmitting}>
            Skip steps
          </Button>
          <Button onClick={() => handleSubmit('complete')} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Mark steps as completed"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Status</label>
        <select
          className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Select status</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Shipped and delivered are set from the Shipments page.
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </div>
  );
}

// Update Payment Form Component
function UpdatePaymentForm({ order, onSuccess, onCancel }: { order: Order; onSuccess: () => void; onCancel: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState(order.payment_status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await updatePaymentStatus(order.id, selectedStatus);
      if (response.success) {
        toast.success(`Payment status updated to ${selectedStatus}`);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update payment");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
        <select
          className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Select payment status</option>
          {paymentOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Payment"}
        </Button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State for sheets/dialogs
  const [viewingItemsFor, setViewingItemsFor] = useState<Order | null>(null);
  const [viewingAddressFor, setViewingAddressFor] = useState<Order | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<Order | null>(null);
  const [updatingPaymentFor, setUpdatingPaymentFor] = useState<Order | null>(null);
  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  // Track applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    payment_status: '',
    payment_method: '',
    has_discount: '',
    has_affiliate: '',
    date_range: undefined,
    total_range: { min: '', max: '' },
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

  // Query for orders
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-orders', filters.page, filters.limit, appliedFilters],
    queryFn: () => fetchOrders({
      page: filters.page,
      limit: filters.limit,
      ...appliedFilters,
    }),
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) =>
      bulkOrderAction(action, ids),
    onSuccess: (response) => {
      const { data, message } = response;
      const { success_count, failed_count } = data;
      if (success_count > 0) toast.success(message || `Processed ${success_count} orders`);
      if (failed_count > 0) toast.error(`${failed_count} failed`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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
      status: newFilters.status || '',
      payment_status: newFilters.payment_status || '',
      payment_method: newFilters.payment_method || '',
      has_discount: newFilters.has_discount || '',
      has_affiliate: newFilters.has_affiliate || '',
      date_range: newFilters.date_range,
      total_range: newFilters.total_range || { min: '', max: '' },
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
  const handleRefresh = () => refetch();

  // Reset all filters
  const handleResetFilters = () => {
    setAppliedFilters({
      search: '',
      status: '',
      payment_status: '',
      payment_method: '',
      has_discount: '',
      has_affiliate: '',
      date_range: undefined,
      total_range: { min: '', max: '' },
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setFilters({ page: 1, limit: filters.limit });
  };

  // Bulk actions with confirmation
  const handleBulkConfirm = (selectedItems: Order[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Confirm Orders',
      message: `Are you sure you want to confirm ${selectedItems.length} selected order${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'confirm', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkProcess = (selectedItems: Order[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Process Orders',
      message: `Are you sure you want to process ${selectedItems.length} selected order${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'process', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkReadyForShipping = (selectedItems: Order[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Ready for Shipping',
      message: `Are you sure you want to mark ${selectedItems.length} selected order${selectedItems.length !== 1 ? 's' : ''} as ready for shipping?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'ready_for_shipping', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkComplete = (selectedItems: Order[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Complete Orders',
      message: `Are you sure you want to mark ${selectedItems.length} selected order${selectedItems.length !== 1 ? 's' : ''} as completed?`,
      variant: 'info',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'complete', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkCancel = (selectedItems: Order[]) => {
    setConfirmDialog({
      open: true,
      title: 'Bulk Cancel Orders',
      message: `Are you sure you want to cancel ${selectedItems.length} selected order${selectedItems.length !== 1 ? 's' : ''}?`,
      variant: 'error',
      onConfirm: () => {
        const ids = selectedItems.map(i => i.id);
        bulkActionMutation.mutate({ action: 'cancel', ids });
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleBulkExport = (selectedItems: Order[]) => {
    const exportData = selectedItems.map(item => ({
      order_number: item.order_number,
      customer_name: item.customer_name,
      customer_email: item.customer_email,
      status: item.status,
      payment_status: item.payment_status,
      payment_method: item.payment_method,
      subtotal: item.subtotal,
      shipping_cost: item.shipping_cost,
      tax_amount: item.tax_amount,
      discount_amount: item.discount_amount,
      discount_code: item.discount_code,
      total: item.total,
      item_count: item.item_count,
      affiliate_name: item.affiliate_name,
      affiliate_email: item.affiliate_email,
      affiliate_referral_code: item.affiliate_referral_code,
      affiliate_commission_amount: item.affiliate_commission_amount,
      created_at: item.created_at,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedItems.length} orders`);
  };

  // Row actions
  const handleVerifyPayment = async (order: Order) => {
    toast.info(`Checking payment for ${order.order_number} with Paystack...`);
    try {
      const response = await verifyOrderPayment(order.id);
      if (response.success) {
        toast.success(response.message || 'Payment verified — order marked as paid');
      } else {
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Payment verification failed');
    } finally {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  };

  const getOrderActions = (order: Order): ActionItem[] => {
    const actions: ActionItem[] = [];

    actions.push({
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: () => router.push(`orders/${order.id}`),
      color: 'blue',
    });

    if (order.items && order.items.length > 0) {
      actions.push({
        label: 'View Items',
        icon: <ShoppingCart size={14} />,
        onClick: () => setViewingItemsFor(order),
        color: 'violet',
      });
    }

    actions.push({
      label: 'Update Status',
      icon: <RefreshCw size={14} />,
      onClick: () => setUpdatingStatusFor(order),
      color: 'emerald',
    });

    actions.push({
      label: 'Update Payment',
      icon: <CreditCard size={14} />,
      onClick: () => setUpdatingPaymentFor(order),
      color: 'orange',
    });

    // Reconcile with Paystack when the redirect/webhook never confirmed it
    if (order.payment_method === 'paystack' && ['pending', 'failed'].includes(order.payment_status)) {
      actions.push({
        label: 'Verify Payment',
        icon: <ShieldCheck size={14} />,
        onClick: () => handleVerifyPayment(order),
        color: 'emerald',
      });
    }

    if (order.shipping_address) {
      actions.push({
        label: 'Shipping Address',
        icon: <MapPin size={14} />,
        onClick: () => setViewingAddressFor(order),
        color: 'amber',
      });
    }

    return actions;
  };

  // Bulk actions
  const bulkActions = [
    { label: 'Confirm Selected', icon: <CheckCircle size={14} />, onClick: handleBulkConfirm, color: 'emerald' as const },
    { label: 'Process Selected', icon: <Package size={14} />, onClick: handleBulkProcess, color: 'blue' as const },
    { label: 'Ready for Shipping', icon: <PackageCheck size={14} />, onClick: handleBulkReadyForShipping, color: 'violet' as const },
    { label: 'Complete Selected', icon: <CheckCheck size={14} />, onClick: handleBulkComplete, color: 'emerald' as const },
    { label: 'Cancel Selected', icon: <Ban size={14} />, onClick: handleBulkCancel, color: 'rose' as const, variant: 'destructive' as const },
    { label: 'Export Selected', icon: <Download size={14} />, onClick: handleBulkExport, color: 'blue' as const },
  ];

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  // Error state - Keep UI visible
  if (isError) {
    return (
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track customer orders</p>
        </div>

        {/* Refresh Button - Always visible */}
        <div className="flex justify-end">
          <RefreshButton onRefresh={handleRefresh} successMessage="Orders refreshed" />
        </div>

        {/* Filters and Sort - Always visible */}
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div className="flex-1">
            <CustomFilter
              config={filterConfig}
              filters={{
                search: appliedFilters.search,
                status: appliedFilters.status,
                payment_status: appliedFilters.payment_status,
                payment_method: appliedFilters.payment_method,
                has_discount: appliedFilters.has_discount,
                has_affiliate: appliedFilters.has_affiliate,
                date_range: appliedFilters.date_range,
                total_range: appliedFilters.total_range,
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
          <p className="text-red-600 dark:text-red-400">Error loading orders: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track customer orders</p>
      </div>

      {/* Refresh Button - Always visible */}
      <div className="flex justify-end">
        <RefreshButton onRefresh={handleRefresh} successMessage="Orders refreshed" />
      </div>

      {/* Filters and Sort Row - Always visible and interactive */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1">
          <CustomFilter
            config={filterConfig}
            filters={{
              search: appliedFilters.search,
              status: appliedFilters.status,
              payment_status: appliedFilters.payment_status,
              payment_method: appliedFilters.payment_method,
              has_discount: appliedFilters.has_discount,
              has_affiliate: appliedFilters.has_affiliate,
              date_range: appliedFilters.date_range,
              total_range: appliedFilters.total_range,
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

      {/* Items Sheet */}
      <CustomSheet
        title="Order Items"
        description={`Items in order ${viewingItemsFor?.order_number || ''}`}
        side="bottom"
        size="lg"
        open={!!viewingItemsFor}
        onOpenChange={(open) => !open && setViewingItemsFor(null)}
      >
        {viewingItemsFor && (
          <OrderItemsList
            items={viewingItemsFor.items || []}
            orderNumber={viewingItemsFor.order_number}
          />
        )}
      </CustomSheet>

      {/* Shipping Address Sheet */}
      <CustomSheet
        title="Shipping Address"
        description={`For order ${viewingAddressFor?.order_number || ''}`}
        side="bottom"
        size="md"
        open={!!viewingAddressFor}
        onOpenChange={(open) => !open && setViewingAddressFor(null)}
      >
        {viewingAddressFor?.shipping_address && (
          <ShippingAddressCard
            address={viewingAddressFor.shipping_address}
            orderNumber={viewingAddressFor.order_number}
          />
        )}
      </CustomSheet>

      {/* Update Status Dialog */}
      <CustomDialog
        title="Update Order Status"
        description={`Update status for order ${updatingStatusFor?.order_number || ''}`}
        open={!!updatingStatusFor}
        onOpenChange={(open) => !open && setUpdatingStatusFor(null)}
        contentWidth="max-w-md"
      >
        {updatingStatusFor && (
          <UpdateStatusForm
            order={updatingStatusFor}
            onSuccess={() => {
              setUpdatingStatusFor(null);
              refetch();
              queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            }}
            onCancel={() => setUpdatingStatusFor(null)}
          />
        )}
      </CustomDialog>

      {/* Update Payment Dialog */}
      <CustomDialog
        title="Update Payment Status"
        description={`Update payment for order ${updatingPaymentFor?.order_number || ''}`}
        open={!!updatingPaymentFor}
        onOpenChange={(open) => !open && setUpdatingPaymentFor(null)}
        contentWidth="max-w-md"
      >
        {updatingPaymentFor && (
          <UpdatePaymentForm
            order={updatingPaymentFor}
            onSuccess={() => {
              setUpdatingPaymentFor(null);
              refetch();
              queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            }}
            onCancel={() => setUpdatingPaymentFor(null)}
          />
        )}
      </CustomDialog>

      {/* Data Table or Skeleton - Only this shows loading state */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            data={orders}
            renderActions={(order: Order) => (
              <ActionsDropdown
                actions={getOrderActions(order)}
                maxVisible={3}
                showLabels={false}
                buttonSize="sm"
              />
            )}
            bulkActions={bulkActions}
            bulkActionsMessage="Select orders to confirm, process, mark ready for shipping, complete, cancel, or export (shipping is managed from the Shipments page)"
            excludeColumns={['id', 'items', 'shipping_address', 'tax_amount', 'currency']}
            dots={{
              status: {
                pending: 'amber',
                confirmed: 'emerald',
                processing: 'blue',
                ready_for_shipping: 'amber',
                shipped: 'violet',
                delivered: 'emerald',
                completed: 'emerald',
                cancelled: 'rose',
                refunded: 'zinc'
              },
              payment_status: {
                pending: 'amber',
                paid: 'emerald',
                failed: 'rose',
                refunded: 'zinc'
              },
            }}
            badges={{
              payment_method: {
                paystack: 'blue',
                pod: 'orange',
                pos: 'emerald'
              },
            }}
            links={{
              order_number: (order: Order) => `/dashboard/orders/${order.id}`,
            }}
            emptyTitle="No Orders Found"
            emptyDescription="Orders will appear here once customers place them."
            onSelectionChange={(selected) => console.log('Selected orders:', selected.length)}
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
