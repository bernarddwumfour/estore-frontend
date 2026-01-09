import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Home, ArrowLeft, Package, Calendar, Truck, CheckCircle,
  XCircle, MapPin, CreditCard, Phone, Mail, Download, Printer
} from 'lucide-react';
import { endpoints } from '@/constants/endpoints/endpoints';
import CancelOrderButton from '../(components)/CancelOrderButton';

// Fetch order details on the server
async function getOrderDetails(orderId: string) {
  const cookieStore = await cookies();

  // Get ALL cookies to debug
  const allCookies = cookieStore.getAll();
  console.log('Order Details - All cookies found:', allCookies.map(c => ({ name: c.name })));

  const authCookie = cookieStore.get('auth_data')?.value;

  if (!authCookie) {
    console.log('Order Details - No auth_data found, redirecting to login');
    redirect('/login');
  }

  let accessToken;
  try {
    console.log('Order Details - Raw auth cookie length:', authCookie.length);

    // Try to decode and parse
    const decodedCookie = decodeURIComponent(authCookie);
    console.log('Order Details - Decoded cookie (first 200 chars):', decodedCookie.substring(0, 200));

    const authData = JSON.parse(decodedCookie);
    console.log('Order Details - Parsed auth data keys:', Object.keys(authData));

    accessToken = authData.tokens?.access_token;

    if (!accessToken) {
      console.log('Order Details - No access token found in auth data');
      console.log('Order Details - Auth data tokens keys:', authData.tokens ? Object.keys(authData.tokens) : 'No tokens object');
      redirect('/login');
    }

    console.log('Order Details - Access token found (first 30 chars):', accessToken.substring(0, 30) + '...');

  } catch (error) {
    console.error('Order Details - Error parsing auth cookie:', error);
    if (error instanceof SyntaxError) {
      console.error('Order Details - Invalid JSON in cookie');
    }
    redirect('/login');
  }

  // Using native fetch for Next.js caching benefits
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.slice(0, -1);
  const endpoint = endpoints.orders.orderDetails.replace(":id", orderId);
  console.log(`Order Details - Fetching from: ${baseUrl}${endpoint}`);

  const url = new URL(`${baseUrl}${endpoint}`);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Remove cache for dynamic data
    });

    console.log('Order Details - Response status:', response.status);

    if (response.status === 401) {
      console.log('Order Details - 401 Unauthorized response from API');
      redirect('/login');
    }

    if (response.status === 404) {
      console.log('Order Details - 404 Order not found');
      return null; // Return null to show "not found" UI
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('Order Details - Response is not JSON:', contentType);
      const text = await response.text();
      console.error('Order Details - Response text:', text.substring(0, 500));
      throw new Error('Invalid response format from server');
    }

    const result = await response.json();
    console.log('Order Details - API response success:', result.success);

    if (!result.success) {
      console.error('Order Details - API returned error:', result.error);

      // If it's a permission error (403), redirect to orders list
      if (response.status === 403) {
        redirect('/orders');
      }

      throw new Error(result.error || "Failed to load order details");
    }

    return result.data?.order || result.data;

  } catch (error: any) {
    console.error('Order Details - Fetch error:', error);

    // Don't redirect for network errors, let the error boundary handle it
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }

    throw error;
  }
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-purple-100 text-purple-800';
    case 'shipped': return 'bg-indigo-100 text-indigo-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  // Await the params Promise
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  console.log(`Order Details - Loading order ID: ${orderId}`);

  let order;
  try {
    order = await getOrderDetails(orderId);
  } catch (error: any) {
    console.error('Error in OrderDetailsPage:', error);

    // Return error UI
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <Package className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Order</h1>
            <p className="text-gray-600 mb-8">
              {error.message || 'Failed to load order details. Please try again.'}
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/orders">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order not found (404)
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <Package className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/orders">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order?.currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="py-6 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-gray-600">Order #{order.order_number}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status_display || order.status}
              </span>
              <Button asChild variant="outline">
                <Link href="/orders">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Orders
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-12">
            {/* Order Items */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      {item.image ? (
                        <Image
                          width={96}
                          height={96}
                          src={`${item.image}`}
                          alt={item.product_title}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 md:items-end">
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg mb-2">{item.product_title}</h3>
                          <p>Quantity: {item.quantity}</p>
                          <p>Unit Price: {formatCurrency(item.unit_price)}</p>
                          {item.discount_amount > 0 && (
                            <p className="text-green-600">Discount: {formatCurrency(item.discount_amount)}</p>
                          )}
                        </div>
                        {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Attributes:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.variant_attributes).map(([key, value]: any) => (
                                <span key={key} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-right md:text-left space-y-1">
                          <p className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                          <p className="font-medium text-gray-900 text-lg">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Timeline</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Order Placed</h3>
                    <p className="text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {order.paid_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Payment Confirmed</h3>
                      <p className="text-gray-600">{formatDate(order.paid_at)}</p>
                    </div>
                  </div>
                )}

                {order.shipped_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Order Shipped</h3>
                      <p className="text-gray-600">{formatDate(order.shipped_at)}</p>
                      {order.tracking_number && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Tracking: {order.tracking_number}</p>
                          <p className="text-sm text-gray-600">Carrier: {order.carrier || 'Not specified'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Order Delivered</h3>
                      <p className="text-gray-600">{formatDate(order.delivered_at)}</p>
                    </div>
                  </div>
                )}

                {order.cancelled_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Order Cancelled</h3>
                      <p className="text-gray-600">{formatDate(order.cancelled_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Details */}
          <div className="space-y-12">
            {/* Order Summary */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                )}

                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax ({order.tax_rate}%)</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                )}

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {order.customer_note && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Your Note</h3>
                  <p className="text-gray-600 italic">"{order.customer_note}"</p>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h2>

              <div className="space-y-3">
                <p className="font-medium text-gray-900">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                </p>
                <p className="text-gray-600">{order.shipping_address?.address_line1}</p>
                {order.shipping_address?.address_line2 && (
                  <p className="text-gray-600">{order.shipping_address.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                </p>
                <p className="text-gray-600">{order.shipping_address?.country}</p>

                <div className="flex items-center gap-2 mt-4 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{order.shipping_address?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{order.shipping_address?.email}</span>
                </div>

                {order.shipping_address?.instructions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Delivery Instructions:</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.payment_method_display || order.payment_method}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                    {order.payment_status_display || order.payment_status}
                  </span>
                </div>

                {order.payment_intent_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-sm">{order.payment_intent_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Actions</h2>

              <div className="space-y-4">
                {/* Client component for interactive cancellation */}
                <CancelOrderButton
                  orderId={order.id}
                  orderNumber={order.order_number}
                  status={order.status}
                />

                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-5 w-5" />
                  Download Invoice
                </Button>

                <Button variant="outline" className="w-full">
                  <Printer className="mr-2 h-5 w-5" />
                  Print Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}