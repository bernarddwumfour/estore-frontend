// app/dashboard/orders/components/OrderDetailCard.tsx
'use client';

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Package, MapPin, CreditCard, Truck, CheckCircle, X, Loader2, DollarSign, Phone, Mail, User, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

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
    discount_code?: string | null;
    affiliate_commission_amount?: number;
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
    affiliate?: {
        id: string;
        email: string;
        name: string;
        referral_code: string;
        commission_amount: number;
    } | null;
}

interface OrderDetailCardProps {
    orderId: string;
    onClose?: () => void;
}

const fetchOrderById = async (orderId: string): Promise<OrderData> => {
    if (!orderId) throw new Error("Order ID is required");

    const response = await securityAxios.get(
        endpoints.orders.getOrderDetails.replace(":id", orderId)
    );

    console.log("Order API Response:", response.data);

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch order");
    }

    return response.data.data;
};

export default function OrderDetailCard({ orderId, onClose }: OrderDetailCardProps) {
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
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "processing": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
            case "shipped": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400";
            case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "paid": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case "refunded": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-muted-foreground">Loading order details...</p>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <Card className="max-w-2xl mx-auto p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    We couldn't find the order you're looking for.
                </p>
                <Button onClick={onClose} variant="outline">Close</Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
            {/* Header with close button */}
            <div className="flex justify-between items-start sticky top-0 bg-white dark:bg-[#09090b] z-10 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
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

            <Separator />

            {/* Customer & Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {order.discount_code && (
                            <p className="text-sm text-green-600">Discount code: {order.discount_code}</p>
                        )}
                        {order.affiliate && (
                            <p className="text-sm text-muted-foreground">Affiliate: {order.affiliate.name || order.affiliate.email}</p>
                        )}
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
                            {formatCurrency(order.total)}
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
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between py-2 text-green-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        {order.discount_code && (
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Applied Code</span>
                                <span className="font-mono text-sm">{order.discount_code}</span>
                            </div>
                        )}
                        {order.affiliate && (
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Affiliate</span>
                                <span>{order.affiliate.name || order.affiliate.email}</span>
                            </div>
                        )}
                        {order.affiliate && (
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Affiliate Commission</span>
                                <span>{formatCurrency(order.affiliate_commission_amount || order.affiliate.commission_amount || 0)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between py-2 font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                    <CardDescription>All items in this order</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Attributes</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.product_title}
                                                    className="w-10 h-10 rounded object-cover border"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.product_title}</p>
                                                <p className="text-xs text-muted-foreground">{item.product_slug}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(item.variant_attributes || {}).map(([k, v]) => (
                                                <Badge key={k} variant="secondary" className="text-xs">
                                                    {k}: {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(item.total_price)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                        <div className="flex items-center gap-4 mt-2 pt-2 border-t">
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
                        <div className="flex items-center gap-4 mt-2 pt-2 border-t">
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
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                    {order.customer_note}
                                </p>
                            </div>
                        )}
                        {order.admin_note && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">Admin Note</h4>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                                    {order.admin_note}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Order Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Order Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Created</span>
                            <span className="font-medium">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Confirmed</span>
                            <span className="font-medium">{formatDate(order.confirmed_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Paid</span>
                            <span className="font-medium">{formatDate(order.paid_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Shipped</span>
                            <span className="font-medium">{formatDate(order.shipped_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Delivered</span>
                            <span className="font-medium">{formatDate(order.delivered_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Cancelled</span>
                            <span className="font-medium">{formatDate(order.cancelled_at)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
