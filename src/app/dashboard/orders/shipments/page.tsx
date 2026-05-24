// app/dashboard/shipments/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Package, Truck, Clock, CheckCircle, XCircle, Search, Filter, X,
    Eye, RefreshCw, MapPin, Calendar, Upload, ChevronRight
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
import { useRouter } from 'next/navigation';

// Types
interface Shipment {
    id: string;
    order_number: string;
    order_id: string;
    customer_name: string;
    status: string;
    status_display: string;
    tracking_number: string;
    carrier: string;
    created_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
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
    shipped_at: string | null;
    delivered_at: string | null;
    tracking_history: Array<{
        status: string;
        status_display: string;
        location: string;
        description: string;
        created_at: string;
    }>;
    shipping_address: {
        first_name: string;
        last_name: string;
        address_line1: string;
        address_line2: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone: string;
        email: string;
    };
}

// Fetch shipments
const fetchShipments = async (params?: any): Promise<{ data: { shipments: Shipment[]; total: number } }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page);
    if (params?.limit) queryParams.append('limit', params.limit);
    if (params?.status && params.status !== '') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${endpoints.orders.adminShipments}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Fetch single shipment detail
const fetchShipmentDetail = async (id: string): Promise<ShipmentDetail> => {
    const response = await securityAxios.get(endpoints.orders.adminShipmentDetail.replace(':id', id));
    return response.data.data;
};

// Update shipment status (only delivered or cancelled)
const updateShipmentStatus = async (id: string, data: any) => {
    const response = await securityAxios.put(
        endpoints.orders.updateShipmentStatus.replace(':id', id),
        data
    );
    return response.data;
};

// Bulk update shipments
const bulkUpdateShipments = async (data: any) => {
    const response = await securityAxios.post(endpoints.orders.bulkUpdateShipments, data);
    return response.data;
};

