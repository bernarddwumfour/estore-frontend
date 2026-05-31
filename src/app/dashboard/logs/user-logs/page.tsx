'use client';

import React, { ReactNode, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Eye, RefreshCw, Copy, Info,
    Package, ShoppingCart, Users, Tag, Server
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomSort, SortConfig } from '@/widgets/CustomSort/CustomSort';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';
import Link from 'next/link';

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

// Fetch logs with pagination - always filtered by products app
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
    // Always filter by products app
    queryParams.append('app_name', 'products');
    if (params?.severity && params.severity !== '') queryParams.append('severity', params.severity);
    if (params?.status_code && params.status_code !== '') queryParams.append('status_code', params.status_code);
    if (params?.search && params.search !== '') queryParams.append('search', params.search);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${endpoints.common.logs}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await securityAxios.get(url);
    return response.data;
};

// Fetch single log detail
const fetchLogDetail = async (logId: string): Promise<any> => {
    const response = await securityAxios.get(endpoints.common.logsDetail.replace(":id", logId));
    return response.data;
};

// Fetch stats
const fetchLogStats = async (days?: number): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append('app_name', 'products');
    if (days) queryParams.append('days', days.toString());
    const response = await securityAxios.get(`${endpoints.common.logsStats}?${queryParams.toString()}`);
    return response.data;
};

// Filter configuration - No app filter since it's fixed to products
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
    searchPlaceholder: 'Search by description, action, or user email...',
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

export default function ProductsLogsPage() {
    const queryClient = useQueryClient();

    // State for sheets/dialogs
    const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
    const [logDetailData, setLogDetailData] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [statsDialogOpen, setStatsDialogOpen] = useState(false);
    const [statsData, setStatsData] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

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
        queryKey: ['products-logs', filters.page, filters.limit, appliedFilters],
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
        toast.success('Product logs refreshed');
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

    // View log details
    const handleViewLog = async (log: LogEntry) => {
        setViewingLog(log);
        setIsDetailLoading(true);
        try {
            const response = await fetchLogDetail(log.id);
            setLogDetailData(response.data);
        } catch (error) {
            toast.error('Failed to load log details');
            setLogDetailData(log);
        } finally {
            setIsDetailLoading(false);
        }
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
        }, null, 2);
        navigator.clipboard.writeText(logText);
        toast.success('Log copied to clipboard');
    };

    // View stats
    const handleViewStats = async () => {
        setStatsDialogOpen(true);
        setStatsLoading(true);
        try {
            const response = await fetchLogStats(7);
            setStatsData(response.data);
        } catch (error) {
            toast.error('Failed to load statistics');
        } finally {
            setStatsLoading(false);
        }
    };

    // Build stats message for InfoDialog
    const getStatsMessage = () => {
        if (!statsData) return '';
        let message = `Total Logs: ${statsData.total_logs}\nError Rate: ${statsData.error_rate}%\n\nBy Severity:\n`;
        if (statsData.logs_by_severity) {
            message += Object.entries(statsData.logs_by_severity).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        return message;
    };

    // Row actions
    const getLogActions = (log: LogEntry): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => handleViewLog(log),
            color: 'blue',
        },
        {
            label: 'Copy Log',
            icon: <Copy size={14} />,
            onClick: () => handleCopyLog(log),
            color: 'violet',
        },
    ];

    const logs = data?.data?.logs || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor product-related system activity</p>
                </div>

                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button onClick={handleViewStats} variant="outline" className="gap-2">
                        <Info size={16} />
                        Statistics
                    </Button>
                </div>

                <div className="flex flex-wrap gap-64 items-start justify-between">
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products Logs</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monitor product-related system activity including inventory, variants, categories, and reviews</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button onClick={handleViewStats} variant="outline" className="gap-2">
                        <Info size={16} />
                        Statistics
                    </Button>
                </div>
                <Link href="/dashboard/logs">
                    <Button variant="outline" size="sm">
                        All Logs
                    </Button>
                </Link>
            </div>

            <div className="flex flex-wrap gap-64 items-start justify-between">
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

            <InfoDialog
                open={statsDialogOpen}
                onOpenChange={setStatsDialogOpen}
                title="Products Log Statistics"
                infoMessage={statsLoading ? "Loading statistics..." : getStatsMessage()}
                variant="info"
                primaryButtonText="Close"
                primaryAction={() => setStatsDialogOpen(false)}
            />

            <CustomSheet
                title="Log Details"
                description="Full log entry information"
                side="bottom"
                size="lg"
                open={!!viewingLog}
                onOpenChange={(open) => !open && setViewingLog(null)}
            >
                {isDetailLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (logDetailData || viewingLog) && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">ID</label>
                                <p className="text-gray-900 dark:text-white font-mono break-all">{(logDetailData || viewingLog)?.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                                <p className="text-gray-900 dark:text-white">{new Date((logDetailData || viewingLog)?.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Action</label>
                                <p className="text-gray-900 dark:text-white">{(logDetailData || viewingLog)?.action}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Severity</label>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${(logDetailData || viewingLog)?.severity === 'ERROR' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                    (logDetailData || viewingLog)?.severity === 'WARNING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}>
                                    {(logDetailData || viewingLog)?.severity}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status Code</label>
                                <p className="text-gray-900 dark:text-white">{(logDetailData || viewingLog)?.status_code}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">User</label>
                                <p className="text-gray-900 dark:text-white">{(logDetailData || viewingLog)?.user_email || 'Anonymous'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">IP Address</label>
                                <p className="text-gray-900 dark:text-white font-mono">{(logDetailData || viewingLog)?.ip_address || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Path</label>
                                <p className="text-gray-900 dark:text-white font-mono break-all">{(logDetailData || viewingLog)?.path || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Method</label>
                                <p className="text-gray-900 dark:text-white">{(logDetailData || viewingLog)?.method || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">{(logDetailData || viewingLog)?.description}</p>
                        </div>
                        {(logDetailData || viewingLog)?.extra_data && Object.keys((logDetailData || viewingLog)?.extra_data || {}).length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Extra Data</label>
                                <pre className="text-xs mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-64">
                                    {JSON.stringify((logDetailData || viewingLog)?.extra_data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </CustomSheet>

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
                        excludeColumns={['id', 'extra_data', 'path', 'method', 'app_name']}
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

                        emptyTitle="No Product Logs Found"
                        emptyDescription="No product-related logs match your filter criteria. Try adjusting your filters."
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