// app/dashboard/orders/components/OrderItemsList.tsx
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
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

interface OrderItemsListProps {
    items: OrderItem[];
    orderNumber: string;
}

export default function OrderItemsList({ items, orderNumber }: OrderItemsListProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items found in this order</p>
            </div>
        );
    }

    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold">Order Items</h2>
                <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
            </div>

            {/* Items Grid */}
            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            {item.image && (
                                <div className="w-full md:w-32 h-32 bg-muted/50 flex items-center justify-center p-2">
                                    <img
                                        src={item.image}
                                        alt={item.product_title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 p-4">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{item.product_title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.product_slug}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                SKU: {item.sku}
                                            </Badge>
                                            {Object.entries(item.variant_attributes || {}).map(([k, v]) => (
                                                <Badge key={k} variant="secondary" className="text-xs">
                                                    {k}: {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(item.total_price)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} × {formatCurrency(item.unit_price)}
                                        </p>
                                        {item.discount_amount > 0 && (
                                            <p className="text-xs text-green-600">
                                                Saved: {formatCurrency(item.discount_amount)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Items</span>
                            <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Total Quantity</span>
                            <span>{items.reduce((sum, i) => sum + i.quantity, 0)} units</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