// Update Status Form Component (only delivered and cancelled)
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

            if (response.data.success) {
                toast.success(`Shipment status updated to ${selectedStatus}`);
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

export default function ShipmentsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // State for sheets/dialogs
    const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
    const [updatingStatusFor, setUpdatingStatusFor] = useState<Shipment | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 20,
    });

    // Query for shipments
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-shipments', filters],
        queryFn: () => fetchShipments(filters),
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

    const handleBulkDeliver = (selectedItems: Shipment[]) => {
        const ids = selectedItems.map(s => s.id);
        if (confirm(`Mark ${selectedItems.length} shipments as delivered?`)) {
            bulkUpdateMutation.mutate({
                order_ids: ids,
                shipment_status: 'delivered',
            });
        }
    };

    const handleBulkCancel = (selectedItems: Shipment[]) => {
        const ids = selectedItems.map(s => s.id);
        if (confirm(`Cancel ${selectedItems.length} shipments?`)) {
            bulkUpdateMutation.mutate({
                order_ids: ids,
                shipment_status: 'cancelled',
            });
        }
    };

    const handleBulkExport = (selectedItems: Shipment[]) => {
        const exportData = selectedItems.map(item => ({
            order_number: item.order_number,
            customer_name: item.customer_name,
            status: item.status,
            tracking_number: item.tracking_number,
            carrier: item.carrier,
            created_at: item.created_at,
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

    const getShipmentActions = (shipment: Shipment): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye />,
            onClick: () => setViewingShipment(shipment),
            color: 'blue',
        });

        actions.push({
            label: 'Update Status',
            icon: <RefreshCw />,
            onClick: () => setUpdatingStatusFor(shipment),
            color: 'emerald',
        });

        actions.push({
            label: 'View Order',
            icon: <Package />,
            onClick: () => router.push(`/dashboard/orders/${shipment.order_number}`),
            color: 'violet',
        });

        return actions;
    };

    // Bulk actions array
    const bulkActions = [
        { label: 'Mark as Delivered', icon: <CheckCircle size={14} />, onClick: handleBulkDeliver, color: 'emerald' as const },
        { label: 'Cancel Selected', icon: <XCircle size={14} />, onClick: handleBulkCancel, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'blue' as const },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

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
                <p className="text-red-600 dark:text-red-400">Error loading shipments: {error?.message}</p>
            </div>
        );
    }

    const shipments = data?.data?.shipments || [];
    const total = data?.data?.total || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage all order shipments</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} className="gap-2 border-gray-300 dark:border-gray-700">
                    <RefreshCw size={14} />
                    Refresh
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order #, tracking #..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="pl-9 w-64 border-gray-200 dark:border-gray-800"
                        />
                    </div>
                    <select
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {(filters.search || filters.status) && (
                        <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', status: '', page: 1, limit: 20 })}>
                            <X size={14} className="mr-1" /> Reset
                        </Button>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {total} shipments
                </div>
            </div>

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
                excludeColumns={['id', 'created_at', 'shipped_at', 'delivered_at']}
                badges={{
                    // status: {
                    //     pending: 'Pending',
                    //     shipped: 'Shipped',
                    //     delivered: 'Delivered',
                    //     cancelled: 'Cancelled',
                    // },
                }}
                dots={{
                    status: {
                        pending: 'amber',
                        shipped: 'violet',
                        delivered: 'emerald',
                        cancelled: 'rose',
                    },
                }}
                links={{
                    order_number: (shipment: Shipment) => `/dashboard/orders/${shipment.order_id}`,
                }}
                emptyTitle="No Shipments Found"
                emptyDescription="Shipments will appear here once orders are shipped."
                onSelectionChange={(selected) => console.log('Selected shipments:', selected.length)}
            />

            {/* View Shipment Sheet */}
            <CustomSheet
                title="Shipment Details"
                description={`Shipment for order ${viewingShipment?.order_number}`}
                side="bottom"
                size="lg"
                open={!!viewingShipment}
                onOpenChange={(open) => !open && setViewingShipment(null)}
            >
                {viewingShipment && (
                    <ShipmentDetailView
                        shipmentId={viewingShipment.id}
                        onClose={() => setViewingShipment(null)}
                    />
                )}
            </CustomSheet>

            {/* Update Status Dialog */}
            <CustomDialog
                title="Update Shipment Status"
                description={`Update status for shipment ${updatingStatusFor?.order_number}`}
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

// Shipment Detail View Component
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
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="space-y-6">
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
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{shipment.tracking_number || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium">{shipment.carrier || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Shipping Method</p>
                    <p className="font-medium">{shipment.shipping_method || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Shipping Cost</p>
                    <p className="font-medium">${shipment.shipping_cost.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Shipped Date</p>
                    <p className="font-medium">
                        {shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString() : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Delivered Date</p>
                    <p className="font-medium">
                        {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : '—'}
                    </p>
                </div>
            </div>

            {/* Tracking Timeline */}
            {shipment.tracking_history && shipment.tracking_history.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-4">Tracking History</h3>
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
                                    <p className="font-medium">{event.status_display}</p>
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                    {event.location && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" /> {event.location}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
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
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-1">
                        <p className="font-medium">{shipment.shipping_address.first_name} {shipment.shipping_address.last_name}</p>
                        <p className="text-sm">{shipment.shipping_address.address_line1}</p>
                        {shipment.shipping_address.address_line2 && (
                            <p className="text-sm">{shipment.shipping_address.address_line2}</p>
                        )}
                        <p className="text-sm">
                            {shipment.shipping_address.city}, {shipment.shipping_address.state} {shipment.shipping_address.postal_code}
                        </p>
                        <p className="text-sm">{shipment.shipping_address.country}</p>
                        <p className="text-sm text-muted-foreground">Phone: {shipment.shipping_address.phone}</p>
                        <p className="text-sm text-muted-foreground">Email: {shipment.shipping_address.email}</p>
                    </div>
                </div>
            )}

            {/* Order Info */}
            <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <p><span className="font-medium">Order Number:</span> {shipment.order_number}</p>
                    <p><span className="font-medium">Customer:</span> {shipment.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {shipment.customer_email}</p>
                </div>
            </div>
        </div>
    );
}