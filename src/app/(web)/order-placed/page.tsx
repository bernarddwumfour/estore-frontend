'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Mail, Package, Receipt, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/templates/page-header';
import { formatCurrency } from '@/lib/currency';
import SecurityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { getAuthCookie } from '@/lib/providers/auth-provider';
import { getRecentOrder, type RecentOrder, type RecentOrderItem } from '@/lib/orders/recent-order';

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function OrderPlacedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<RecentOrder | null>(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      const authData = getAuthCookie();
      const storedOrder = getRecentOrder();

      if (storedOrder?.order && (!orderId || storedOrder.order.id === orderId)) {
        setOrder(storedOrder.order);
        setIsGuestCheckout(!storedOrder.isAuthenticated);
        setIsLoading(false);
        return;
      }

      if (authData?.tokens?.access_token && orderId) {
        try {
          const response = await SecurityAxios.get(
            endpoints.orders.orderDetails.replace(':id', orderId)
          );

          if (response.data.success) {
            setOrder(response.data.data);
            setIsGuestCheckout(false);
          }
        } catch (error) {
          console.error('Failed to fetch placed order details:', error);
        }
      }

      setIsLoading(false);
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  const orderItems = order?.items || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader subtitle="Order Placed" title="Your Order Is Confirmed" />

      <div className="container mx-auto px-4 py-12 container space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Thank you for your order</h1>
          <p className="text-lg text-gray-600">
            {order?.order_number
              ? `Order #${order.order_number} has been placed successfully.`
              : 'Your order has been placed successfully.'}
          </p>
        </div>

        {order ? (
          <>
            <Card className="border border-gray-100 shadow-none">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Order #{order.order_number}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {order.status_display || order.status}
                      </Badge>
                      {order.payment_status_display && (
                        <Badge variant="outline">
                          Payment: {order.payment_status_display}
                        </Badge>
                      )}
                      {order.discount_code && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Code: {order.discount_code}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    <p className="text-sm text-gray-500 mt-3">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between gap-6">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span>Shipping</span>
                        <span>{formatCurrency(order.shipping_cost || 0)}</span>
                      </div>
                      {(order.tax_amount || 0) > 0 && (
                        <div className="flex justify-between gap-6">
                          <span>Tax</span>
                          <span>{formatCurrency(order.tax_amount)}</span>
                        </div>
                      )}
                      {(order.discount_amount || 0) > 0 && (
                        <div className="flex justify-between gap-6 text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(order.discount_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-6 font-semibold border-t pt-2 text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(order.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Delivery Updates
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        We&apos;ll send order updates to <span className="font-medium">{order.customer_email}</span>.
                      </p>
                      {isGuestCheckout ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
                          <p className="font-medium">Guest checkout confirmed</p>
                          <p className="mt-1">
                            You&apos;ll be updated on the status of this order by email. To track this order later,
                            create an account using <span className="font-semibold">{order.customer_email}</span>.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
                          <p className="font-medium">You can track this order anytime from your orders page.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Ordered
                  </h3>
                  <div className="space-y-4">
                    {orderItems.map((item: RecentOrderItem) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_title}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">{formatCurrency(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              {isGuestCheckout ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link href={order?.id ? `/orders/${order.id}` : '/orders'}>
                    View Order Details
                  </Link>
                </Button>
              )}
            </div>
          </>
        ) : (
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Order confirmed</h2>
              <p className="text-gray-600">
                Your order has been placed. If you checked out as a guest, we&apos;ll email you updates and
                you can create an account with the same email address later to track it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
