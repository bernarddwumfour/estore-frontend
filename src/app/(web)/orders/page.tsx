
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Home,
  Package,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Receipt
} from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Button } from '@/components/ui/button';
import CancelOrderButton from './(components)/CancelOrderButton';
import StatusFilter from './(components)/StatusFilter';
import Pagination from './(components)/Pagination';
import axios from 'axios';

async function getOrders(page: number = 1, status: string = '') {
  const cookieStore = await cookies();
  
  // Get ALL cookies to debug
  const allCookies = cookieStore.getAll();
  console.log('All cookies found:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })));
  
  const authCookie = cookieStore.get('auth_data')?.value;
  
  if (!authCookie) {
    console.log('No auth_cookie found, redirecting to login');
    redirect('/login');
  }

  let accessToken;
  try {
    console.log('Raw auth cookie length:', authCookie.length);
    
    // Try to decode and parse
    const decodedCookie = decodeURIComponent(authCookie);
    console.log('Decoded cookie (first 200 chars):', decodedCookie.substring(0, 200));
    
    const authData = JSON.parse(decodedCookie);
    console.log('Parsed auth data keys:', Object.keys(authData));
    
    accessToken = authData.tokens?.access_token;
    
    if (!accessToken) {
      console.log('No access token found in auth data');
      console.log('Auth data tokens keys:', authData.tokens ? Object.keys(authData.tokens) : 'No tokens object');
      redirect('/login');
    }
    
    console.log('Access token found (first 30 chars):', accessToken.substring(0, 30) + '...');
    
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON in cookie');
      // Try to see what's actually in the cookie
      console.error('Raw cookie value:', authCookie);
    }
    redirect('/login');
  }

  // Using native fetch for Next.js caching benefits
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.slice(0,-1);
  console.log(`${baseUrl}${endpoints.orders.listUserOrders}`)
  const url = new URL(`${baseUrl}${endpoints.orders.listUserOrders}`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', '10');
  if (status) url.searchParams.append('status', status);

  console.log('Fetching from URL:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // Remove cache for debugging
      cache: 'no-store',
    });

    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.log('401 Unauthorized response from API');
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      redirect('/login');
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('Response is not JSON:', contentType);
      const text = await response.text();
      console.error('Response text:', text.substring(0, 500));
      throw new Error('Invalid response format from server');
    }
    
    const result = await response.json();
    console.log('API response success:', result.success);
    
    if (!result.success) {
      console.error('API returned error:', result.error);
      throw new Error(result.error || "Failed to load orders");
    }

    return result.data;
    
  } catch (error: any) {
    console.error('Fetch error:', error);
    
    // Don't redirect for network errors, let the error boundary handle it
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    throw error;
  }
}

// Helper functions
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return { icon: Clock, color: 'bg-amber-100 text-amber-800', label: 'Pending' };
    case 'confirmed':
      return { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Confirmed' };
    case 'processing':
      return { icon: Package, color: 'bg-purple-100 text-purple-800', label: 'Processing' };
    case 'shipped':
      return { icon: Truck, color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' };
    case 'delivered':
      return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Delivered' };
    case 'cancelled':
      return { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' };
    default:
      return { icon: Package, color: 'bg-gray-100 text-gray-800', label: status };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

interface MyOrdersPageProps {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function MyOrdersPage({ searchParams }: MyOrdersPageProps) {
  // Await the searchParams Promise
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const statusFilter = resolvedSearchParams?.status || '';
  
  console.log("Current Page:", currentPage, "Status Filter:", statusFilter);
  
  let ordersData;
  try {
    ordersData = await getOrders(currentPage, statusFilter);
    
  } catch (error) {
    // Error state will be handled by the error boundary
    throw error;
  }

  const orders = ordersData?.orders || ordersData || [];
  const totalPages = ordersData?.pagination?.pages || 1;

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-32">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage all your purchases</p>
          </div>
          
          <StatusFilter currentStatus={statusFilter} />
          
          <div className="text-center bg-white py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Orders</h1>
            <p className="text-xl text-gray-600 mb-10">
              You haven't placed any orders yet. Start shopping to see them here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="py-32 container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage all your purchases</p>
        </div>
        
        {/* Status Filter */}
        <StatusFilter currentStatus={statusFilter} />
        
        {/* Orders List */}
        <div className="space-y-8">
          {orders.map((order: any) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={order.id} className="bg-white border border-gray-100 shadow-none overflow-hidden transition-shadow">
                <CardHeader className="bg-gray-50/60 rounded-lg p-4 m-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h3>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="mr-1 h-4 w-4" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Placed on {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </div>
                        {order.tracking_number && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Tracking: {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 py-3">
                        <div className="relative size-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={`${item.image}`}
                              alt={item.product_title}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                              <Package className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product_title}</h4>
                          {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(item.variant_attributes).map(([key, value]: any) => (
                                  <span key={key} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right font-medium">
                          <p className="text-sm text-gray-600 py-2">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                          {formatCurrency(item.total_price)}
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-center text-sm text-gray-500 py-2">
                        + {order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Shipping & Actions */}
                  <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Shipping to: {order.shipping_address?.country}, {order.shipping_address?.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Receipt className="h-4 w-4" />
                        <span>Payment: {order.payment_method || 'Paid'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href={`/orders/${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {/* Client component for interactive cancellation */}
                      <CancelOrderButton 
                        orderId={order.id}
                        orderNumber={order.order_number}
                        status={order.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
}