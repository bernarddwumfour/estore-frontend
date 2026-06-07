'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewComponent from './ReviewComponent';
import UnAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';

interface Review {
    id: string;
    user: {
        id: string;
        name: string;
        initials: string;
    };
    rating: number;
    title: string;
    comment: string;
    helpful_yes: number;
    helpful_no: number;
    is_verified_purchase: boolean;
    is_edited: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

interface ProductReviewsProps {
    slug: string;
    title: string;
    averageRating: number;
    totalReviews: number;
}

function ReviewCard({ review, onHelpfulClick }: { review: Review; onHelpfulClick: (reviewId: string, isHelpful: boolean) => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleHelpfulClick = async (isHelpful: boolean) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        await onHelpfulClick(review.id, isHelpful);
        setIsSubmitting(false);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-medium text-sm">{review.user.initials}</span>
                    </div>
                    <div>
                        <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                            {review.is_verified_purchase && (
                                <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center mt-1 flex-wrap gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-gray-200 text-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {review.is_edited && (
                                <span className="text-xs text-gray-400">(Edited)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {review.title && (
                <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
            )}
            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                    Was this review helpful?
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => handleHelpfulClick(true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{review.helpful_yes}</span>
                    </button>
                    <button
                        onClick={() => handleHelpfulClick(false)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                        <ThumbsUp className="h-4 w-4 rotate-180" />
                        <span className="text-sm">{review.helpful_no}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProductReviews({ slug, title, averageRating, totalReviews }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(totalReviews || 0);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const fetchReviews = async (pageNum: number, append: boolean = false) => {
        try {
            const response = await UnAuthenticatedAxios.get(
                `${endpoints.products.reviews.getReviews.replace(":slug", slug)}?page=${pageNum}&limit=10`
            );

            if (response.data.success) {
                const newReviews = response.data.data?.reviews || [];
                const paginationData = response.data.data?.pagination;

                setPagination(paginationData);

                if (append) {
                    setReviews(prev => [...prev, ...newReviews]);
                } else {
                    setReviews(newReviews);
                }

                if (paginationData) {
                    setTotal(paginationData.total);
                    setHasMore(paginationData.page < paginationData.total_pages);
                }

                // Calculate rating distribution
                const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                const allReviews = append ? [...reviews, ...newReviews] : newReviews;
                allReviews.forEach((review: any) => {
                    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
                });
                setRatingDistribution(distribution);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setInitialFetchDone(true);
        }
    };

    useEffect(() => {
        if (slug && !initialFetchDone) {
            setIsLoading(true);
            setPage(1);
            setReviews([]);
            fetchReviews(1, false);
        }
    }, [slug]);

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore && pagination) {
            setIsLoadingMore(true);
            const nextPage = (pagination.page || page) + 1;
            setPage(nextPage);
            fetchReviews(nextPage, true);
        }
    };

    const handleHelpfulClick = async (reviewId: string, isHelpful: boolean) => {
        try {
            const endpoint = endpoints.products.reviews.productReviewHelpful.replace(":id", reviewId);
            await securityAxios.post(endpoint, { is_helpful: isHelpful });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        helpful_yes: isHelpful ? review.helpful_yes + 1 : review.helpful_yes,
                        helpful_no: !isHelpful ? review.helpful_no + 1 : review.helpful_no,
                    };
                }
                return review;
            }));

            toast.success('Thank you for your feedback!');
        } catch (error: any) {
            if (error?.response?.status === 409) {
                toast.error('You have already voted on this review');
            } else {
                toast.error('Failed to submit feedback');
            }
        }
    };

    const getPercentage = (rating: number) => {
        if (total === 0) return 0;
        return ((ratingDistribution[rating] || 0) / total) * 100;
    };

    if (isLoading && !initialFetchDone) {
        return (
            <div className="mt-20">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-20">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                    <div className="flex flex-col items-center md:items-start space-y-1">
                        <div className="flex items-center">
                            <div className="flex items-center mr-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.floor(averageRating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-gray-300 text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                                {averageRating.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-gray-600">
                            ({total} {total === 1 ? 'review' : 'reviews'})
                        </p>
                    </div>
                </div>

                <ReviewComponent slug={slug} title={title} />
            </div>

            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="w-16 text-sm text-gray-600">{rating} stars</span>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getPercentage(rating)}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="w-12 text-sm text-gray-500 text-right">
                                    {ratingDistribution[rating] || 0}
                                </span>
                                <span className="w-12 text-sm text-gray-400">
                                    ({getPercentage(rating).toFixed(0)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Review Highlights</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Real customer reviews from verified purchases</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Authentic feedback from people who bought this product</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">Most helpful reviews appear first</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} onHelpfulClick={handleHelpfulClick} />
                        ))}
                    </div>

                    {/* Load More Reviews */}
                    {hasMore && (
                        <div className="text-center">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="gap-2"
                            >
                                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoadingMore ? 'Loading...' : 'Load More Reviews'}
                            </Button>
                        </div>
                    )}
                </>
            ) : initialFetchDone && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-3">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to review this product</p>
                </div>
            )}
        </div>
    );
}