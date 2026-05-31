'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, BarChart3, PieChart, Activity, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { AlertMessage } from '@/widgets/alert-message/AlertMessage';
import { useSearchParams, useRouter } from 'next/navigation';

interface StatsData {
    period_days: number;
    app_name: string | null;
    total_logs: number;
    error_rate: number;
    client_errors: number;
    server_errors: number;
    logs_by_app: Record<string, number>;
    logs_by_severity: Record<string, number>;
    logs_by_action: Array<{ action: string; count: number }>;
    logs_by_status_code: Record<string, number>;
    daily_logs: Array<{ date: string; count: number }>;
    active_users: Array<{ user_email: string; count: number }>;
    top_paths: Array<{ path: string; count: number }>;
}

const SEVERITY_COLORS: Record<string, string> = {
    INFO: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    CRITICAL: '#dc2626',
    DEBUG: '#6b7280',
};

const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const fetchStats = async (appName?: string, days: number = 7): Promise<StatsData | null> => {
    try {
        const queryParams = new URLSearchParams();
        if (appName && appName !== '') queryParams.append('app_name', appName);
        queryParams.append('days', days.toString());
        const response = await securityAxios.get(`${endpoints.common.logsStats}?${queryParams.toString()}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return null;
    }
};

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3">
                <p className="text-gray-900 dark:text-white font-medium text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const KPICardSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader className="relative">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2" />
        </CardHeader>
    </Card>
);

const ChartSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-1" />
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        </CardContent>
    </Card>
);

// Main component that uses useSearchParams
function LogStatsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedApp, setSelectedApp] = useState<string>(searchParams.get('app') || '');
    const [selectedDays, setSelectedDays] = useState<number>(7);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const chartColors = {
        grid: isDarkMode ? '#374151' : '#e5e7eb',
        text: isDarkMode ? '#9ca3af' : '#6b7280',
    };

    const loadStats = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const data = await fetchStats(selectedApp || undefined, selectedDays);
            setStatsData(data);
        } catch (err) {
            setIsError(true);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [selectedApp, selectedDays]);

    const handleAppChange = (app: string) => {
        setSelectedApp(app);
        const params = new URLSearchParams(searchParams);
        if (app) {
            params.set('app', app);
        } else {
            params.delete('app');
        }
        router.push(`/dashboard/logs/stats?${params.toString()}`);
    };

    const handleRefresh = () => {
        loadStats();
        toast.success('Statistics refreshed');
    };

    const severityData = Object.entries(statsData?.logs_by_severity || {})
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }));

    const appData = Object.entries(statsData?.logs_by_app || {})
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }));

    const statusCodeData = Object.entries(statsData?.logs_by_status_code || {})
        .filter(([_, count]) => count > 0)
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => a.code.localeCompare(b.code));

    const actionData = (statsData?.logs_by_action || []).slice(0, 15);
    const userData = (statsData?.active_users || []).slice(0, 10);
    const pathData = (statsData?.top_paths || []).slice(0, 10);

    const dailyData = (statsData?.daily_logs || []).map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: item.count,
    }));

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Log Statistics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analytics and insights from system logs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <Button variant="outline" onClick={handleRefresh} className="gap-2">
                            <RefreshCw size={16} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900/50 inline-flex p-1 rounded-lg">
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">All Apps</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">System</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Products</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Orders</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Users</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => <KPICardSkeleton key={i} />)}
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Log Statistics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analytics and insights from system logs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <Button variant="outline" onClick={handleRefresh} className="gap-2">
                            <RefreshCw size={16} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900/50 inline-flex p-1 rounded-lg">
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">All Apps</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">System</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Products</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Orders</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Users</button>
                </div>

                <AlertMessage variant="error" message={`${error?.message || "Failed to load statistics"}`} />
            </div>
        );
    }

    if (!statsData) {
        return (
            <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Log Statistics</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analytics and insights from system logs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <Button variant="outline" onClick={handleRefresh} className="gap-2">
                            <RefreshCw size={16} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900/50 inline-flex p-1 rounded-lg">
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">All Apps</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">System</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Products</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Orders</button>
                    <button className="px-4 py-1 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400">Users</button>
                </div>

                <AlertMessage variant="info" message="No statistics data available for the selected period" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Log Statistics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analytics and insights from system logs</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* App Tabs */}
            <div className="bg-gray-100 dark:bg-gray-900/50 inline-flex p-1 rounded-lg">
                <button
                    onClick={() => handleAppChange('')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedApp === ''
                        ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    All Apps
                </button>
                <button
                    onClick={() => handleAppChange('common')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedApp === 'common'
                        ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    System
                </button>
                <button
                    onClick={() => handleAppChange('products')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedApp === 'products'
                        ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Products
                </button>
                <button
                    onClick={() => handleAppChange('orders')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedApp === 'orders'
                        ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Orders
                </button>
                <button
                    onClick={() => handleAppChange('users')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-all ${selectedApp === 'users'
                        ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Users
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-500 dark:text-gray-400">Total Logs</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">
                            {statsData.total_logs?.toLocaleString() || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-500 dark:text-gray-400">Error Rate</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums ${(statsData.error_rate || 0) > 5 ? 'text-rose-600 dark:text-rose-400' :
                            (statsData.error_rate || 0) > 2 ? 'text-amber-600 dark:text-amber-400' :
                                'text-emerald-600 dark:text-emerald-400'
                            }`}>
                            {statsData.error_rate || 0}%
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-500 dark:text-gray-400">Client Errors (4xx)</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                            {statsData.client_errors?.toLocaleString() || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-500 dark:text-gray-400">Server Errors (5xx)</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                            {statsData.server_errors?.toLocaleString() || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-500 dark:text-gray-400">Period</CardDescription>
                        <CardTitle className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
                            Last {statsData.period_days || 7} days
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-900/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                        <BarChart3 size={14} className="mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="distribution" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                        <PieChart size={14} className="mr-2" />
                        Distribution
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                        <Activity size={14} className="mr-2" />
                        Activity
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                        <Users size={14} className="mr-2" />
                        Users & Paths
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {dailyData.length > 0 && (
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-gray-900 dark:text-white">Daily Activity Trend</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Log volume over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                            <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                            <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {actionData.length > 0 && (
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-gray-900 dark:text-white">Top Actions</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Most frequent log actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={actionData} layout="vertical" margin={{ left: 140 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                            <XAxis type="number" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                            <YAxis type="category" dataKey="action" width={140} tick={{ fontSize: 12, fill: chartColors.text }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {severityData.length > 0 && (
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-900 dark:text-white">Logs by Severity</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">Distribution of log severity levels</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={severityData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} (${(percent! * 100).toFixed(0)}%)`}
                                                    labelLine={false}
                                                >
                                                    {severityData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || STATUS_COLORS[index % STATUS_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {severityData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.name] }} />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {statusCodeData.length > 0 && (
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-900 dark:text-white">Logs by Status Code</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">Distribution by HTTP status codes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={statusCodeData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                                <XAxis dataKey="code" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                    {statusCodeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={
                                                            entry.code.startsWith('2') ? '#10b981' :
                                                                entry.code.startsWith('4') ? '#f59e0b' :
                                                                    '#ef4444'
                                                        } />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Action Breakdown</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Detailed list of all actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200 dark:border-gray-700">
                                        <tr className="text-gray-500 dark:text-gray-400">
                                            <th className="text-left py-3 px-3 font-medium">Action</th>
                                            <th className="text-right py-3 px-3 font-medium">Count</th>
                                            <th className="text-right py-3 px-3 font-medium">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionData.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">{item.action}</td>
                                                <td className="text-right py-3 px-3 font-medium text-gray-900 dark:text-white">{item.count}</td>
                                                <td className="text-right py-3 px-3 text-gray-500 dark:text-gray-400">
                                                    {((item.count / (statsData.total_logs || 1)) * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {userData.length > 0 && (
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-900 dark:text-white">Most Active Users</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">Users with most log entries</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={userData} layout="vertical" margin={{ left: 160 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                                <XAxis type="number" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                                <YAxis type="category" dataKey="user_email" width={160} tick={{ fontSize: 11, fill: chartColors.text }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {pathData.length > 0 && (
                            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-900 dark:text-white">Most Accessed Paths</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">API endpoints with most requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={pathData} layout="vertical" margin={{ left: 200 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                                <XAxis type="number" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                                <YAxis type="category" dataKey="path" width={200} tick={{ fontSize: 10, fill: chartColors.text }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {userData.length > 0 && (
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">User Activity Summary</CardTitle>
                                <CardDescription className="text-gray-500 dark:text-gray-400">Detailed breakdown by user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-gray-200 dark:border-gray-700">
                                            <tr className="text-gray-500 dark:text-gray-400">
                                                <th className="text-left py-3 px-3 font-medium">User Email</th>
                                                <th className="text-right py-3 px-3 font-medium">Log Count</th>
                                                <th className="text-right py-3 px-3 font-medium">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userData.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{item.user_email}</td>
                                                    <td className="text-right py-3 px-3 font-medium text-gray-900 dark:text-white">{item.count}</td>
                                                    <td className="text-right py-3 px-3 text-gray-500 dark:text-gray-400">
                                                        {((item.count / (statsData.total_logs || 1)) * 100).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Main page component with Suspense boundary
export default function LogStatsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        }>
            <LogStatsContent />
        </Suspense>
    );
}