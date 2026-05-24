// app/dashboard/shipments/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Package, Truck, Clock, CheckCircle, XCircle, Search, Filter, X,
    Eye, RefreshCw, MapPin, Calendar, Upload, ChevronRight,
    AlertCircle, TrendingUp, TrendingDown, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { useRouter } from 'next/navigation';

// Types
interface Shipment {
    id: string;
    order_number: string;
    order_id: string;
    customer_name: string;
    customer_email: string;
    status: string;
    status_display: string;
    tracking_number: string;
    carrier: string;
    created_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    estimated_delivery: string | null;
}

interface ShipmentDetail {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    status: string;
    status_display: string;
    tracking_number: string;
    carrier: string;
    tracking_url: string;
    estimated_delivery: string | null;
    shipping_method: string;
    shipping_cost: number;
    weight: number | null;
    notes: string;
    created_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    tracking_history: Array<{
        status: string;
        status_display: string;
        location: string;
        description: string;
        created_at: string;
        created_by?: string;
    }>;
    shipping_address: {
        first_name: string;
        last_name: string;
        company: string;
        address_line1: string;
        address_line2: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone: string;
        email: string;
        instructions: string;
    };
    order_items: Array<{
        id: string;
        product_title: string;
        sku: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        image?: string;
    }>;
    order_summary: {
        subtotal: number;
        shipping_cost: number;
        tax_amount: number;
        discount_amount: number;
        total: number;
        currency: string;
        item_count: number;
        payment_status: string;
        payment_method: string;
    };
}

