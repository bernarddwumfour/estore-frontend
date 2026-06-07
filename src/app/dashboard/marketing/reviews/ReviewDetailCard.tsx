'use client';

import React from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Package, ShoppingBag, User, Calendar, MessageSquare, Shield, Clock, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

interface ReviewDetailCardProps {
    review: any;
    onClose: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onAddResponse?: () => void;
}

export default function ReviewDetailCard({
    review,
    onClose,
    onApprove,
    onReject,
    onAddResponse
}: ReviewDetailCardProps) {
    const isProductReview = review.type === 'product';

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {isProductReview ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <Package className="h-3 w-3 mr-1" />
                                Product Review
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Order Review
                            </Badge>
                        )}
                        {review.is_approved ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Moderation
                            </Badge>
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {review.title || (isProductReview ? review.product_title : `Order #${review.order_number}`)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isProductReview ? 'Product Review' : 'Order Experience Review'}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-900 dark:text-white">{review.user?.name || review.user_email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.user_email}</p>
                        {isProductReview && (review as any).is_verified_purchase && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Verified Purchase
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Submitted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Rating Section */}
            <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    {isProductReview ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                {renderStars(review.rating)}
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{review.rating}.0</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">out of 5</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {renderStars(review.overall_rating)}
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{review.overall_rating}.0</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Overall Rating</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {review.shipping_rating && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.shipping_rating)}
                                            <span className="text-xs text-gray-500">{review.shipping_rating}.0</span>
                                        </div>
                                    </div>
                                )}
                                {review.packaging_rating && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Packaging:</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.packaging_rating)}
                                            <span className="text-xs text-gray-500">{review.packaging_rating}.0</span>
                                        </div>
                                    </div>
                                )}
                                {review.delivery_speed_rating && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Speed:</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.delivery_speed_rating)}
                                            <span className="text-xs text-gray-500">{review.delivery_speed_rating}.0</span>
                                        </div>
                                    </div>
                                )}
                                {review.customer_service_rating && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Customer Service:</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.customer_service_rating)}
                                            <span className="text-xs text-gray-500">{review.customer_service_rating}.0</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Content */}
            <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Review Content
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {review.comment}
                    </p>
                </CardContent>
            </Card>

            {/* Helpful Votes */}
            {(review.helpful_yes > 0 || review.helpful_no > 0) && (
                <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Helpfulness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{review.helpful_yes}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">found helpful</span>
                            </div>
                            {review.helpful_no > 0 && (
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{review.helpful_no}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">found not helpful</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Admin Response */}
            {!isProductReview && review.admin_response && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Shield className="h-4 w-4" />
                            Admin Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{review.admin_response}</p>
                        {review.admin_response_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Responded on {new Date(review.admin_response_at).toLocaleDateString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            {!review.is_approved && (
                <div className="flex gap-3 pt-4">
                    {onApprove && (
                        <Button onClick={onApprove} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="h-4 w-4" />
                            Approve Review
                        </Button>
                    )}
                    {onReject && (
                        <Button onClick={onReject} variant="destructive" className="flex-1 gap-2">
                            <XCircle className="h-4 w-4" />
                            Reject Review
                        </Button>
                    )}
                </div>
            )}

            {!isProductReview && !review.admin_response && review.is_approved && onAddResponse && (
                <Button onClick={onAddResponse} variant="outline" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Add Admin Response
                </Button>
            )}
        </div>
    );
}