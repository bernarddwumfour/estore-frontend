// app/dashboard/shipments/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Eye, RefreshCw, Package, Truck, CheckCircle, XCircle,
    MapPin, Calendar, Clock, Upload, Download, Filter, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';

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
    shipping_cost_actual: number | null;
    service_level: string | null;
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
        carrier_status: string;
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
    order_items: Array<{
        id: string;
        product_title: string;
        sku: string;
        quantity: number;
        unit_price: number;
        total_price: number;
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
        order_status: string;
        order_status_display: string;
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
    if (params?.date_range?.from) queryParams.append('date_from', params.date_range.from);
    if (params?.date_range?.to) queryParams.append('date_to', params.date_range.to);
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

// Assign carrier and ship
const assignCarrierAndShip = async (orderId: string, data: any) => {
    const response = await securityAxios.post(`/orders/admin/shipments/${orderId}/assign-carrier-and-ship`, { ...data });
    return response.data;
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
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'out_for_delivery', label: 'Out for Delivery' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'failed', label: 'Failed' },
                { value: 'returned', label: 'Returned' },
            ],
            defaultValue: '',
            width: '150px',
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
        {
            name: 'date_range',
            type: 'date_range',
            placeholder: 'Date Range',
            defaultValue: undefined,
            width: '260px',
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
        { value: 'carrier', label: 'Carrier' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

// Assign Carrier Form Component
function AssignCarrierForm({ shipment, onSuccess, onCancel }: { shipment: Shipment; onSuccess: () => void; onCancel: () => void }) {
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");
    const [shippingCostActual, setShippingCostActual] = useState("");
    const [serviceLevel, setServiceLevel] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const carrierOptions = [
        { value: "fedex", label: "FedEx" },
        { value: "dhl", label: "DHL" },
        { value: "ups", label: "UPS" },
        { value: "usps", label: "USPS" },
    ];

    const handleSubmit = async () => {
        if (!carrier || !trackingNumber) {
            toast.error("Carrier and tracking number are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await assignCarrierAndShip(shipment.order_id, {
                carrier,
                tracking_number: trackingNumber,
                tracking_url: trackingUrl,
                shipping_cost_actual: shippingCostActual ? parseFloat(shippingCostActual) : null,
                service_level: serviceLevel,
            });

            if (response.success) {
                toast.success(`Shipment assigned to ${carrier} and marked as shipped`);
                onSuccess();
            } else {
                toast.error(response.message || "Failed to assign carrier");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to assign carrier");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carrier *</label>
                <select
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                >
                    <option value="">Select carrier</option>
                    {carrierOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number *</label>
                <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tracking URL (Optional)</label>
                <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Shipping Cost (Optional)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={shippingCostActual}
                        onChange={(e) => setShippingCostActual(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Level (Optional)</label>
                    <input
                        type="text"
                        value={serviceLevel}
                        onChange={(e) => setServiceLevel(e.target.value)}
                        placeholder="e.g., Express, Standard"
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Assign Carrier & Ship"}
                </Button>
            </div>
        </div>
    );
}

// Update Status Form Component
function UpdateShipmentStatusForm({ shipment, onSuccess, onCancel }: { shipment: Shipment; onSuccess: () => void; onCancel: () => void }) {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [carrierStatus, setCarrierStatus] = useState("");

    const statusOptions = [
        { value: "processing", label: "Processing" },
        { value: "in_transit", label: "In Transit" },
        { value: "out_for_delivery", label: "Out for Delivery" },
        { value: "delivered", label: "Delivered" },
        { value: "failed", label: "Failed" },
        { value: "returned", label: "Returned" },
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
                location: location,
                description: description,
                carrier_status: carrierStatus,
            });

            if (response.success) {
                toast.success(`Shipment status updated to ${selectedStatus.replace(/_/g, ' ')}`);
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

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location (Optional)</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Current location"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carrier Status (Optional)</label>
                <input
                    type="text"
                    value={carrierStatus}
                    onChange={(e) => setCarrierStatus(e.target.value)}
                    placeholder="Status from carrier"
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about this update"
                    rows={2}
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-black text-gray-900 dark:text-white"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
            </div>
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
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            returned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="space-y-6 p-4">
            {/* Status Badge and Tracking Link */}
            <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status_display}
                </span>
                {shipment.tracking_url && (
                    <Button variant="outline" size="sm" asChild>
                        <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                            Track Order
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Service Level</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.service_level || '—'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {shipment.shipping_cost_actual ? `$${shipment.shipping_cost_actual.toFixed(2)}` : `$${shipment.shipping_cost.toFixed(2)} (estimated)`}
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
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">{shipment.order_summary.order_status_display}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : '—'}
                    </p>
                </div>
            </div>

            {/* Tracking History */}
            {shipment.tracking_history && shipment.tracking_history.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tracking History</h3>
                    <div className="space-y-4">
                        {shipment.tracking_history.map((event, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="relative">
                                    <div className={`w-3 h-3 rounded-full ${event.status === 'delivered' ? 'bg-green-500' :
                                        event.status === 'shipped' ? 'bg-indigo-500' : 'bg-orange-500'
                                        } mt-1.5`} />
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
                                    {event.carrier_status && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Carrier: {event.carrier_status}
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

            {/* Order Summary */}
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-sm font-medium">{shipment.order_summary.currency} {shipment.order_summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                        <span className="text-sm font-medium">{shipment.order_summary.currency} {shipment.order_summary.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tax:</span>
                        <span className="text-sm font-medium">{shipment.order_summary.currency} {shipment.order_summary.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
                        <span className="text-sm font-medium text-red-600">-{shipment.order_summary.currency} {shipment.order_summary.discount_amount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold">{shipment.order_summary.currency} {shipment.order_summary.total.toFixed(2)}</span>
                    </div>
                    {/* <div className="flex justify-between text-xs text-gray-500">
                        <span>Payment: {shipment.order_summary.payment_method_display || shipment.order_summary.payment_method}</span>
                        <span>Status: {shipment.order_summary.payment_status_display || shipment.order_summary.payment_status}</span>
                    </div> */}
                </div>
            </div>

            {/* Order Items */}
            {shipment.order_items && shipment.order_items.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Items</h3>
                    <div className="space-y-2">
                        {shipment.order_items.map((item) => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.product_title}</p>
                                    <p className="text-xs text-gray-500">SKU: {item.sku} | Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{shipment.order_summary.currency} {(item.unit_price * item.quantity).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">${item.unit_price.toFixed(2)} each</p>
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ShipmentsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // State for sheets/dialogs
    const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
    const [assigningCarrierFor, setAssigningCarrierFor] = useState<Shipment | null>(null);
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
        date_range: undefined,
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

    // Handle filter changes from CustomFilter
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            ...appliedFilters,
            search: newFilters.search || '',
            status: newFilters.status || '',
            carrier: newFilters.carrier || '',
            date_range: newFilters.date_range,
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
            date_range: undefined,
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Bulk actions with confirmation
    const handleBulkShip = (selectedItems: Shipment[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Ship Orders',
            message: `Are you sure you want to mark ${selectedItems.length} selected shipment${selectedItems.length !== 1 ? 's' : ''} as shipped? You'll need to add carrier info later.`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(s => s.id);
                bulkUpdateMutation.mutate({
                    shipment_ids: ids,
                    shipment_status: 'shipped',
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkDeliver = (selectedItems: Shipment[]) => {
        setConfirmDialog({
            open: true,
            title: 'Bulk Deliver Shipments',
            message: `Are you sure you want to mark ${selectedItems.length} selected shipment${selectedItems.length !== 1 ? 's' : ''} as delivered?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(s => s.id);
                bulkUpdateMutation.mutate({
                    shipment_ids: ids,
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
                    shipment_ids: ids,
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

        // Show "Assign Carrier" for pending shipments (no carrier assigned yet)
        if ((shipment.status === 'pending' || shipment.status === 'processing') && !shipment.tracking_number) {
            actions.push({
                label: 'Assign Carrier & Ship',
                icon: <Send size={14} />,
                onClick: () => setAssigningCarrierFor(shipment),
                color: 'emerald',
            });
        }

        // Show "Update Status" for shipments that are not delivered/cancelled
        if (shipment.status !== 'delivered' && shipment.status !== 'failed' && shipment.status !== 'returned') {
            actions.push({
                label: 'Update Status',
                icon: <RefreshCw size={14} />,
                onClick: () => setUpdatingStatusFor(shipment),
                color: 'violet',
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
        { label: 'Ship Selected', icon: <Truck size={14} />, onClick: handleBulkShip, color: 'violet' as const },
        { label: 'Mark as Delivered', icon: <CheckCircle size={14} />, onClick: handleBulkDeliver, color: 'emerald' as const },
        { label: 'Cancel Selected', icon: <XCircle size={14} />, onClick: handleBulkCancel, color: 'rose' as const, variant: 'destructive' as const },
        { label: 'Export Selected', icon: <Upload size={14} />, onClick: handleBulkExport, color: 'blue' as const },
    ];

    const shipments = data?.data?.shipments || [];
    const pagination = data?.data?.pagination;

    // Error state - Keep UI visible
    if (isError) {
        return (
            <div className="space-y-6">
                {/* Header - Always visible */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage all order shipments</p>
                </div>

                {/* Refresh Button - Always visible */}
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                </div>

                {/* Filters and Sort - Always visible */}
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                search: appliedFilters.search,
                                status: appliedFilters.status,
                                carrier: appliedFilters.carrier,
                                date_range: appliedFilters.date_range,
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
                    <p className="text-red-600 dark:text-red-400">Error loading shipments: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header - Always visible */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipments</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage all order shipments</p>
            </div>

            {/* Refresh Button - Always visible */}
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Filters and Sort Row - Always visible and interactive */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            status: appliedFilters.status,
                            carrier: appliedFilters.carrier,
                            date_range: appliedFilters.date_range,
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

            {/* Assign Carrier Dialog */}
            <CustomDialog
                title="Assign Carrier & Ship"
                description={`Assign carrier and tracking for order ${assigningCarrierFor?.order_number || ''}`}
                open={!!assigningCarrierFor}
                onOpenChange={(open) => !open && setAssigningCarrierFor(null)}
                contentWidth="max-w-md"
            >
                {assigningCarrierFor && (
                    <AssignCarrierForm
                        shipment={assigningCarrierFor}
                        onSuccess={() => {
                            setAssigningCarrierFor(null);
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
                            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                        }}
                        onCancel={() => setAssigningCarrierFor(null)}
                    />
                )}
            </CustomDialog>

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
                            queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
                            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
                        }}
                        onCancel={() => setUpdatingStatusFor(null)}
                    />
                )}
            </CustomDialog>

            {/* Data Table or Skeleton - Only this shows loading state */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
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
                        bulkActionsMessage="Select shipments to ship, deliver, cancel, or export"
                        excludeColumns={['id', 'customer_email', 'created_at', 'shipped_at', 'delivered_at', 'estimated_delivery']}
                        dots={{
                            status: {
                                pending: 'amber',
                                processing: 'blue',
                                shipped: 'violet',
                                in_transit: 'zinc',
                                out_for_delivery: 'orange',
                                delivered: 'emerald',
                                failed: 'rose',
                                returned: 'zinc'
                            },
                        }}
                        links={{
                            order_number: (shipment: Shipment) => `/dashboard/orders/${shipment.order_number}`,
                        }}
                        emptyTitle="No Shipments Found"
                        emptyDescription="Shipments will appear here once orders are ready for shipping."
                        onSelectionChange={(selected) => console.log('Selected shipments:', selected.length)}
                    />

                    {/* View Shipment Details Sheet */}
                    <CustomSheet
                        title="Shipment Details"
                        description={`Shipment for order ${viewingShipment?.order_number || ''}`}
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