// Fetch shipments with pagination and filters
const fetchShipments = async (params?: any): Promise<{
    data: {
        shipments: Shipment[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.status && params.status !== '') queryParams.append('status', params.status);
    if (params?.carrier && params.carrier !== '') queryParams.append('carrier', params.carrier);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/orders/admin/shipments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Fetch single shipment detail
const fetchShipmentDetail = async (id: string): Promise<ShipmentDetail> => {
    const response = await securityAxios.get(`/orders/admin/shipments/${id}`);
    return response.data.data;
};

// Update shipment status
const updateShipmentStatus = async (id: string, data: any) => {
    const response = await securityAxios.put(`/orders/admin/shipments/${id}/update-status`, data);
    return response.data;
};

// Bulk update shipments
const bulkUpdateShipments = async (data: any) => {
    const response = await securityAxios.post('/orders/admin/shipments/bulk-update', data);
    return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'status',
            type: 'select',
            placeholder: 'Shipment Status',
            options: [
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'returned', label: 'Returned' },
            ],
            defaultValue: '',
            width: '140px',
        },
        {
            name: 'carrier',
            type: 'select',
            placeholder: 'Carrier',
            options: [
                { value: 'fedex', label: 'FedEx' },
                { value: 'dhl', label: 'DHL' },
                { value: 'ups', label: 'UPS' },
                { value: 'usps', label: 'USPS' },
                { value: 'internal', label: 'Internal' },
            ],
            defaultValue: '',
            width: '120px',
        },
    ],
    searchPlaceholder: 'Search by order number, tracking number, or customer...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'shipped_at', label: 'Shipped Date' },
        { value: 'delivered_at', label: 'Delivered Date' },
        { value: 'status', label: 'Status' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

// Update Status Form Component
function UpdateShipmentStatusForm({ shipment, onSuccess, onCancel }: { shipment: Shipment; onSuccess: () => void; onCancel: () => void }) {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(shipment.tracking_number || "");
    const [carrier, setCarrier] = useState(shipment.carrier || "");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const statusOptions = [
        { value: "delivered", label: "Delivered", icon: <CheckCircle size={14} /> },
        { value: "cancelled", label: "Cancelled", icon: <XCircle size={14} /> },
        { value: "returned", label: "Returned", icon: <Package size={14} /> },
    ];

    const handleSubmit = async () => {
        if (!selectedStatus) {
            toast.error("Please select a status");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await updateShipmentStatus(shipment.id, {
                shipment_status: selectedStatus,
                tracking_number: trackingNumber,
                carrier: carrier,
                location: location,
                description: description,
            });

            if (response.success) {
                toast.success(`Shipment status updated to ${selectedStatus}`);
                onSuccess();
            } else {
                toast.error(response.message || "Failed to update status");
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipment Status</label>
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                    <Input
                        placeholder="Enter tracking number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="border-gray-200 dark:border-gray-800"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carrier</label>
                    <Input
                        placeholder="e.g., FedEx, DHL, UPS"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="border-gray-200 dark:border-gray-800"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location (Optional)</label>
                <Input
                    placeholder="Current location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-gray-200 dark:border-gray-800"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <Input
                    placeholder="Additional details"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-gray-200 dark:border-gray-800"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedStatus}>
                    {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
            </div>
        </div>
    );
}

export default function ShipmentsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // State for sheets/dialogs
    const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
    const [updatingStatusFor, setUpdatingStatusFor] = useState<Shipment | null>(null);

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        status: '',
        carrier: '',
        date_from: '',
        date_to: '',
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

    // Query for shipments
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-shipments', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchShipments({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    // Bulk update mutation
    const bulkUpdateMutation = useMutation({
        mutationFn: (data: any) => bulkUpdateShipments(data),
        onSuccess: (response) => {
            const { success_count, failed_count } = response.data;
            if (success_count > 0) toast.success(`Updated ${success_count} shipments`);
            if (failed_count > 0) toast.error(`${failed_count} shipments failed`);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Bulk update failed');
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
            status: newFilters.status || '',
            carrier: newFilters.carrier || '',
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle date filter changes
    const handleDateChange = (field: string, value: string) => {
        setAppliedFilters({
            ...appliedFilters,
            [field]: value,
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
        toast.success('Shipments refreshed');
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            status: '',
            carrier: '',
            date_from: '',
            date_to: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Bulk actions with confirmation
    const handleBulkDeliver = (selectedItems: Shipment[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Deliver Shipments',
            message: `Are you sure you want to mark ${selectedItems.length} selected shipment${selectedItems.length !== 1 ? 's' : ''} as delivered?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(s => s.id);
                bulkUpdateMutation.mutate({
                    order_ids: ids,
                    shipment_status: 'delivered',
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkCancel = (selectedItems: Shipment[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Cancel Shipments',
            message: `Are you sure you want to cancel ${selectedItems.length} selected shipment${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(s => s.id);
                bulkUpdateMutation.mutate({
                    order_ids: ids,
                    shipment_status: 'cancelled',
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: Shipment[]) => {
        const exportData = selectedItems.map(item => ({
            order_number: item.order_number,
            customer_name: item.customer_name,
            customer_email: item.customer_email,
            status: item.status,
            tracking_number: item.tracking_number,
            carrier: item.carrier,
            created_at: item.created_at,
            shipped_at: item.shipped_at,
            delivered_at: item.delivered_at,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shipments_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} shipments`);
    };

    // Row actions
    const getShipmentActions = (shipment: Shipment): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingShipment(shipment),
            color: 'blue',
        });

        if (shipment.status !== 'delivered' && shipment.status !== 'cancelled') {
            actions.push({
                label: 'Update Status',
                icon: <RefreshCw size={14} />,
                onClick: () => setUpdatingStatusFor(shipment),
                color: 'emerald',
            });
        }

        actions.push({
            label: 'View Order',
            icon: <Package size={14} />,
            onClick: () => router.push(`/dashboard/orders/${shipment.order_number}`),
            color: 'violet',
        });

        return actions;
    };

    // Bulk actions
    const bulkActions = [
        { label: 'Mark as Delivered', icon: <CheckCircle size={14} />, onClick: handleBulkDeliver, color: 'emerald' as const },
        { label: 'Cancel Selected', icon: <XCircle size={14} />, onClick: handleBulkCancel, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Export Selected', icon: <Download size={14} />, onClick: handleBulkExport, color: 'blue' as const },
    ];

    const shipments = data?.data?.shipments || [];
    const pagination = data?.data?.pagination;
    const total = data?.data?.total || 0;

    if (isLoading && !shipments.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error loading shipments: {error?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipments</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage all order shipments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Shipments</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                        </div>
                        <Package className="h-8 w-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Shipped</p>
                            <p className="text-2xl font-bold text-indigo-600">
                                {shipments.filter(s => s.status === 'shipped').length}
                            </p>
                        </div>
                        <Truck className="h-8 w-8 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {shipments.filter(s => s.status === 'delivered').length}
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {shipments.filter(s => s.status === 'pending').length}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-500" />
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
                            status: appliedFilters.status,
                            carrier: appliedFilters.carrier,
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

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
                    <Input
                        type="date"
                        placeholder="From"
                        value={appliedFilters.date_from}
                        onChange={(e) => handleDateChange('date_from', e.target.value)}
                        className="w-36 h-9 border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                        type="date"
                        placeholder="To"
                        value={appliedFilters.date_to}
                        onChange={(e) => handleDateChange('date_to', e.target.value)}
                        className="w-36 h-9 border-gray-300 dark:border-gray-700"
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

            {/* Data Table */}
            <DataTable
                data={shipments}
                renderActions={(shipment: Shipment) => (
                    <ActionsDropdown
                        actions={getShipmentActions(shipment)}
                        maxVisible={3}
                        showLabels={false}
                        buttonSize="sm"
                    />
                )}
                bulkActions={bulkActions}
                bulkActionsMessage="Select shipments to mark as delivered, cancel, or export"
                excludeColumns={['id', 'created_at', 'shipped_at', 'delivered_at', 'estimated_delivery']}
                dots={{
                    status: {
                        pending: 'amber',
                        shipped: 'violet',
                        delivered: 'emerald',
                        cancelled: 'rose',
                        returned: 'zinc',
                    },
                }}
                // badges={{
                //     carrier: {
                //         fedex: 'purple',
                //         dhl: 'yellow',
                //         ups: 'brown',
                //         usps: 'blue',
                //         internal: 'gray',
                //     },
                // }}
                links={{
                    order_number: (shipment: Shipment) => `/dashboard/orders/${shipment.order_number}`,
                    tracking_number: (shipment: Shipment) => shipment.tracking_number ? `https://tracking.example.com/${shipment.tracking_number}` : "",
                }}
                emptyTitle="No Shipments Found"
                emptyDescription="Shipments will appear here once orders are shipped."
                onSelectionChange={(selected) => console.log('Selected shipments:', selected.length)}
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

            {/* Update Status Dialog */}
            <CustomDialog
                title="Update Shipment Status"
                description={`Update status for shipment ${updatingStatusFor?.order_number || ''}`}
                open={!!updatingStatusFor}
                onOpenChange={(open) => !open && setUpdatingStatusFor(null)}
                contentWidth="max-w-md"
            >
                {updatingStatusFor && (
                    <UpdateShipmentStatusForm
                        shipment={updatingStatusFor}
                        onSuccess={() => {
                            setUpdatingStatusFor(null);
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                        }}
                        onCancel={() => setUpdatingStatusFor(null)}
                    />
                )}
            </CustomDialog>
        </div>
    );
}

// Shipment Detail View Component (can be moved to separate file)
function ShipmentDetailView({ shipmentId, onClose }: { shipmentId: string; onClose: () => void }) {
    const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await fetchShipmentDetail(shipmentId);
                setShipment(data);
            } catch (error) {
                console.error('Error fetching shipment details:', error);
                toast.error('Failed to load shipment details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [shipmentId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (!shipment) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            returned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="space-y-6 p-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
                <Badge className={getStatusColor(shipment.status)}>
                    {shipment.status_display}
                </Badge>
                {shipment.tracking_url && (
                    <Button variant="outline" size="sm" asChild>
                        <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                            Track Order <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                    </Button>
                )}
            </div>

            {/* Tracking Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.tracking_number || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.carrier || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Method</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.shipping_method || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">${shipment.shipping_cost.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.weight ? `${shipment.weight} kg` : '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipped Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString() : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Delivered Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : '—'}
                    </p>
                </div>
            </div>

            {/* Notes */}
            {shipment.notes && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                        {shipment.notes}
                    </p>
                </div>
            )}

            {/* Tracking Timeline */}
            {shipment.tracking_history && shipment.tracking_history.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tracking History</h3>
                    <div className="space-y-4">
                        {shipment.tracking_history.map((event, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5" />
                                    {index !== shipment.tracking_history.length - 1 && (
                                        <div className="absolute top-5 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-medium text-gray-900 dark:text-white">{event.status_display}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                                    {event.location && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" /> {event.location}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        {new Date(event.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shipping Address */}
            {shipment.shipping_address && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                            {shipment.shipping_address.first_name} {shipment.shipping_address.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.shipping_address.address_line1}</p>
                        {shipment.shipping_address.address_line2 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.shipping_address.address_line2}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipment.shipping_address.city}, {shipment.shipping_address.state} {shipment.shipping_address.postal_code}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.shipping_address.country}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Phone: {shipment.shipping_address.phone}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Email: {shipment.shipping_address.email}</p>
                        {shipment.shipping_address.instructions && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">Instructions: {shipment.shipping_address.instructions}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Order Summary */}
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${shipment.order_summary.subtotal.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${shipment.order_summary.shipping_cost.toFixed(2)}
                        </span>
                    </div>
                    {shipment.order_summary.tax_amount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ${shipment.order_summary.tax_amount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    {shipment.order_summary.discount_amount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Discount</span>
                            <span className="text-sm font-medium text-red-600">
                                -${shipment.order_summary.discount_amount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            ${shipment.order_summary.total.toFixed(2)} {shipment.order_summary.currency}
                        </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Payment Status: <span className="font-medium capitalize">{shipment.order_summary.payment_status}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Payment Method: <span className="font-medium">{shipment.order_summary.payment_method}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Items: {shipment.order_summary.item_count}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}