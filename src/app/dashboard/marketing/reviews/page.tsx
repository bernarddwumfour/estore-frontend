// app/dashboard/products/reviews/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    Eye, RefreshCw, Copy, CheckCircle, XCircle, Star, Upload, Loader2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import ReviewDetailCard from './(components)/ReviewDetailCard';
import AdminResponseForm from './(components)/AdminResponseForm';

// Types
interface Review {
    id: string;
    type: 'product' | 'order';
    product_title?: string;
    product_id?: string;
    order_number?: string;
    user_email: string;
    rating?: number;
    overall_rating?: number;
    comment_preview: string;
    is_approved: boolean;
    is_verified_purchase?: boolean;
    helpful_yes: number;
    helpful_no?: number;
    created_at: string;
    title?: string;
    comment?: string;
    shipping_rating?: number;
    packaging_rating?: number;
    delivery_speed_rating?: number;
    customer_service_rating?: number;
    images?: string[];
    admin_response?: string;
    admin_response_at?: string;
    user?: {
        name: string;
        initials: string;
    };
}

// Track loading states for individual reviews
interface LoadingState {
    [reviewId: string]: {
        approve: boolean;
        reject: boolean;
        respond: boolean;
    };
}

// Fetch reviews with pagination - directly from URL params
const fetchReviews = async (params: {
    page: number;
    limit: number;
    review_type: string;
    search: string;
    status: string;
    rating: string;
    verified: string;
    sort_by: string;
    sort_order: string;
}): Promise<{
    data: {
        reviews: Review[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.review_type && params.review_type !== 'all') queryParams.append('review_type', params.review_type);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.rating) queryParams.append('rating', params.rating);
    if (params.verified) queryParams.append('verified', params.verified);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.products.reviews.adminReviewsList}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Approve review mutation
const approveReview = async (reviewId: string, reviewType: string) => {
    const response = await securityAxios.post(
        `${endpoints.products.reviews.adminReviewApprove.replace(":id", reviewId)}?type=${reviewType}`
    );
    return response.data;
};

// Reject review mutation
const rejectReview = async (reviewId: string, reviewType: string) => {
    const response = await securityAxios.post(
        `${endpoints.products.reviews.adminReviewReject.replace(":id", reviewId)}?type=${reviewType}`
    );
    return response.data;
};

// Bulk action mutation
const bulkReviewAction = async (reviewIds: string[], action: string, reviewType: 'product' | 'order') => {
    const response = await securityAxios.post(endpoints.products.reviews.adminReviewsBulkAction, {
        review_ids: reviewIds,
        action: action,
        type: reviewType,
    });
    return response.data;
};

// Add admin response to order review
const addAdminResponse = async (reviewId: string, response: string) => {
    const responseData = await securityAxios.post(
        `${endpoints.products.reviews.adminOrderReviewResponse}${reviewId}/response`,
        { response }
    );
    return responseData.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'review_type',
            type: 'select',
            placeholder: 'Review Type',
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'product', label: 'Products' },
                { value: 'order', label: 'Orders' },
            ],
            defaultValue: 'all',
            width: '140px',
        },
        {
            name: 'status',
            type: 'select',
            placeholder: 'Status',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
            defaultValue: '',
            width: '130px',
        },
        {
            name: 'rating',
            type: 'select',
            placeholder: 'Rating',
            options: [
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
            ],
            defaultValue: '',
            width: '120px',
        },
        {
            name: 'verified',
            type: 'select',
            placeholder: 'Verified Purchase',
            options: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
            ],
            defaultValue: '',
            width: '150px',
        },
    ],
    searchPlaceholder: 'Search by product title, order number, or user email...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'rating', label: 'Rating' },
        { value: 'helpful_yes', label: 'Most Helpful' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    urlParamPrefix: 'review',
};

