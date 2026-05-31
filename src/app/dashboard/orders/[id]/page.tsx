// app/dashboard/orders/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, MapPin, CreditCard, Truck, CheckCircle, ArrowLeft, Loader2, DollarSign, Phone, Mail, User, Hash, PackageCheck, XCircle, Timer, ShoppingBag, Eye, ShoppingCart, Edit, Trash2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from 'react';
import { CustomSelect, selectField } from '@/widgets/custom-select/CustomSelect';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';

interface OrderItem {
    id: string;
    product_title: string;
    product_slug: string;
    sku: string;
    variant_attributes: Record<string, string>;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
    discounted_unit_price: number;
    image: string;
    is_bundle_item?: boolean;
    bundle_id?: string;
    bundle_name?: string;
}

interface BundleItem {
    bundle_id: string;
    bundle_name: string;
    items: OrderItem[];
    total: number;
}

interface Address {
    id: string;
    address_type: string;
    first_name: string;
    last_name: string;
    company: string;
    phone: string;
    email: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface OrderData {
    id: string;
    order_number: string;
    status: string;
    status_display: string;
    payment_status: string;
    payment_status_display: string;
    payment_method: string;
    payment_method_display: string;
    customer_name: string;
    customer_email: string;
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
    currency: string;
    item_count: number;
    shipping_method: string;
    carrier: string;
    customer_note: string;
    admin_note: string;
    items: OrderItem[];
    bundles: BundleItem[];
    shipping_address: Address;
    billing_address: Address;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
    confirmed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
}

interface TimelineEvent {
    label: string;
    date: string | null;
    icon: React.ReactNode;
    status: 'completed' | 'current' | 'pending' | 'cancelled';
}

const fetchOrderById = async (orderId: string): Promise<OrderData> => {
    if (!orderId) throw new Error("Order ID is required");

    const response = await securityAxios.get(
        endpoints.orders.getOrderDetails.replace(":id", orderId)
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch order");
    }

    return response.data.data;
};

// Timeline Component with Dark Theme Support
function OrderTimeline({ order }: { order: OrderData }) {
    const isCancelled = order.status === 'cancelled';

    const timelineEvents: TimelineEvent[] = [
        {
            label: 'Order Placed',
            date: order.created_at,
            icon: <ShoppingBag className="h-4 w-4" />,
            status: order.created_at ? 'completed' : 'pending',
        },
        {
            label: 'Payment Confirmed',
            date: order.paid_at,
            icon: <CreditCard className="h-4 w-4" />,
            status: order.paid_at ? 'completed' : isCancelled ? 'cancelled' : 'pending',
        },
        {
            label: 'Order Confirmed',
            date: order.confirmed_at,
            icon: <CheckCircle className="h-4 w-4" />,
            status: order.confirmed_at ? 'completed' : isCancelled ? 'cancelled' : 'pending',
        },
        {
            label: 'Processing',
            date: null,
            icon: <Timer className="h-4 w-4" />,
            status: order.status === 'processing' ? 'current' :
                ['shipped', 'delivered'].includes(order.status) ? 'completed' :
                    isCancelled ? 'cancelled' : 'pending',
        },
        {
            label: 'Shipped',
            date: order.shipped_at,
            icon: <Truck className="h-4 w-4" />,
            status: order.shipped_at ? 'completed' :
                order.status === 'shipped' ? 'current' :
                    isCancelled ? 'cancelled' : 'pending',
        },
        {
            label: 'Delivered',
            date: order.delivered_at,
            icon: <PackageCheck className="h-4 w-4" />,
            status: order.delivered_at ? 'completed' :
                order.status === 'delivered' ? 'current' :
                    isCancelled ? 'cancelled' : 'pending',
        },
    ];

    if (isCancelled) {
        timelineEvents.push({
            label: 'Cancelled',
            date: order.cancelled_at,
            icon: <XCircle className="h-4 w-4" />,
            status: 'cancelled',
        });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600';
            case 'current':
                return 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white ring-4 ring-gray-900/20 dark:ring-white/30';
            case 'cancelled':
                return 'bg-red-500 border-red-500 dark:bg-red-600 dark:border-red-600';
            default:
                return 'bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700';
        }
    };

