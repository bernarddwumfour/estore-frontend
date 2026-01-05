'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
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
import { toast } from "sonner";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import Spinner from "@/widgets/loaders/Spinner";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };

      const response = await securityAxios.get(endpoints.orders.listUserOrders, { params });

      if (response.data.success) {
        setOrders(response.data.data?.orders || response.data.data || []);
        setTotalPages(response.data.data?.pagination?.pages || 1);
      } else {
        toast.error(response.data.error || "Failed to load orders");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      if (error?.response?.status === 401) {
        toast.error("Please login to view your orders");
      } else {
        toast.error(error?.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  // Loading State
  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-32">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">

    <div className="py-32 container mx-auto px-4">
      {/* Status Filters */}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage all your purchases</p>
      </div>
      <div className="mb-10 flex flex-wrap gap-3">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "default" : "outline"}
            onClick={() => {
              setStatusFilter(filter);
              setCurrentPage(1);
            }}
          >
            {filter === '' ? 'All Orders' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>


      {orders.length == 0 ?
        <div className="text-center bg-white py-12">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-8" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No  Orders </h1>
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
        </div> :
        <div className="min-h-screen">


          {/* Orders List */}
          <div className="space-y-8">
            {orders.map((order: any) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={order.id} className="bg-white border border-gray-100 shadow-none overflow-hidden  transition-shadow">
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
                                fill
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
                          <span>Shipping to: {order.shipping_address.country
                          }, {order.shipping_address.city},</span>
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
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button variant="destructive" onClick={() => {/* handle cancel */ }}>
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>}
    </div>
    </div>

  );
}