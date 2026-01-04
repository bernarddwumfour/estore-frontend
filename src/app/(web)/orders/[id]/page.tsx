// app/orders/[id]/page.js
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingCart, Home, ArrowLeft, Package, Calendar, Truck, CheckCircle, 
  XCircle, Clock, MapPin, CreditCard, Phone, Mail, Download, Printer 
} from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ApiError } from 'next/dist/server/api-utils';
import { AxiosError } from 'axios';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await securityAxios.get(endpoints.orders.orderDetails.replace(":id",String(params.id )));
      
      if (response.data.success) {
        setOrder(response.data.data?.order || response.data.data);
      } else {
        toast.error(response.data.error || 'Failed to load order details');
        router.push('/orders');
      }
    } catch (error:any) {
      console.error('Error fetching order details:', error);
      
      if (error?.response?.status === 404) {
        toast.error('Order not found');
        router.push('/orders');
      } else if (error?.response?.status === 403) {
        toast.error('You do not have permission to view this order');
        router.push('/orders');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to load order details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setIsCancelling(true);
      
      const response = await securityAxios.post(endpoints.orders.cancelOrder.replace(":id",String(params.id)), {
        reason: 'Cancelled by customer'
      });
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrderDetails(); // Refresh order details
      } else {
        toast.error(response.data.error || 'Failed to cancel order');
      }
    } catch (error:any) {
      console.error('Error cancelling order:', error);
      
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to cancel order');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status:any) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'processing': return <Package className="h-5 w-5 text-purple-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status:any) => {
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

  const formatDate = (dateString :any) => {
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

  const formatCurrency = (amount:number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order?.currency || 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

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
                {order.items?.map((item:any, index:number) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-sm border border-gray-200">
                      {item.image ? (
                        <Image
                          width={96}
                          height={96}
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.image}`}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600  md:items-end">
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
                            {Object.entries(item.variant_attributes).map(([key, value]:any) => (
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
                  <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' : 
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
                {order.status === 'pending' || order.status === 'confirmed' ? (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                ) : null}
                
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