    const getTextColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 dark:text-green-400';
            case 'current': return 'text-gray-900 dark:text-white';
            case 'cancelled': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    return (
        <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    Order Timeline
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    Track your order status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800" />
                    <div className="space-y-6 relative">
                        {timelineEvents.map((event, index) => {
                            return (
                                <div key={event.label} className="relative flex gap-4">
                                    <div className={cn(
                                        "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white dark:bg-black transition-all shadow-sm",
                                        getStatusColor(event.status)
                                    )}>
                                        <div className={cn("text-white", getStatusColor(event.status))}>
                                            {event.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <h4 className={cn(
                                                "font-semibold text-sm",
                                                event.status === 'cancelled' && "line-through",
                                                getTextColor(event.status)
                                            )}>
                                                {event.label}
                                            </h4>
                                            {event.date && (
                                                <time className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </time>
                                            )}
                                        </div>
                                        {event.status === 'current' && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">In progress...</p>
                                        )}
                                        {event.status === 'cancelled' && event.label === 'Cancelled' && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Order has been cancelled</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Bundle Items Component
function BundleItems({ bundles }: { bundles: BundleItem[] }) {
    if (!bundles || bundles.length === 0) return null;

    return (
        <div className="space-y-4">
            {bundles.map((bundle) => (
                <Card key={bundle.bundle_id} className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <Gift className="h-5 w-5" />
                            Bundle: {bundle.bundle_name}
                        </CardTitle>
                        <CardDescription className="text-amber-600/70 dark:text-amber-500/70">
                            Bundle total: ${bundle.total.toFixed(2)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={bundle.items}
                            excludeColumns={['id', 'discount_amount', 'discounted_unit_price', 'variant_attributes', 'is_bundle_item', 'bundle_id', 'bundle_name', 'bundle_discount']}
                            images={{
                                image: (item: OrderItem) => item.image || '',
                            }}
                            links={{
                                product_title: (item: OrderItem) => `/dashboard/products/${item.product_slug}`,
                            }}
                            emptyTitle="No Items"
                            emptyDescription="This bundle has no items."
                            actionsFirst={false}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderId = params?.id as string;

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<selectField | undefined>();
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<selectField | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions: selectField[] = [
        { id: 'confirmed', label: 'Confirmed', value: 'confirmed' },
        { id: 'processing', label: 'Processing', value: 'processing' },
        { id: 'shipped', label: 'Shipped', value: 'shipped' },
        { id: 'delivered', label: 'Delivered', value: 'delivered' },
        { id: 'cancelled', label: 'Cancelled', value: 'cancelled' },
    ];

    const paymentStatusOptions: selectField[] = [
        { id: 'pending', label: 'Pending', value: 'pending' },
        { id: 'paid', label: 'Paid', value: 'paid' },
        { id: 'failed', label: 'Failed', value: 'failed' },
        { id: 'refunded', label: 'Refunded', value: 'refunded' },
    ];

    const {
        data: order,
        isLoading,
        isError,
        error,
    } = useQuery<OrderData, Error>({
        queryKey: ["order-detail", orderId],
        queryFn: () => fetchOrderById(orderId),
        enabled: !!orderId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    if (isError) {
        console.error("Order fetch error:", error);
        toast.error(error?.message || "Failed to load order details");
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
            case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900";
            case "processing": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-900";
            case "shipped": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
            case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900";
            case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
            case "paid": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900";
            case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) {
            toast.error("Please select a status");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await securityAxios.put(
                endpoints.orders.updateStatus.replace(":id", orderId),
                { status: selectedStatus.value }
            );

            if (response.data.success) {
                toast.success(`Order status updated to ${selectedStatus.label}`);
                setUpdatingStatus(false);
                setSelectedStatus(undefined);
                queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            } else {
                toast.error(response.data.message || "Failed to update status");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePayment = async () => {
        if (!selectedPaymentStatus) {
            toast.error("Please select a payment status");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await securityAxios.put(
                endpoints.orders.updatePaymentStatus.replace(":id", orderId),
                { payment_status: selectedPaymentStatus.value }
            );

            if (response.data.success) {
                toast.success(`Payment status updated to ${selectedPaymentStatus.label}`);
                setUpdatingPayment(false);
                setSelectedPaymentStatus(undefined);
                queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
                queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            } else {
                toast.error(response.data.message || "Failed to update payment");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update payment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOrderActions = (orderData: OrderData): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Items',
            icon: <ShoppingCart />,
            onClick: () => {
                document.getElementById('order-items')?.scrollIntoView({ behavior: 'smooth' });
            },
            color: 'violet',
        });

        if (orderData.shipping_address) {
            actions.push({
                label: 'Shipping Address',
                icon: <MapPin />,
                onClick: () => {
                    document.getElementById('shipping-address')?.scrollIntoView({ behavior: 'smooth' });
                },
                color: 'amber',
            });
        }

        actions.push({
            label: 'Update Status',
            icon: <PackageCheck />,
            onClick: () => setUpdatingStatus(true),
            color: 'emerald',
        });

        actions.push({
            label: 'Update Payment',
            icon: <CreditCard />,
            onClick: () => setUpdatingPayment(true),
            color: 'orange',
        });

        actions.push({
            label: 'Edit Order',
            icon: <Edit />,
            onClick: () => router.push(`/dashboard/orders/${orderData.id}/edit`),
            color: 'blue',
        });

        return actions;
    };

    const itemActions = [
        {
            label: 'View Product',
            icon: <Package size={14} />,
            onClick: (item: OrderItem) => {
                window.open(`/dashboard/products/${item.product_slug}`, '_blank');
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-gray-100" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading order details...</p>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="max-w-2xl mx-auto p-8 text-center border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Order Not Found</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        We couldn't find the order you're looking for.
                    </p>
                    <Button asChild variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg">
                        <Link href="/dashboard/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    // Combine regular items and bundle items for display
    const hasRegularItems = order.items && order.items.length > 0;
    const hasBundles = order.bundles && order.bundles.length > 0;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Back Button */}
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order.order_number}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    <ActionsDropdown
                        actions={getOrderActions(order)}
                        maxVisible={4}
                        showLabels={true}
                        buttonSize="md"
                    />
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge className={`${getStatusColor(order.status)} rounded-lg px-3 py-1 text-xs font-medium`}>
                        {order.status_display}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(order.payment_status)} rounded-lg px-3 py-1 text-xs font-medium`}>
                        Payment: {order.payment_status_display}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1 text-xs font-medium">
                        {order.payment_method_display}
                    </Badge>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-800" />

                {/* Customer & Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {order.customer_email}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.item_count} {order.item_count === 1 ? 'Item' : 'Items'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Shipping: {order.shipping_method || 'Standard'}</p>
                            {order.carrier && <p className="text-sm text-gray-500 dark:text-gray-400">Carrier: {order.carrier}</p>}
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Order Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {order.currency} {order.total.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Breakdown */}
                <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Financial Breakdown</CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Order cost details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                                <span className="text-sm text-gray-900 dark:text-white">{order.currency} {order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Shipping</span>
                                <span className="text-sm text-gray-900 dark:text-white">{order.currency} {order.shipping_cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Tax</span>
                                <span className="text-sm text-gray-900 dark:text-white">{order.currency} {order.tax_amount.toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                                    <span className="text-sm">Discount</span>
                                    <span className="text-sm">-{order.currency} {order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="my-2 bg-gray-200 dark:bg-gray-800" />
                            <div className="flex justify-between py-2 font-bold">
                                <span className="text-base text-gray-900 dark:text-white">Total</span>
                                <span className="text-base text-gray-900 dark:text-white">{order.currency} {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Section - Bundles First, then Regular Items */}
                <div id="order-items">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>

                    {/* Bundles Section */}
                    {hasBundles && <BundleItems bundles={order.bundles} />}

                    {/* Regular Items Section */}
                    {hasRegularItems && (
                        <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Regular Items</CardTitle>
                                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">Individual items in this order</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    data={order.items}
                                    actions={itemActions}
                                    excludeColumns={['id', 'discount_amount', 'discounted_unit_price', 'variant_attributes', 'is_bundle_item', 'bundle_id', 'bundle_name', 'bundle_discount']}
                                    images={{
                                        image: (item: OrderItem) => item.image || '',
                                    }}
                                    links={{
                                        product_title: (item: OrderItem) => `/dashboard/products/${item.product_slug}`,
                                    }}
                                    emptyTitle="No Items Found"
                                    emptyDescription="This order has no individual items."
                                    actionsFirst={false}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {!hasRegularItems && !hasBundles && (
                        <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                            <CardContent className="py-8 text-center">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No items found in this order</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Timeline */}
                <OrderTimeline order={order} />

                {/* Shipping Address */}
                {order.shipping_address && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black" id="shipping-address">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.address_line2}</p>}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.country}</p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {order.shipping_address.phone}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {order.shipping_address.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Billing Address (if different from shipping) */}
                {order.billing_address && order.billing_address.id !== order.shipping_address?.id && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg font-semibold">
                                <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                Billing Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.billing_address.address_line1}</p>
                            {order.billing_address.address_line2 && <p className="text-sm text-gray-600 dark:text-gray-400">{order.billing_address.address_line2}</p>}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.billing_address.country}</p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {order.billing_address.phone}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {order.billing_address.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {(order.customer_note || order.admin_note) && (
                    <Card className="border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.customer_note && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Note</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                        {order.customer_note}
                                    </p>
                                </div>
                            )}
                            {order.admin_note && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Note</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg whitespace-pre-wrap">
                                        {order.admin_note}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Update Status Dialog */}
            <CustomDialog
                title="Update Order Status"
                description={`Update status for order ${order.order_number}`}
                open={updatingStatus}
                onOpenChange={(open) => !open && setUpdatingStatus(false)}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <CustomSelect
                        selectField={selectedStatus}
                        setSelectField={setSelectedStatus as Dispatch<SetStateAction<string | selectField | undefined>>}
                        items={statusOptions}
                        placeholder="Select status"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUpdatingStatus(false)}
                            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isSubmitting || !selectedStatus}
                            className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isSubmitting ? "Updating..." : "Update Status"}
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Update Payment Dialog */}
            <CustomDialog
                title="Update Payment Status"
                description={`Update payment for order ${order.order_number}`}
                open={updatingPayment}
                onOpenChange={(open) => !open && setUpdatingPayment(false)}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <CustomSelect
                        selectField={selectedPaymentStatus}
                        setSelectField={setSelectedPaymentStatus as Dispatch<SetStateAction<string | selectField | undefined>>}
                        items={paymentStatusOptions}
                        placeholder="Select payment status"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUpdatingPayment(false)}
                            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePayment}
                            disabled={isSubmitting || !selectedPaymentStatus}
                            className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isSubmitting ? "Updating..." : "Update Payment"}
                        </Button>
                    </div>
                </div>
            </CustomDialog>
        </div>
    );
}