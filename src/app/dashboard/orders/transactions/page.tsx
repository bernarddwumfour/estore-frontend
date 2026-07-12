// app/dashboard/transactions/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    DollarSign, RefreshCw, Eye, TrendingUp, TrendingDown, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { DataDisplay } from '@/widgets/data-display/DataDisplay';
import { ActionItem, ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/custom-sort/CustomSort';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { formatCurrency } from '@/lib/currency';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

// Types
interface Transaction {
    id: string;
    order_number?: string;
    order_id?: string;
    transaction_type: string;
    transaction_type_display: string;
    transaction_id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    status_display: string;
    payment_method: string;
    created_at: string;
    completed_at: string | null;
    card_last4?: string;
    card_brand?: string;
    notes?: string;
    receipt_url?: string;
    refund_reason?: string;
    parent_transaction_id?: string;
    metadata?: Record<string, any>;
}

// Fetch transactions with pagination and filters
const fetchTransactions = async (params?: any): Promise<{
    data: {
        transactions: Transaction[];
        total: number;
        pagination: PaginationMeta;
        stats: {
            total_charges: number;
            total_refunds: number;
            net_revenue: number;
            successful_count: number;
            failed_count: number;
            pending_count: number;
        };
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.type && params.type !== '') queryParams.append('type', params.type);
    if (params?.status && params.status !== '') queryParams.append('status', params.status);
    if (params?.payment_method && params.payment_method !== '') queryParams.append('payment_method', params.payment_method);
    if (params?.date_range?.from) queryParams.append('date_from', params.date_range.from);
    if (params?.date_range?.to) queryParams.append('date_to', params.date_range.to);
    if (params?.amount_range?.min && params.amount_range.min !== '') queryParams.append('min_amount', params.amount_range.min);
    if (params?.amount_range?.max && params.amount_range.max !== '') queryParams.append('max_amount', params.amount_range.max);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/orders/admin/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Filter configuration - ALL filters now in CustomFilter
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'type',
            type: 'select',
            placeholder: 'Transaction Type',
            options: [
                { value: 'charge', label: 'Charge' },
                { value: 'refund', label: 'Refund' },
                { value: 'authorization', label: 'Authorization' },
                { value: 'shipping', label: 'Shipping' },
            ],
            defaultValue: '',
            width: '150px',
        },
        {
            name: 'status',
            type: 'select',
            placeholder: 'Status',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'success', label: 'Success' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
            ],
            defaultValue: '',
            width: '120px',
        },
        {
            name: 'payment_method',
            type: 'select',
            placeholder: 'Payment Method',
            options: [
                { value: 'paystack', label: 'Paystack' },
                { value: 'card', label: 'Card' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'mobile', label: 'Mobile Money' },
            ],
            defaultValue: '',
            width: '150px',
        },
        {
            name: 'date_range',
            type: 'date_range',
            placeholder: 'Date Range',
            defaultValue: undefined,
            width: '260px',
        },
        {
            name: 'amount_range',
            type: 'number_range',
            placeholder: 'Amount',
            defaultValue: { min: '', max: '' },
            width: '220px',
            min: 0,
            step: 0.01,
        },
    ],
    searchPlaceholder: 'Search by transaction ID, reference, or order number...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Created Date' },
        { value: 'amount', label: 'Amount' },
        { value: 'status', label: 'Status' },
        { value: 'transaction_type', label: 'Type' },
        { value: 'completed_at', label: 'Completed Date' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters - matches the filterConfig structure
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        type: '',
        status: '',
        payment_method: '',
        date_range: undefined,
        amount_range: { min: '', max: '' },
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    // Query for transactions
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-transactions', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchTransactions({
            page: filters.page,
            limit: filters.limit,
            ...appliedFilters,
        }),
    });

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    const handleLimitChange = (limit: number) => {
        setFilters({ page: 1, limit });
    };

    // Handle filter changes from CustomFilter
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            ...appliedFilters,
            search: newFilters.search || '',
            type: newFilters.type || '',
            status: newFilters.status || '',
            payment_method: newFilters.payment_method || '',
            date_range: newFilters.date_range,
            amount_range: newFilters.amount_range || { min: '', max: '' },
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle sort changes from CustomSort
    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setAppliedFilters({
            ...appliedFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            search: '',
            type: '',
            status: '',
            payment_method: '',
            date_range: undefined,
            amount_range: { min: '', max: '' },
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Refresh handler
    const handleRefresh = () => refetch();

    // Export transactions
    const handleExport = (selectedItems: Transaction[]) => {
        const exportData = selectedItems.map(item => ({
            transaction_id: item.transaction_id,
            reference: item.reference,
            order_number: item.order_number,
            type: item.transaction_type,
            status: item.status,
            amount: item.amount,
            currency: item.currency,
            payment_method: item.payment_method,
            created_at: item.created_at,
            completed_at: item.completed_at,
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedItems.length} transactions`);
    };

    // Row actions
    const getTransactionActions = (transaction: Transaction): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingTransaction(transaction),
            color: 'blue',
        });

        if (transaction.order_number) {
            actions.push({
                label: 'View Order',
                icon: <DollarSign size={14} />,
                onClick: () => router.push(`/dashboard/orders/${transaction.order_number}`),
                color: 'violet',
            });
        }

        if (transaction.receipt_url) {
            actions.push({
                label: 'View Receipt',
                icon: <Eye size={14} />,
                onClick: () => window.open(transaction.receipt_url, '_blank'),
                color: 'emerald',
            });
        }

        return actions;
    };

    // Bulk actions
    const bulkActions = [
        { label: 'Export Selected', icon: <Download size={14} />, onClick: handleExport, color: 'blue' as const },
    ];

    const transactions = data?.data?.transactions || [];
    const pagination = data?.data?.pagination;
    const stats = data?.data?.stats;

    // Error state - Keep UI visible
    if (isError) {
        return (
            <div className="space-y-6">
                {/* Header - Always visible */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all payment transactions</p>
                </div>

                {/* Stats Cards Skeleton - Show placeholder stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Refresh Button - Always visible */}
                <div className="flex justify-end">
                    <RefreshButton onRefresh={handleRefresh} successMessage="Transactions refreshed" />
                </div>

                {/* Filters and Sort - Always visible */}
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                search: appliedFilters.search,
                                type: appliedFilters.type,
                                status: appliedFilters.status,
                                payment_method: appliedFilters.payment_method,
                                date_range: appliedFilters.date_range,
                                amount_range: appliedFilters.amount_range,
                            }}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </div>
                    <CustomSort
                        config={sortConfig}
                        onSortChange={handleSortChange}
                    />
                </div>

                {/* Error Message */}
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading transactions: {error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header - Always visible */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all payment transactions</p>
            </div>

            {/* Stats Cards - Always visible (show actual stats when available, skeleton fallback while loading) */}
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Charges</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.total_charges)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Refunds</p>
                                <p className="text-2xl font-bold text-rose-600">
                                    {formatCurrency(stats.total_refunds)}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-rose-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Net Revenue</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(stats.net_revenue)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.successful_count}</p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200">
                                Success
                            </Badge>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                                <p className="text-2xl font-bold text-rose-600">{stats.failed_count}</p>
                            </div>
                            <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200">
                                Failed
                            </Badge>
                        </div>
                    </div>
                </div>
            ) : (
                /* Stats Cards Skeleton while loading */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Refresh Button - Always visible */}
            <div className="flex justify-end">
                <RefreshButton onRefresh={handleRefresh} successMessage="Transactions refreshed" />
            </div>

            {/* Filters and Sort Row - Always visible and interactive */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            search: appliedFilters.search,
                            type: appliedFilters.type,
                            status: appliedFilters.status,
                            payment_method: appliedFilters.payment_method,
                            date_range: appliedFilters.date_range,
                            amount_range: appliedFilters.amount_range,
                        }}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>
                <CustomSort
                    config={sortConfig}
                    onSortChange={handleSortChange}
                />
            </div>

            {/* Data Table or Skeleton - Only this shows loading state */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={transactions}
                        renderActions={(transaction: Transaction) => (
                            <ActionsDropdown
                                actions={getTransactionActions(transaction)}
                                maxVisible={3}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        bulkActions={bulkActions}
                        bulkActionsMessage="Select transactions to export"
                        excludeColumns={['id', 'card_last4', 'card_brand', 'notes', 'refund_reason', 'parent_transaction_id', 'receipt_url', 'metadata']}
                        dots={{
                            transaction_type: {
                                charge: 'emerald',
                                refund: 'rose',
                                shipping: 'blue',
                                authorization: 'amber',
                            },
                            status: {
                                pending: 'amber',
                                success: 'emerald',
                                failed: 'rose',
                                refunded: 'zinc',
                            },
                        }}
                        badges={{
                            transaction_type: {
                                charge: 'emerald',
                                refund: 'rose',
                                shipping: 'blue',
                                authorization: 'amber',
                            },
                            status: {
                                pending: 'amber',
                                success: 'emerald',
                                failed: 'rose',
                                refunded: 'zinc',
                            },
                        }}
                        links={{
                            transaction_id: (transaction: Transaction) => `/dashboard/transactions/${transaction.transaction_id}`,
                            order_number: (transaction: Transaction) => transaction.order_number ? `/dashboard/orders/${transaction.order_number}` : "",
                        }}
                        emptyTitle="No Transactions Found"
                        emptyDescription="Transactions will appear here once orders are placed."
                        onSelectionChange={(selected) => console.log('Selected transactions:', selected.length)}
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

            {/* Transaction Detail Sheet */}
            <CustomSheet
                title="Transaction Details"
                description={`Transaction ${viewingTransaction?.transaction_id || ''}`}
                side="right"
                size="lg"
                open={!!viewingTransaction}
                onOpenChange={(open) => !open && setViewingTransaction(null)}
            >
                {viewingTransaction && (
                    <div className="space-y-6 p-4">
                        {/* Amount */}
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className={`text-3xl font-bold ${viewingTransaction.transaction_type === 'refund' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {viewingTransaction.transaction_type === 'refund' ? '-' : '+'}
                                {formatCurrency(viewingTransaction.amount)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(viewingTransaction.created_at).toLocaleString()}
                            </p>
                        </div>

                        {/* Transaction details using DataDisplay */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                            <DataDisplay
                                data={{
                                    "Transaction ID": viewingTransaction.transaction_id,
                                    "Reference": viewingTransaction.reference || '—',
                                    "Order Number": viewingTransaction.order_number || '—',
                                    "Type": viewingTransaction.transaction_type_display,
                                    "Status": viewingTransaction.status_display,
                                    "Payment Method": viewingTransaction.payment_method || '—',
                                    "Card": viewingTransaction.card_brand && viewingTransaction.card_last4
                                        ? `${viewingTransaction.card_brand} •••• ${viewingTransaction.card_last4}`
                                        : '—',
                                    "Completed At": viewingTransaction.completed_at
                                        ? new Date(viewingTransaction.completed_at).toLocaleString()
                                        : '—',
                                }}
                                excludeKeys={[]}
                                className="text-sm"
                            />
                        </div>

                        {/* Notes */}
                        {viewingTransaction.notes && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    {viewingTransaction.notes}
                                </p>
                            </div>
                        )}

                        {/* Refund Reason */}
                        {viewingTransaction.refund_reason && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Refund Reason</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    {viewingTransaction.refund_reason}
                                </p>
                            </div>
                        )}

                        {/* Metadata */}
                        {viewingTransaction.metadata && Object.keys(viewingTransaction.metadata).length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</h4>
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                    <DataDisplay
                                        data={viewingTransaction.metadata}
                                        excludeKeys={[]}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Receipt Link */}
                        {viewingTransaction.receipt_url && (
                            <Button variant="outline" className="w-full" asChild>
                                <a href={viewingTransaction.receipt_url} target="_blank" rel="noopener noreferrer">
                                    View Receipt
                                </a>
                            </Button>
                        )}
                    </div>
                )}
            </CustomSheet>
        </div>
    );
}
