'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Eye, RefreshCw, Copy, Info,
    Package, ShoppingCart, Users, Tag, Server
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';
import Link from 'next/link';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { DataDisplay } from '@/widgets/DataDisplay/DataDisplay';

// Types
interface LogEntry {
    id: string;
    app_name: string;
    action: string;
    severity: string;
    description: string;
    status_code: number;
    user_email: string | null;
    ip_address: string | null;
    path: string | null;
    method: string | null;
    extra_data: Record<string, any>;
    created_at: string;
}

// Fetch logs with pagination - hardcoded to common
const fetchLogs = async (params?: any): Promise<{
    data: {
        logs: LogEntry[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    queryParams.append('app_name', 'common');
    if (params?.severity && params.severity !== '') queryParams.append('severity', params.severity);
    if (params?.status_code && params.status_code !== '') queryParams.append('status_code', params.status_code);
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.common.logs}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Filter configuration
const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'severity',
            type: 'select',
            placeholder: 'All Severities',
            options: [
                { value: 'INFO', label: 'INFO' },
                { value: 'WARNING', label: 'WARNING' },
                { value: 'ERROR', label: 'ERROR' },
                { value: 'CRITICAL', label: 'CRITICAL' },
            ],
            defaultValue: '',
            width: '130px',
        },
        {
            name: 'status_code',
            type: 'select',
            placeholder: 'All Status',
            options: [
                { value: '200', label: '200 OK' },
                { value: '201', label: '201 Created' },
                { value: '400', label: '400 Bad Request' },
                { value: '401', label: '401 Unauthorized' },
                { value: '403', label: '403 Forbidden' },
                { value: '404', label: '404 Not Found' },
                { value: '429', label: '429 Rate Limited' },
                { value: '500', label: '500 Server Error' },
            ],
            defaultValue: '',
            width: '140px',
        },
    ],
    searchPlaceholder: 'Description ,action ,user email...',
    showSearch: true,
};

// Sort configuration
const sortConfig: SortConfig = {
    options: [
        { value: 'created_at', label: 'Date & Time' },
        { value: 'severity', label: 'Severity' },
        { value: 'status_code', label: 'Status Code' },
        { value: 'action', label: 'Action' },
    ],
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
};

// Severity badge mapping
const severityBadgeConfig: Record<string, 'emerald' | 'amber' | 'rose' | 'zinc'> = {
    INFO: 'emerald',
    WARNING: 'amber',
    ERROR: 'rose',
    CRITICAL: 'rose',
    DEBUG: 'zinc',
};

export default function LogsPage() {
    // State for dialogs
    const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
    const [viewingMetadata, setViewingMetadata] = useState<Record<string, any> | null>(null);

    // Filter and pagination state
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    });

    // Track applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        severity: '',
        status_code: '',
        search: '',
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    // Query for logs
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['logs', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchLogs({
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

    // Handle filter changes
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            ...appliedFilters,
            severity: newFilters.severity || '',
            status_code: newFilters.status_code || '',
            search: newFilters.search || '',
        });
        setFilters({ ...filters, page: 1 });
    };

    // Handle sort changes
    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setAppliedFilters({
            ...appliedFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
        });
        setFilters({ ...filters, page: 1 });
    };

    // Refresh handler
    const handleRefresh = () => {
        refetch();
        toast.success('Logs refreshed');
    };

    // Reset all filters
    const handleResetFilters = () => {
        setAppliedFilters({
            severity: '',
            status_code: '',
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setFilters({ page: 1, limit: filters.limit });
    };

    // Copy log
    const handleCopyLog = (log: LogEntry) => {
        const logText = JSON.stringify({
            id: log.id,
            timestamp: log.created_at,
            app: log.app_name,
            action: log.action,
            severity: log.severity,
            status_code: log.status_code,
            description: log.description,
            user: log.user_email,
            ip: log.ip_address,
            path: log.path,
            method: log.method,
            extra_data: log.extra_data,
        }, null, 2);
        navigator.clipboard.writeText(logText);
        toast.success('Log copied to clipboard');
    };

    // Row actions
    const getLogActions = (log: LogEntry): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => setViewingLog(log),
            color: 'blue',
        },
        {
            label: 'View Metadata',
            icon: <Info size={14} />,
            onClick: () => setViewingMetadata(log.extra_data),
            color: 'violet',
        },
        {
            label: 'Copy Log',
            icon: <Copy size={14} />,
            onClick: () => handleCopyLog(log),
        },
    ];

    const logs = data?.data?.logs || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">System Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor system activity across all applications</p>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1">
                        <CustomFilter
                            config={filterConfig}
                            filters={{
                                severity: appliedFilters.severity,
                                status_code: appliedFilters.status_code,
                                search: appliedFilters.search,
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

                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading logs: {(error as any)?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">System Logs</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monitor system activity across all applications</p>
            </div>

            <div className="flex justify-between items-center">

                <Link href="/dashboard/logs?app=common">
                    <Button variant="outline" size="sm">
                        View Statistics
                    </Button>
                </Link>
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter
                        config={filterConfig}
                        filters={{
                            severity: appliedFilters.severity,
                            status_code: appliedFilters.status_code,
                            search: appliedFilters.search,
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

            {/* View Details Dialog */}
            <CustomDialog
                title="Log Details"
                description={`Log entry from ${viewingLog?.created_at ? new Date(viewingLog.created_at).toLocaleString() : ''}`}
                open={!!viewingLog}
                onOpenChange={(open) => !open && setViewingLog(null)}
                contentWidth="max-w-3xl"
            >
                {viewingLog && <DataDisplay data={viewingLog} />}
            </CustomDialog>

            {/* View Metadata Dialog */}
            <CustomDialog
                title="Metadata"
                description="Additional log metadata"
                open={!!viewingMetadata}
                onOpenChange={(open) => !open && setViewingMetadata(null)}
                contentWidth="max-w-2xl"
            >
                {viewingMetadata && <DataDisplay data={viewingMetadata} />}
            </CustomDialog>

            {/* Data Table */}
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={logs}
                        renderActions={(log: LogEntry) => (
                            <ActionsDropdown
                                actions={getLogActions(log)}
                                maxVisible={2}
                                showLabels={false}
                                buttonSize="sm"
                            />
                        )}
                        excludeColumns={['id', 'extra_data', 'path', 'method']}
                        badges={{
                            severity: severityBadgeConfig,
                            status_code: {
                                200: 'emerald',
                                201: 'emerald',
                                400: 'amber',
                                401: 'amber',
                                403: 'amber',
                                404: 'amber',
                                429: 'orange',
                                500: 'rose',
                            },
                        }}

                        emptyTitle="No Logs Found"
                        emptyDescription="No logs match your filter criteria. Try adjusting your filters."
                    />

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