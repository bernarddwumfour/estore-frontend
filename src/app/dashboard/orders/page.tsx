// app/dashboard/orders/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Eye,
  CheckCircle, XCircle, Truck, PackageCheck,
  Package, Archive, FileText, Upload, ShoppingCart,
  MapPin, Calendar, CreditCard, RefreshCw, Ban,
  CircleDollarSign, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import OrderDetailCard from './OrderDetailCard';
import OrderItemsList from './OrderItemsList';
import ShippingAddressCard from './ShippingAddressCard';
import { useRouter } from 'next/navigation';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';

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
  total: number;
  currency: string;
  item_count: number;
  items: any[];
  shipping_address: any;
  created_at: string;
}

// Fetch orders
const fetchOrders = async (): Promise<{ data: { orders: Order[]; total: number } }> => {
  const response = await securityAxios.get(endpoints.orders.listOrders);
  return response.data;
};

// Bulk action mutation
const bulkOrderAction = async (action: string, orderIds: string[]) => {
  const response = await securityAxios.post(endpoints.orders.bulkOrderAction, {
    action,
    order_ids: orderIds,
  });
  return response.data;
};

// Update Status Form Component
function UpdateStatusForm({ order, onSuccess, onCancel }: { order: Order; onSuccess: () => void; onCancel: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "confirmed", label: "Confirmed", icon: <CheckCircle size={14} /> },
    { value: "processing", label: "Processing", icon: <RefreshCw size={14} /> },
    { value: "shipped", label: "Shipped", icon: <Truck size={14} /> },
    { value: "delivered", label: "Delivered", icon: <PackageCheck size={14} /> },
    { value: "cancelled", label: "Cancelled", icon: <Ban size={14} /> },
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await securityAxios.put(
        endpoints.orders.updateStatus.replace(":id", order.id),
        { status: selectedStatus }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${selectedStatus}`);
        onSuccess();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedStatus}
          className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
        >
          {isSubmitting ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </div>
  );
}

// Update Payment Form Component
function UpdatePaymentForm({ order, onSuccess, onCancel }: { order: Order; onSuccess: () => void; onCancel: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a payment status");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await securityAxios.put(
        endpoints.orders.updatePaymentStatus.replace(":id", order.id),
        { payment_status: selectedStatus }
      );

      if (response.data.success) {
        toast.success(`Payment status updated to ${selectedStatus}`);
        onSuccess();
      } else {
        toast.error(response.data.message || "Failed to update payment");
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
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedStatus}
          className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
        >
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
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingItemsFor, setViewingItemsFor] = useState<Order | null>(null);
  const [viewingAddressFor, setViewingAddressFor] = useState<Order | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<Order | null>(null);
  const [updatingPaymentFor, setUpdatingPaymentFor] = useState<Order | null>(null);

  // Query for orders
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchOrders,
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
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Bulk action failed'),
  });

  // Single action helpers
  // const handleDelete = async (order: Order) => {
  //   if (confirm(`Delete order "${order.order_number}"? This action cannot be undone.`)) {
  //     try {
  //       const response = await securityAxios.delete(
  //         endpoints.orders.deleteOrder.replace(":id", order.id)
  //       );
  //       if (response.data.success) {
  //         toast.success(`Order ${order.order_number} deleted successfully`);
  //         queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  //       } else {
  //         toast.error(response.data.message || "Failed to delete order");
  //       }
  //     } catch (error: any) {
  //       toast.error(error?.response?.data?.message || "Failed to delete order");
  //     }
  //   }
  // };

  // Bulk actions
  const handleBulkConfirm = (selectedItems: Order[]) => {
    const ids = selectedItems.map(i => i.id);
    if (confirm(`Confirm ${selectedItems.length} orders?`)) bulkActionMutation.mutate({ action: 'confirm', ids });
  };

  const handleBulkProcess = (selectedItems: Order[]) => {
    const ids = selectedItems.map(i => i.id);
    if (confirm(`Process ${selectedItems.length} orders?`)) bulkActionMutation.mutate({ action: 'process', ids });
  };

  const handleBulkShip = (selectedItems: Order[]) => {
    const ids = selectedItems.map(i => i.id);
    if (confirm(`Ship ${selectedItems.length} orders?`)) bulkActionMutation.mutate({ action: 'ship', ids });
  };

  const handleBulkDeliver = (selectedItems: Order[]) => {
    const ids = selectedItems.map(i => i.id);
    if (confirm(`Mark ${selectedItems.length} orders as delivered?`)) bulkActionMutation.mutate({ action: 'deliver', ids });
  };

  const handleBulkCancel = (selectedItems: Order[]) => {
    const ids = selectedItems.map(i => i.id);
    if (confirm(`Cancel ${selectedItems.length} orders?`)) bulkActionMutation.mutate({ action: 'cancel', ids });
  };

  const handleBulkExport = (selectedItems: Order[]) => {
    const exportData = selectedItems.map(item => ({
      order_number: item.order_number,
      customer_name: item.customer_name,
      total: item.total,
      status: item.status,
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


  const getOrderActions = (order: Order): ActionItem[] => {
    const actions: ActionItem[] = [];

    actions.push({
      label: 'View Details',
      icon: <Eye />,
      onClick: () => router.push(`/dashboard/orders/${order.id}`),
      color: 'blue', // Add color for specific actions
    });

    if (order.items && order.items.length > 0) {
      actions.push({
        label: 'View Items',
        icon: <ShoppingCart />,
        onClick: () => setViewingItemsFor(order),
        color: 'violet',
      });
    }


    actions.push({
      label: 'Update Status',
      icon: <PackageCheck />,
      onClick: () => setUpdatingStatusFor(order),
      color: 'emerald',
    });

    actions.push({
      label: 'Update Payment',
      icon: <CreditCard />,
      onClick: () => setUpdatingPaymentFor(order),
      color: 'orange',
    });

    actions.push({
      label: 'Edit Order',
      icon: <Edit />,
      onClick: () => router.push(`/dashboard/orders/${order.id}/edit`),
      color: 'blue',
    });

    if (order.shipping_address) {
      actions.push({
        label: 'Shipping Address',
        icon: <MapPin />,
        onClick: () => setViewingAddressFor(order),
        color: 'amber',
      });
    }


    // actions.push({
    //     label: 'Delete Order',
    //     icon: <Trash2 />,
    //     variant: 'destructive', // This will override color
    //     onClick: () => handleDelete(order),
    // });

    return actions;
  };


  // Bulk actions array
  const bulkActions = [
    { label: 'Confirm Selected', icon: <CheckCircle size={14} />, onClick: handleBulkConfirm, color: 'emerald' as const },
    { label: 'Process Selected', icon: <RefreshCw size={14} />, onClick: handleBulkProcess, color: 'blue' as const },
    { label: 'Ship Selected', icon: <Truck size={14} />, onClick: handleBulkShip, color: 'violet' as const },
    { label: 'Deliver Selected', icon: <PackageCheck size={14} />, onClick: handleBulkDeliver, color: 'emerald' as const },
    { label: 'Cancel Selected', icon: <Ban size={14} />, onClick: handleBulkCancel, color: 'rose' as const, variant: 'destructive' as const },
    { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'blue' as const },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Error loading orders: {error?.message}</p>
      </div>
    );
  }

  const orders = data?.data?.orders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track customer orders</p>
        </div>
      </div>

      {/* ==================== SHEETS ==================== */}

      {/* Order Details Sheet */}
      <CustomSheet
        title="Order Details"
        description="Full order information"
        side="bottom"
        size="lg"
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        {viewingOrder && (
          <OrderDetailCard
            orderId={viewingOrder.id}
            onClose={() => setViewingOrder(null)}
          />
        )}
      </CustomSheet>

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

      {/* ==================== DIALOGS ==================== */}

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
              queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            }}
            onCancel={() => setUpdatingPaymentFor(null)}
          />
        )}
      </CustomDialog>

      {/* Data Table */}
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
        excludeColumns={['id', 'items', 'shipping_address', 'timestamps', 'guest_info', 'admin_note']}
        dots={{
          status: {
            pending: 'amber',
            confirmed: 'emerald',
            processing: 'blue',
            shipped: 'violet',
            delivered: 'emerald',
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
          status: {
            "pending": 'amber',
            "confirmed": 'emerald',
            "processing": 'blue',
            "shipped": 'violet',
            "delivered": 'emerald',
            "cancelled": 'rose',
            "refunded": 'zinc'
          },
          payment_status: {
            "pending": 'amber',
            "paid": 'emerald',
            "failed": 'rose',
            "refunded": 'zinc'
          },
          payment_method: {
            "paystack": 'blue',
            "pod": 'orange'
          },
        }}
        links={{
          order_number: (order: Order) => `/dashboard/orders/${order.id}`
        }}
        emptyTitle="No Orders Found"
        emptyDescription="Orders will appear here once customers place them."
        onSelectionChange={(selected) => console.log('Selected orders:', selected.length)}
      />
    </div>
  );
}