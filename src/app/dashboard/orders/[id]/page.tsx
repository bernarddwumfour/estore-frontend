// app/dashboard/orders/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Package, MapPin, CreditCard, Truck, CheckCircle, ArrowLeft, Loader2, DollarSign, Phone, Mail, User, Hash, Circle, CircleCheck, CircleDot, TruckIcon, PackageCheck, XCircle, Timer, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { cn } from "@/lib/utils";

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
                return 'bg-orange-500 border-orange-500 dark:bg-orange-600 dark:border-orange-600 ring-4 ring-orange-500/20 dark:ring-orange-600/30';
            case 'cancelled':
                return 'bg-red-500 border-red-500 dark:bg-red-600 dark:border-red-600';
            default:
                return 'bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-600';
        }
    };

    const getTextColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 dark:text-green-400';
            case 'current': return 'text-orange-600 dark:text-orange-400';
            case 'cancelled': return 'text-red-600 dark:text-red-400';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order Timeline
                </CardTitle>
                <CardDescription>Track your order status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    <div className="space-y-6 relative">
                        {timelineEvents.map((event, index) => {
                            const isLast = index === timelineEvents.length - 1;
                            return (
                                <div key={event.label} className="relative flex gap-4">
                                    {/* Icon Circle */}
                                    <div className={cn(
                                        "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white dark:bg-gray-900 transition-all shadow-sm",
                                        getStatusColor(event.status)
                                    )}>
                                        <div className={cn("text-white", getStatusColor(event.status))}>
                                            {event.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <h4 className={cn(
                                                "font-semibold",
                                                event.status === 'cancelled' && "line-through",
                                                getTextColor(event.status)
                                            )}>
                                                {event.label}
                                            </h4>
                                            {event.date && (
                                                <time className="text-xs text-muted-foreground">
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
                                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">In progress...</p>
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

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id as string;

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
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "processing": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case "shipped": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "paid": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    // Actions for items table
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
            <div className="flex flex-col items-center justify-center min-h-screen py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-500" />
                <p className="mt-4 text-muted-foreground">Loading order details...</p>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="max-w-2xl mx-auto p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Order Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn't find the order you're looking for.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Back Button */}
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 dark:border-gray-800">
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/orders/${order.id}/edit`}>
                                Edit Order
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(order.status)}>
                        {order.status_display}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                        Payment: {order.payment_status_display}
                    </Badge>
                    <Badge variant="outline">
                        {order.payment_method_display}
                    </Badge>
                </div>

                <Separator className="dark:bg-gray-800" />

                {/* Customer & Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {order.customer_email}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium">{order.item_count} {order.item_count === 1 ? 'Item' : 'Items'}</p>
                            <p className="text-sm text-muted-foreground">Shipping: {order.shipping_method || 'Standard'}</p>
                            {order.carrier && <p className="text-sm text-muted-foreground">Carrier: {order.carrier}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Order Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {order.currency} {order.total.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Financial Breakdown</CardTitle>
                        <CardDescription>Order cost details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{order.currency} {order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{order.currency} {order.shipping_cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{order.currency} {order.tax_amount.toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                                    <span>Discount</span>
                                    <span>-{order.currency} {order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="my-2 dark:bg-gray-800" />
                            <div className="flex justify-between py-2 font-bold">
                                <span>Total</span>
                                <span>{order.currency} {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Table - Using DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order Items</CardTitle>
                        <CardDescription>All items in this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={order.items}
                            actions={itemActions}
                            excludeColumns={['id', 'discount_amount', 'discounted_unit_price', 'variant_attributes']}
                            images={{
                                image: (item: OrderItem) => item.image || '',
                            }}
                            links={{
                                product_title: (item: OrderItem) => `/dashboard/products/${item.product_slug}`,
                            }}
                            emptyTitle="No Items Found"
                            emptyDescription="This order has no items."
                            actionsFirst={false}
                        />
                    </CardContent>
                </Card>

                {/* Timeline */}
                <OrderTimeline order={order} />

                {/* Shipping Address */}
                {order.shipping_address && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                            <p className="text-sm">{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p className="text-sm">{order.shipping_address.address_line2}</p>}
                            <p className="text-sm">
                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                            </p>
                            <p className="text-sm">{order.shipping_address.country}</p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t dark:border-gray-800">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {order.shipping_address.phone}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {order.shipping_address.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Billing Address (if different from shipping) */}
                {order.billing_address && order.billing_address.id !== order.shipping_address?.id && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Billing Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="font-medium">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                            <p className="text-sm">{order.billing_address.address_line1}</p>
                            {order.billing_address.address_line2 && <p className="text-sm">{order.billing_address.address_line2}</p>}
                            <p className="text-sm">
                                {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                            </p>
                            <p className="text-sm">{order.billing_address.country}</p>
                            <div className="flex items-center gap-4 mt-2 pt-2 border-t dark:border-gray-800">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {order.billing_address.phone}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {order.billing_address.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {(order.customer_note || order.admin_note) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.customer_note && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Customer Note</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 dark:bg-muted/30 p-3 rounded-md">
                                        {order.customer_note}
                                    </p>
                                </div>
                            )}
                            {order.admin_note && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Admin Note</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 dark:bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                                        {order.admin_note}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}