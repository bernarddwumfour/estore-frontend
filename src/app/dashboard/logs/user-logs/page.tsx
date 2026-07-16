// app/dashboard/users/logs/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    Eye, RefreshCw, Copy, Info, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomSheet } from '@/widgets/custom-sheet/CustomSheet';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl, SortConfig } from '@/widgets/custom-sort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
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

// Fetch logs with pagination - filtered by users app
const fetchLogs = async (params: {
    page: number;
    limit: number;
    severity: string;
    status_code: string;
    search: string;
    sort_by: string;
    sort_order: string;
}): Promise<{
    data: {
        logs: LogEntry[];
        total: number;
        pagination: PaginationMeta;
    }
}> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    queryParams.append('app_name', 'users');
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.status_code) queryParams.append('status_code', params.status_code);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

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
    queryParams.append('app_name', 'users');
    if (days) queryParams.append('days', days.toString());
    const response = await securityAxios.get(`${endpoints.common.logsStats}?${queryParams.toString()}`);
    return response.data;
};

// Filter configuration - No app filter since it's fixed to users
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
    urlParamPrefix: 'log',
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
    urlParamPrefix: 'log',
};

// Severity badge mapping
const severityBadgeConfig: Record<string, 'emerald' | 'amber' | 'rose' | 'zinc'> = {
    INFO: 'emerald',
    WARNING: 'amber',
    ERROR: 'rose',
    CRITICAL: 'rose',
    DEBUG: 'zinc',
};

// Main content component that uses useSearchParams
function UsersLogsPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for sheets/dialogs
    const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
    const [logDetailData, setLogDetailData] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [statsDialogOpen, setStatsDialogOpen] = useState(false);
    const [statsData, setStatsData] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Track refresh loading
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Build fetch params directly from URL
    const fetchParams = useMemo(() => {
        const sortBy = searchParams.get('log_sort_by') || 'created_at';
        const sortOrder = searchParams.get('log_sort_order') || 'desc';

        return {
            page: Number(searchParams.get('page')) || 1,
            limit: Number(searchParams.get('limit')) || 20,
            severity: searchParams.get('log_severity') || '',
            status_code: searchParams.get('log_status_code') || '',
            search: searchParams.get('search') || '',
            sort_by: sortBy,
            sort_order: sortOrder,
        };
    }, [searchParams]);

    // Query for logs
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users-logs', fetchParams],
        queryFn: () => fetchLogs(fetchParams),
    });

    // Check if any action is loading
    const isAnyActionLoading = () => {
        return isRefreshing || isDetailLoading || statsLoading;
    };

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
            toast.success('Users logs refreshed');
        } finally {
            setIsRefreshing(false);
        }
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

    // Copy log (no API call)
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
        if (!statsData) return 'No statistics available';
        let message = `Total Logs: ${statsData.total_logs}\nError Rate: ${statsData.error_rate}%\n\nBy Severity:\n`;
        if (statsData.logs_by_severity) {
            message += Object.entries(statsData.logs_by_severity).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        return message;
    };

    // Row actions - view actions always enabled
    const getLogActions = (log: LogEntry): ActionItem[] => [
        {
            label: 'View Details',
            icon: <Eye size={14} />,
            onClick: () => handleViewLog(log),
            color: 'blue',
            disabled: false,
        },
        {
            label: 'Copy Log',
            icon: <Copy size={14} />,
            onClick: () => handleCopyLog(log),
            color: 'violet',
            disabled: false,
        },
    ];

    const logs = data?.data?.logs || [];
    const pagination = data?.data?.pagination;

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Users Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor user-related system activity</p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Refresh
                        </Button>
                        <Button onClick={handleViewStats} variant="outline" className="gap-2" disabled={statsLoading}>
                            {statsLoading ? <Loader2 size={16} className="animate-spin" /> : <Info size={16} />}
                            Statistics
                        </Button>
                    </div>
                    <Link href="/dashboard/logs">
                        <Button variant="outline" size="sm">
                            All Logs
                        </Button>
                    </Link>
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Users Logs</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monitor user-related system activity including authentication, profiles, and permissions</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isAnyActionLoading()}>
                        {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </Button>
                    <Button onClick={handleViewStats} variant="outline" className="gap-2" disabled={statsLoading}>
                        {statsLoading ? <Loader2 size={16} className="animate-spin" /> : <Info size={16} />}
                        Statistics
                    </Button>
                </div>
                <Link href="/dashboard/logs">
                    <Button variant="outline" size="sm">
                        All Logs
                    </Button>
                </Link>
            </div>

            {/* Filters and Sort - CustomFilter and CustomSortFromUrl have their own Suspense internally */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1">
                    <CustomFilter config={filterConfig} />
                </div>
                <CustomSortFromUrl config={sortConfig} />
            </div>

            <InfoDialog
                open={statsDialogOpen}
                onOpenChange={setStatsDialogOpen}
                title="Users Log Statistics"
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
                        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
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
                        emptyTitle="No User Logs Found"
                        emptyDescription="No user-related logs match your filter criteria. Try adjusting your filters."
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
export default function UsersLogsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        }>
            <UsersLogsPageContent />
        </Suspense>
    );
}