// app/dashboard/transactions/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    DollarSign, CreditCard, RefreshCw, Search, X,
    Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { DataDisplay } from '@/widgets/DataDisplay/DataDisplay';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { useRouter } from 'next/navigation';

// Types
interface Transaction {
    id: string;
    order_number?: string;
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

// Fetch transactions
const fetchTransactions = async (params?: any): Promise<{ data: { transactions: Transaction[]; total: number } }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page);
    if (params?.limit) queryParams.append('limit', params.limit);
    if (params?.type && params.type !== '') queryParams.append('type', params.type);
    if (params?.status && params.status !== '') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${endpoints.orders.adminTransactions}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

export default function TransactionsPage() {
    const router = useRouter();
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        page: 1,
        limit: 20,
    });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin-transactions', filters],
        queryFn: () => fetchTransactions(filters),
    });

    const getTransactionActions = (transaction: Transaction): ActionItem[] => {
        const actions: ActionItem[] = [];

        actions.push({
            label: 'View Details',
            icon: <Eye />,
            onClick: () => setViewingTransaction(transaction),
            color: 'blue',
        });

        if (transaction.order_number) {
            actions.push({
                label: 'View Order',
                icon: <DollarSign />,
                onClick: () => router.push(`/dashboard/orders/${transaction.order_number}`),
                color: 'violet',
            });
        }

        if (transaction.receipt_url) {
            actions.push({
                label: 'View Receipt',
                icon: <Eye />,
                onClick: () => window.open(transaction.receipt_url, '_blank'),
                color: 'emerald',
            });
        }

        return actions;
    };

    const transactions = data?.data?.transactions || [];
    const total = data?.data?.total || 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error loading transactions: {error?.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all payment transactions</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} className="gap-2 border-gray-300 dark:border-gray-700">
                    <RefreshCw size={14} />
                    Refresh
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by transaction ID, reference..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            className="pl-9 w-64 border-gray-200 dark:border-gray-800"
                        />
                    </div>
                    <select
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                    >
                        <option value="">All Types</option>
                        <option value="charge">Charge</option>
                        <option value="refund">Refund</option>
                        <option value="shipping">Shipping</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    {(filters.search || filters.type || filters.status) && (
                        <Button variant="ghost" size="sm" onClick={() => {
                            setFilters({ search: '', type: '', status: '', page: 1, limit: 20 });
                        }}>
                            <X size={14} className="mr-1" /> Reset
                        </Button>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {total} transactions
                </div>
            </div>

            {/* Data Table */}
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
                excludeColumns={['id', 'card_last4', 'card_brand', 'notes', 'refund_reason', 'parent_transaction_id', 'receipt_url', 'metadata']}
                badges={{
                    transaction_type: {
                        charge: 'emerald',
                        refund: 'rose',
                        shipping: 'blue',
                    },
                    status: {
                        pending: 'amber',
                        success: 'emerald',
                        failed: 'rose',
                        refunded: 'zinc',
                    },
                }}
                dots={{
                    transaction_type: {
                        charge: 'emerald',
                        refund: 'rose',
                        shipping: 'blue',
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
                    order_number: (transaction: Transaction) => `/dashboard/orders/${transaction.order_number}`,
                }}
                emptyTitle="No Transactions Found"
                emptyDescription="Transactions will appear here once orders are placed."
            />

            {/* Transaction Detail Sheet */}
            <CustomSheet
                title="Transaction Details"
                description={`Transaction ${viewingTransaction?.transaction_id}`}
                side="right"
                size="lg"
                open={!!viewingTransaction}
                onOpenChange={(open) => !open && setViewingTransaction(null)}
            >
                {viewingTransaction && (
                    <div className="space-y-6">
                        {/* Amount */}
                        <div className="text-center">
                            <div className="text-3xl font-bold">
                                {viewingTransaction.transaction_type === 'refund' ? '-' : ''}
                                ${viewingTransaction.amount.toFixed(2)} {viewingTransaction.currency}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {new Date(viewingTransaction.created_at).toLocaleString()}
                            </p>
                        </div>

                        {/* Transaction details using DataDisplay */}
                        <div className="border-t pt-4">
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
                            />
                        </div>

                        {/* Notes */}
                        {viewingTransaction.notes && (
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Notes</h4>
                                <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    {viewingTransaction.notes}
                                </p>
                            </div>
                        )}

                        {/* Refund Reason */}
                        {viewingTransaction.refund_reason && (
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Refund Reason</h4>
                                <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    {viewingTransaction.refund_reason}
                                </p>
                            </div>
                        )}

                        {/* Metadata - Using DataDisplay for object */}
                        {viewingTransaction.metadata && Object.keys(viewingTransaction.metadata).length > 0 && (
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Metadata</h4>
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                    <DataDisplay
                                        data={viewingTransaction.metadata}
                                        excludeKeys={[]}
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