// Main content component that uses useSearchParams
function AdminReviewsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const queryClient = useQueryClient();

    // State for sheets/dialogs
    const [viewingReview, setViewingReview] = useState<Review | null>(null);
    const [respondingToReview, setRespondingToReview] = useState<Review | null>(null);
    const [responseText, setResponseText] = useState('');

    // Track loading states for individual reviews
    const [loadingStates, setLoadingStates] = useState<LoadingState>({});

    // Track which bulk action is currently loading
    const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

    // Track refresh loading
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Build fetch params directly from URL
    const fetchParams = useMemo(() => {
        const sortBy = searchParams.get('review_sort_by') || 'created_at';
        const sortOrder = searchParams.get('review_sort_order') || 'desc';

        return {
            page: Number(searchParams.get('page')) || 1,
            limit: Number(searchParams.get('limit')) || 20,
            review_type: searchParams.get('review_review_type') || 'all',
            search: searchParams.get('search') || '',
            status: searchParams.get('review_status') || '',
            rating: searchParams.get('review_rating') || '',
            verified: searchParams.get('review_verified') || '',
            sort_by: sortBy,
            sort_order: sortOrder,
        };
    }, [searchParams]);

    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        variant: 'info' | 'success' | 'error';
        onConfirm: () => void;
        itemName?: string;
    }>({
        open: false,
        title: '',
        message: '',
        variant: 'error',
        onConfirm: () => { },
    });

    // Query for reviews
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-reviews', fetchParams],
        queryFn: () => fetchReviews(fetchParams),
    });

    // Set loading state for a specific review action
    const setReviewLoading = (reviewId: string, action: keyof LoadingState[string], isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [reviewId]: {
                ...prev[reviewId],
                [action]: isLoading,
            }
        }));
    };

    // Check if any action is loading for a specific review
    const isReviewLoading = (reviewId: string) => {
        const state = loadingStates[reviewId];
        if (!state) return false;
        return Object.values(state).some(isLoading => isLoading === true);
    };

    // Check if ANY action is loading globally (including bulk)
    const isAnyActionLoading = () => {
        if (activeBulkAction) return true;
        return Object.values(loadingStates).some(rowState =>
            rowState && Object.values(rowState).some(isLoading => isLoading === true)
        );
    };

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: ({ reviewId, reviewType }: { reviewId: string; reviewType: string }) =>
            approveReview(reviewId, reviewType),
        onSuccess: () => {
            toast.success('Review approved successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to approve review');
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ reviewId, reviewType }: { reviewId: string; reviewType: string }) =>
            rejectReview(reviewId, reviewType),
        onSuccess: () => {
            toast.success('Review rejected successfully');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to reject review');
        },
    });

    // Bulk action mutation
    const bulkActionMutation = useMutation({
        mutationFn: ({ reviewIds, action, reviewType }: { reviewIds: string[]; action: string; reviewType: 'product' | 'order' }) =>
            bulkReviewAction(reviewIds, action, reviewType),
        onSuccess: (response) => {
            const { data, message } = response;
            const { success_count, failed_count } = data;

            if (success_count > 0) {
                toast.success(message || `Processed ${success_count} reviews successfully`);
            }

            if (failed_count > 0) {
                const failedReasons = data.failed?.map((f: any) => `${f.id}: ${f.reason}`).join(', ') || '';
                toast.error(`${failed_count} failed: ${failedReasons}`);
            }

            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
        onSettled: () => {
            setActiveBulkAction(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Bulk action failed');
        },
    });

    // Add admin response mutation
    const responseMutation = useMutation({
        mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
            addAdminResponse(reviewId, response),
        onSuccess: () => {
            toast.success('Admin response added successfully');
            setRespondingToReview(null);
            setResponseText('');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to add response');
        },
    });

    // Pagination handlers - update URL
    const handlePageChange = (page: number) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleLimitChange = (limit: number) => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.set('limit', limit.toString());
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Refresh handler
    const handleRefresh = async () => {
        if (isAnyActionLoading()) {
            toast.error('Please wait for current action to complete');
            return;
        }
        setIsRefreshing(true);
        try {
            await refetch();
            toast.success('Reviews refreshed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Single action handlers
    const handleApprove = (review: Review) => {
        if (isAnyActionLoading()) return;

        const reviewType = review.type;
        const itemName = review.type === 'product'
            ? review.product_title || 'Product'
            : `Order ${review.order_number}`;

        setConfirmDialog({
            open: true,
            title: 'Approve Review',
            message: `Are you sure you want to approve this review for "${itemName}"? It will be visible to customers.`,
            variant: 'info',
            onConfirm: () => {
                setReviewLoading(review.id, 'approve', true);
                approveMutation.mutate({ reviewId: review.id, reviewType }, {
                    onSettled: () => {
                        setReviewLoading(review.id, 'approve', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName,
        });
    };

    const handleReject = (review: Review) => {
        if (isAnyActionLoading()) return;

        const reviewType = review.type;
        const itemName = review.type === 'product'
            ? review.product_title || 'Product'
            : `Order ${review.order_number}`;

        setConfirmDialog({
            open: true,
            title: 'Reject Review',
            message: `Are you sure you want to reject this review for "${itemName}"? It will not be visible to customers.`,
            variant: 'error',
            onConfirm: () => {
                setReviewLoading(review.id, 'reject', true);
                rejectMutation.mutate({ reviewId: review.id, reviewType }, {
                    onSettled: () => {
                        setReviewLoading(review.id, 'reject', false);
                    }
                });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
            itemName,
        });
    };

    const handleViewDetails = (review: Review) => {
        setViewingReview(review);
    };

    const handleAddResponse = (review: Review) => {
        if (isAnyActionLoading()) return;
        setRespondingToReview(review);
        setResponseText(review.admin_response || '');
    };

    // Determine bulk review type
    const determineBulkReviewType = (selectedItems: Review[]): 'product' | 'order' | null => {
        const types = [...new Set(selectedItems.map(i => i.type))];
        if (types.length === 1 && types[0]) {
            return types[0] as 'product' | 'order';
        }
        return null;
    };

    // Bulk actions
    const handleBulkApprove = (selectedItems: Review[]) => {
        if (isAnyActionLoading()) return;

        const reviewType = determineBulkReviewType(selectedItems);
        if (!reviewType) {
            toast.error('Cannot mix product and order reviews in bulk action');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Approve Reviews',
            message: `Are you sure you want to approve ${selectedItems.length} selected review${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'info',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('approve');
                bulkActionMutation.mutate({ reviewIds: ids, action: 'approve', reviewType });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkReject = (selectedItems: Review[]) => {
        if (isAnyActionLoading()) return;

        const reviewType = determineBulkReviewType(selectedItems);
        if (!reviewType) {
            toast.error('Cannot mix product and order reviews in bulk action');
            return;
        }

        setConfirmDialog({
            open: true,
            title: 'Bulk Reject Reviews',
            message: `Are you sure you want to reject ${selectedItems.length} selected review${selectedItems.length !== 1 ? 's' : ''}?`,
            variant: 'error',
            onConfirm: () => {
                const ids = selectedItems.map(i => i.id);
                setActiveBulkAction('reject');
                bulkActionMutation.mutate({ reviewIds: ids, action: 'reject', reviewType });
                setConfirmDialog({ ...confirmDialog, open: false });
            },
        });
    };

    const handleBulkExport = (selectedItems: Review[]) => {
        if (isAnyActionLoading()) return;

        const exportData = selectedItems.map(item => ({
            id: item.id,
            type: item.type,
            user_email: item.user_email,
            rating: item.rating || item.overall_rating,
            comment_preview: item.comment_preview,
            is_approved: item.is_approved,
            helpful_yes: item.helpful_yes,
            created_at: item.created_at,
            ...(item.type === 'product' && {
                product_title: item.product_title,
                is_verified_purchase: item.is_verified_purchase,
            }),
            ...(item.type === 'order' && {
                order_number: item.order_number,
            }),
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reviews_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} reviews`);
    };

    // Define actions for each review
    const getReviewActions = (review: Review): ActionItem[] => {
        const isAnyLoading = isAnyActionLoading();
        const isRowLoading = isReviewLoading(review.id);
        const isModifyDisabled = isAnyLoading;

        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => handleViewDetails(review),
            color: 'emerald',
            disabled: false,
        });

        if (!review.is_approved) {
            actions.push({
                label: 'Approve',
                icon: <CheckCircle size={14} />,
                onClick: () => handleApprove(review),
                color: 'emerald',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[review.id]?.approve,
            });

            actions.push({
                label: 'Reject',
                icon: <XCircle size={14} />,
                onClick: () => handleReject(review),
                color: 'rose',
                variant: 'destructive',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[review.id]?.reject,
            });
        }

        if (review.type === 'order' && review.is_approved && !review.admin_response) {
            actions.push({
                label: 'Add Response',
                icon: <Send size={14} />,
                onClick: () => handleAddResponse(review),
                color: 'blue',
                disabled: isModifyDisabled,
                loading: isRowLoading && loadingStates[review.id]?.respond,
            });
        }

        return actions;
    };

    // Bulk actions configuration
    const bulkActions = [
        {
            label: 'Approve Selected',
            icon: activeBulkAction === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />,
            onClick: handleBulkApprove,
            color: 'emerald' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Reject Selected',
            icon: activeBulkAction === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />,
            onClick: handleBulkReject,
            color: 'rose' as const,
            variant: 'destructive' as const,
            disabled: isAnyActionLoading(),
        },
        {
            label: 'Export Selected',
            icon: <Upload size={14} />,
            onClick: handleBulkExport,
            color: 'violet' as const,
            disabled: isAnyActionLoading(),
        },
    ];

    const reviews = data?.data?.reviews || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reviews Moderation</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Review and moderate customer feedback</p>
                </div>

                <div className="flex justify-between items-center">
                    <div></div>
                    <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                        {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </Button>
                </div>

                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading reviews: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reviews Moderation</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review and moderate customer feedback</p>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-between items-center">
                <div></div>
                <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                    {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh
                </Button>
            </div>

            {/* Filters and Sort - CustomFilter and CustomSortFromUrl have their own Suspense internally */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter config={filterConfig} />
                </div>
                <CustomSortFromUrl config={sortConfig} />
            </div>

            {/* Confirmation Dialog */}
            <InfoDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                infoMessage={confirmDialog.message}
                variant={confirmDialog.variant}
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                primaryAction={confirmDialog.onConfirm}
                secondaryAction={() => setConfirmDialog({ ...confirmDialog, open: false })}
            />

            {/* View Review Details Sheet */}
            <CustomSheet
                title="Review Details"
                description="Full review information"
                side="bottom"
                size="lg"
                open={!!viewingReview}
                onOpenChange={(open) => !open && setViewingReview(null)}
            >
                {viewingReview && (
                    <ReviewDetailCard
                        review={viewingReview}
                        onClose={() => setViewingReview(null)}
                        onApprove={!viewingReview.is_approved ? () => {
                            handleApprove(viewingReview);
                            setViewingReview(null);
                        } : undefined}
                        onReject={!viewingReview.is_approved ? () => {
                            handleReject(viewingReview);
                            setViewingReview(null);
                        } : undefined}
                        onAddResponse={viewingReview.type === 'order' && viewingReview.is_approved && !viewingReview.admin_response ?
                            () => handleAddResponse(viewingReview) : undefined}
                    />
                )}
            </CustomSheet>

            {/* Admin Response Dialog */}
            <CustomDialog
                title="Add Admin Response"
                description={`Respond to customer's review for ${respondingToReview?.type === 'order' ? `Order #${respondingToReview.order_number}` : respondingToReview?.product_title}`}
                open={!!respondingToReview}
                onOpenChange={(open) => !open && setRespondingToReview(null)}
                contentWidth="max-w-[600px]"
            >
                {respondingToReview && (
                    <AdminResponseForm
                        initialResponse={responseText}
                        onSubmit={(response) => {
                            setReviewLoading(respondingToReview.id, 'respond', true);
                            responseMutation.mutate({ reviewId: respondingToReview.id, response }, {
                                onSettled: () => {
                                    setReviewLoading(respondingToReview.id, 'respond', false);
                                }
                            });
                        }}
                        isSubmitting={responseMutation.isPending}
                        onCancel={() => setRespondingToReview(null)}
                    />
                )}
            </CustomDialog>

            {/* Data Table */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={reviews}
                        renderActions={(review: Review) => (
                            <ActionsDropdown
                                actions={getReviewActions(review)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select reviews to approve, reject, or export"
                        excludeColumns={['id', 'comment', 'helpful_no', 'user', 'title', 'shipping_rating', 'packaging_rating', 'delivery_speed_rating', 'customer_service_rating', 'images', 'admin_response', 'admin_response_at']}
                        dots={{
                            is_approved: {
                                true: 'emerald',
                                false: 'amber',
                            },
                            type: {
                                product: 'blue',
                                order: 'emerald',
                            },
                        }}
                        badges={{
                            is_verified_purchase: {
                                true: 'emerald',
                                false: 'zinc',
                            },
                        }}
                        emptyTitle="No Reviews Found"
                        emptyDescription="No reviews match your filter criteria. Try adjusting your filters."
                        onSelectionChange={(selected) => {
                            console.log('Selected reviews:', selected.length);
                        }}
                    />

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <CustomPagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                            showLimitSelector={true}
                            limitOptions={[10, 20, 50, 100]}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// Main exported component with Suspense boundary
export default function AdminReviewsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        }>
            <AdminReviewsPageContent />
        </Suspense>
    );
}