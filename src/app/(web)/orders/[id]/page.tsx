'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/templates/page-header';
import {
  Home, ArrowLeft, Package, Calendar, Truck, CheckCircle,
  XCircle, MapPin, CreditCard, Phone, Mail, Download, Printer,
  Loader2, Star, MessageSquare, ThumbsUp, Send, User, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { endpoints } from '@/constants/endpoints/endpoints';
import CancelOrderButton from '../(components)/CancelOrderButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/currency';

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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Star Rating Component
function StarRating({ rating, onRatingChange, size = "lg" }: { rating: number; onRatingChange: (rating: number) => void; size?: "sm" | "lg" }) {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
        >
          <Star
            className={`${starSize} ${(hoverRating || rating) >= star
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

// Review Dialog Component
function ReviewDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  productSlug,
  productName,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  orderNumber?: string;
  productSlug?: string;
  productName?: string;
  onSuccess: () => void;
}) {
  const [overallRating, setOverallRating] = useState(0);
  const [shippingRating, setShippingRating] = useState(0);
  const [packagingRating, setPackagingRating] = useState(0);
  const [deliverySpeedRating, setDeliverySpeedRating] = useState(0);
  const [customerServiceRating, setCustomerServiceRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOrderReview = !!orderId;

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    const authCookie = getCookie('auth_data');
    if (!authCookie) {
      toast.error('Please login to submit a review');
      setIsSubmitting(false);
      return;
    }

    let accessToken: string;
    try {
      const authData = JSON.parse(authCookie);
      accessToken = authData.tokens?.access_token;
      if (!accessToken) throw new Error('No access token');
    } catch {
      toast.error('Authentication failed');
      setIsSubmitting(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
      let endpoint: string;
      let body: any;

      if (isOrderReview) {
        endpoint = endpoints.products.reviews.orderReviewCreate.replace(':order_id', orderId!);
        body = {
          overall_rating: overallRating,
          shipping_rating: shippingRating || null,
          packaging_rating: packagingRating || null,
          delivery_speed_rating: deliverySpeedRating || null,
          customer_service_rating: customerServiceRating || null,
          title: title.trim() || '',
          comment: comment.trim(),
        };
      } else {
        endpoint = endpoints.products.reviews.productReviewCreate.replace(':slug', productSlug!);
        body = {
          rating: overallRating,
          title: title.trim() || '',
          comment: comment.trim(),
        };
      }

      const url = `${baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit review');
      }

      toast.success(isOrderReview ? 'Thank you for your order review!' : 'Thank you for your product review!');
      onSuccess();
      onOpenChange(false);

      // Reset form
      setOverallRating(0);
      setShippingRating(0);
      setPackagingRating(0);
      setDeliverySpeedRating(0);
      setCustomerServiceRating(0);
      setTitle('');
      setComment('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isOrderReview ? 'Review Your Order' : `Review ${productName}`}</DialogTitle>
          <DialogDescription>
            {isOrderReview
              ? `Share your experience with Order #${orderNumber}. Your feedback helps us improve.`
              : `Share your experience with ${productName}. Your feedback helps other customers.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating rating={overallRating} onRatingChange={setOverallRating} />
          </div>

          {/* Detailed Ratings - Only for order reviews */}
          {isOrderReview && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Shipping Experience</Label>
                  <StarRating rating={shippingRating} onRatingChange={setShippingRating} size="sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Packaging Quality</Label>
                  <StarRating rating={packagingRating} onRatingChange={setPackagingRating} size="sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Delivery Speed</Label>
                  <StarRating rating={deliverySpeedRating} onRatingChange={setDeliverySpeedRating} size="sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Customer Service</Label>
                  <StarRating rating={customerServiceRating} onRatingChange={setCustomerServiceRating} size="sm" />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">{title.length}/200 characters</p>
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review <span className="text-red-500">*</span></Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">{comment.length}/5000 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 text-base">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 text-base">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Existing Review Display Component
function ExistingReview({ review, type }: { review: any; type: 'order' | 'product' }) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {renderStars(type === 'order' ? review.overall_rating : review.rating)}
          <span className="text-xs font-medium text-gray-700">
            {type === 'order' ? review.overall_rating : review.rating}.0/5
          </span>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">
          <CheckCircle className="h-3 w-3 mr-1" />
          Reviewed
        </Badge>
      </div>
      {review.title && (
        <p className="text-sm font-medium text-gray-900 mt-1">{review.title}</p>
      )}
      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [existingOrderReview, setExistingOrderReview] = useState<any>(null);
  const [productReviews, setProductReviews] = useState<Record<string, any>>({});
  const [showOrderReviewDialog, setShowOrderReviewDialog] = useState(false);
  const [showProductReviewDialog, setShowProductReviewDialog] = useState<{ open: boolean; productSlug: string; productName: string }>({
    open: false,
    productSlug: '',
    productName: '',
  });

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    const authCookie = getCookie('auth_data');
    if (!authCookie) {
      router.replace('/login');
      return;
    }

    let accessToken: string;
    try {
      const authData = JSON.parse(authCookie);
      accessToken = authData.tokens?.access_token;
      if (!accessToken) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
      const endpoint = endpoints.orders.orderDetails.replace(':id', orderId);
      const url = `${baseUrl}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (response.status === 403) {
        router.replace('/orders');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load order details');
      }

      const orderData = result.data?.order || result.data;
      setOrder(orderData);

      // Fetch existing order review if order is delivered/completed
      if (orderData && (orderData.status === 'delivered' || orderData.status === 'completed')) {
        try {
          const reviewUrl = `${baseUrl}/orders/${orderId}/review`;
          const reviewResponse = await fetch(reviewUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });

          if (reviewResponse.ok) {
            const reviewResult = await reviewResponse.json();
            if (reviewResult.success && reviewResult.data) {
              setExistingOrderReview(reviewResult.data);
            }
          }
        } catch (reviewError) {
          console.error('Failed to fetch order review:', reviewError);
        }

        // Fetch product reviews for each item
        if (orderData.items) {
          const reviewsMap: Record<string, any> = {};
          for (const item of orderData.items) {
            try {
              const productSlug = item.product_slug || item.product_title?.toLowerCase().replace(/\s+/g, '-');
              const productReviewUrl = `${baseUrl}/products/${productSlug}/reviews?limit=10`;
              const reviewResponse = await fetch(productReviewUrl, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                cache: 'no-store',
              });

              if (reviewResponse.ok) {
                const reviewResult = await reviewResponse.json();
                if (reviewResult.success && reviewResult.data?.reviews?.length > 0) {
                  const userReview = reviewResult.data.reviews.find(
                    (r: any) => r.user_email === orderData.user_email
                  );
                  if (userReview) {
                    reviewsMap[productSlug] = userReview;
                  }
                }
              }
            } catch (reviewError) {
              console.error(`Failed to fetch product review for ${item.product_title}:`, reviewError);
            }
          }
          setProductReviews(reviewsMap);
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to load order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  const canReviewOrder = order && (order.status === 'delivered' || order.status === 'completed') && !existingOrderReview;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <Package className="h-24 w-24 text-gray-300 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Order</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-y-4">
              <Button onClick={fetchOrderDetails} size="lg" className="w-full h-12 text-base">
                Try Again
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full h-12 text-base">
                <Link href="/orders">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 text-base">
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

  // Not found state
  if (notFound || !order) {
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
              <Button asChild size="lg" className="w-full h-12 text-base">
                <Link href="/orders">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 text-base">
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
    <div className="min-h-screen bg-gray-50">
      {/* Page header (swaps per active template) */}
      <PageHeader subtitle="Order Details" title={`Order #${order.order_number} Details`} />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status_display || order.status}
            </span>
            {order.discount_code && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Code: {order.discount_code}
              </Badge>
            )}
            {canReviewOrder && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOrderReviewDialog(true)}
                className="gap-1 h-9"
              >
                <Star className="h-3.5 w-3.5" />
                Review Order
              </Button>
            )}
          </div>
          <Button asChild variant="outline" className="h-10">
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" /> Order Items
                </h2>
                <div className="space-y-6">
                  {order.items?.map((item: any, index: number) => {
                    const productSlug = item.product_slug || item.product_title?.toLowerCase().replace(/\s+/g, '-');
                    const hasProductReview = productReviews[productSlug];
                    const canReviewProduct = (order.status === 'delivered' || order.status === 'completed') && !hasProductReview;

                    return (
                      <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          {item.image ? (
                            <Image
                              width={80}
                              height={80}
                              src={item.image}
                              alt={item.product_title}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 text-base">{item.product_title}</h3>
                                {canReviewProduct && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowProductReviewDialog({
                                      open: true,
                                      productSlug: productSlug,
                                      productName: item.product_title,
                                    })}
                                    className="h-7 px-2 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  >
                                    <Star className="h-3 w-3" />
                                    Review
                                  </Button>
                                )}
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm text-gray-600">Unit Price: {formatCurrency(item.unit_price)}</p>
                                {item.discount_amount > 0 && (
                                  <p className="text-sm text-green-600">Discount: {formatCurrency(item.discount_amount)}</p>
                                )}
                              </div>
                              {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Attributes:</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(item.variant_attributes).map(([key, value]: any) => (
                                      <span key={key} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Product Review Display */}
                              {hasProductReview && (
                                <ExistingReview review={hasProductReview} type="product" />
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-lg">
                                {formatCurrency(item.total_price)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity} × {formatCurrency(item.unit_price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Order Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Order Placed</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {order.paid_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">Payment Confirmed</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.paid_at)}</p>
                      </div>
                    </div>
                  )}

                  {order.shipped_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">Order Shipped</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.shipped_at)}</p>
                        {order.tracking_number && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Tracking: {order.tracking_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.delivered_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">Order Delivered</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.delivered_at)}</p>
                      </div>
                    </div>
                  )}

                  {order.cancelled_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">Order Cancelled</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.cancelled_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
                    </div>
                  )}
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  {order.discount_code && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Applied Code</span>
                      <span className="font-medium font-mono">{order.discount_code}</span>
                    </div>
                  )}
                  {order.affiliate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Affiliate</span>
                      <span className="font-medium">{order.affiliate.name || order.affiliate.email}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                {order.customer_note && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Note:</p>
                    <p className="text-sm text-gray-600 italic">"{order.customer_note}"</p>
                  </div>
                )}

                {/* Order Review Display */}
                {existingOrderReview && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Your Order Review</h3>
                    <ExistingReview review={existingOrderReview} type="order" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="space-y-2 text-sm">
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
                  <div className="flex items-center gap-2 pt-2 text-gray-600">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{order.shipping_address?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{order.shipping_address?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h2>
                <div className="space-y-2 text-sm">
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
                  {order.affiliate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Affiliate Referral:</span>
                      <span className="font-medium font-mono">{order.affiliate.referral_code}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Secure payment processed by our platform</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Actions</h2>
                <div className="space-y-3">
                  <CancelOrderButton
                    orderId={order.id}
                    orderNumber={order.order_number}
                    status={order.status}
                  />
                  <Button variant="outline" className="w-full h-11">
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full h-11">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Review Dialog */}
      <ReviewDialog
        open={showOrderReviewDialog}
        onOpenChange={setShowOrderReviewDialog}
        orderId={order.id}
        orderNumber={order.order_number}
        onSuccess={fetchOrderDetails}
      />

      {/* Product Review Dialog */}
      <ReviewDialog
        open={showProductReviewDialog.open}
        onOpenChange={(open) => setShowProductReviewDialog({ ...showProductReviewDialog, open })}
        productSlug={showProductReviewDialog.productSlug}
        productName={showProductReviewDialog.productName}
        onSuccess={fetchOrderDetails}
      />
    </div>
  );
}
