// app/dashboard/orders/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TrendingUp, TrendingDown, Package, DollarSign, Star,
    AlertTriangle, Layers, Target, Activity, Award, BadgePercent, Zap,
    RefreshCw, Eye, ShoppingCart, Wallet, Loader2, Clock, Calendar,
    Truck, CreditCard, Users, Repeat, FileText, Download, Filter,
    BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency as formatCurrencyValue } from '@/lib/currency';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { addDays, format } from 'date-fns';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { DateRangePicker } from '@/widgets/date-picker/DateRangePicker';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

// ==================== Types ====================

interface OrderSummaryStats {
    summary: {
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
        total_items_sold: number;
        paid_orders: number;
        paid_revenue: number;
        unpaid_orders: number;
        unpaid_revenue: number;
    };
    customer_breakdown: {
        registered_orders: number;
        guest_orders: number;
        registered_customers: number;
        guest_customers: number;
        registered_percentage: number;
        guest_percentage: number;
    };
    payment_method_stats: Record<string, {
        count: number;
        revenue: number;
        percentage: number;
    }>;
    payment_type_stats: {
        online: { count: number; revenue: number };
        pod: { count: number; revenue: number };
    };
}

interface SalesTrend {
    period: string;
    revenue: number;
    orders: number;
    items_sold: number;
    average_order_value: number;
}

interface StatusDistribution {
    [key: string]: {
        count: number;
        label: string;
        percentage: number;
    };
}

interface TopCustomer {
    customer_id: string | null;
    email: string;
    name: string;
    type: string;
    total_spent: number;
    order_count: number;
    average_order_value: number;
    first_order: string | null;
    last_order: string | null;
}

interface FulfillmentAnalytics {
    shipping_methods: Array<{
        method: string;
        count: number;
        revenue: number;
        percentage: number;
    }>;
    fulfillment_times: {
        average_fulfillment_days: number;
        average_delivery_days: number;
        total_fulfillment_time_days: number;
    };
    fulfillment_status: {
        pending: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
}

interface RefundAnalytics {
    summary: {
        refunded_orders: number;
        refunded_amount: number;
        total_refunded: number;
        refund_rate: number;
        refund_transactions: number;
    };
    refund_reasons: Array<{
        reason: string;
        count: number;
        amount: number;
    }>;
}

interface CustomerRetention {
    customer_segments: {
        one_time_buyers: number;
        repeat_customers: number;
        frequent_customers: number;
        one_time_percentage: number;
        repeat_percentage: number;
    };
    retention_metrics: {
        total_customers: number;
        average_orders_per_customer: number;
        average_customer_lifetime_value: number;
        repeat_purchase_rate: number;
    };
}

interface HourlyDistribution {
    hour: number;
    display_hour: string;
    orders: number;
    revenue: number;
}

interface DayOfWeekDistribution {
    day: string;
    day_index: number;
    orders: number;
    revenue: number;
    percentage: number;
}

// ==================== Helper Functions ====================

const formatCurrency = (value: number) => {
    return formatCurrencyValue(value, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
};

const formatCompactNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value);
};

// ==================== Custom Tooltip ====================

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

// ==================== Loading Skeletons ====================

const KPICardSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
        </CardContent>
    </Card>
);

const ChartSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
            <div className="h-[350px] w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        </CardContent>
    </Card>
);

const TableSkeleton = () => (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
        <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                ))}
            </div>
        </CardContent>
    </Card>
);

// ==================== KPI Cards Component ====================

interface KPICardsProps {
    orderSummary?: OrderSummaryStats;
    fulfillment?: FulfillmentAnalytics;
    refunds?: RefundAnalytics;
    retention?: CustomerRetention;
    isLoading: boolean;
}

const KPICards = ({ orderSummary, fulfillment, refunds, retention, isLoading }: KPICardsProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <KPICardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <>
            {/* First Row KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatNumber(orderSummary?.summary.total_orders || 0)}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                        {orderSummary?.summary.paid_orders || 0} Paid
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                        {orderSummary?.summary.unpaid_orders || 0} Unpaid
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(orderSummary?.summary.total_revenue || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatNumber(orderSummary?.summary.total_items_sold || 0)} items sold
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Order Value</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(orderSummary?.summary.average_order_value || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Per transaction
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Retention</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {retention?.retention_metrics.repeat_purchase_rate || 0}%
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                        {retention?.customer_segments.repeat_customers || 0} Returning
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                                        {retention?.customer_segments.one_time_buyers || 0} One-time
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered vs Guest</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {orderSummary?.customer_breakdown.registered_percentage || 0}%
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                                        {orderSummary?.customer_breakdown.registered_customers || 0} Registered
                                    </Badge>
                                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600">
                                        {orderSummary?.customer_breakdown.guest_customers || 0} Guest
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Refund Rate</p>
                                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                                    {refunds?.summary.refund_rate || 0}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatCurrency(refunds?.summary.total_refunded || 0)} refunded
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                                <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Fulfillment Time</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {fulfillment?.fulfillment_times.average_fulfillment_days || 0} days
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    +{fulfillment?.fulfillment_times.average_delivery_days || 0} days delivery
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Online vs POD</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {orderSummary?.payment_type_stats.online.count || 0} / {orderSummary?.payment_type_stats.pod.count || 0}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                        Online: {formatCurrency(orderSummary?.payment_type_stats.online.revenue || 0)}
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                                        POD: {formatCurrency(orderSummary?.payment_type_stats.pod.revenue || 0)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

// ==================== Overview Summary Cards Component ====================

interface OverviewSummaryCardsProps {
    orderSummary?: OrderSummaryStats;
    isLoading: boolean;
}

const OverviewSummaryCards = ({ orderSummary, isLoading }: OverviewSummaryCardsProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Items Sold</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatNumber(orderSummary?.summary.total_items_sold || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units across all orders</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paid Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatCurrency(orderSummary?.summary.paid_revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from {orderSummary?.summary.paid_orders || 0} orders</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unpaid Revenue</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {formatCurrency(orderSummary?.summary.unpaid_revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from {orderSummary?.summary.unpaid_orders || 0} orders</p>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Revenue Trend Chart Component ====================

interface RevenueTrendChartProps {
    data: Array<{ period: string; revenue: number; orders: number; items_sold: number }>;
    isLoading: boolean;
    chartColors: { grid: string; text: string };
    interval: string;
    onIntervalChange: (interval: string) => void;
}

const RevenueTrendChart = ({ data, isLoading, chartColors, interval, onIntervalChange }: RevenueTrendChartProps) => {
    if (isLoading) return <ChartSkeleton />;
    if (!data.length) return null;

    return (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">Revenue & Orders Trend</CardTitle>
                <Select value={interval} onValueChange={onIntervalChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Interval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                            <XAxis dataKey="period" tick={{ fill: chartColors.text, fontSize: 12 }} />
                            <YAxis yAxisId="left" tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={(v) => formatCompactNumber(v)} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                            <Legend wrapperStyle={{ color: chartColors.text }} />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0088FE" name="Revenue" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#00C49F" name="Orders" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// ==================== Payment Methods Component ====================

interface PaymentMethodsProps {
    data?: Record<string, { count: number; revenue: number; percentage: number }>;
    isLoading: boolean;
}

const PaymentMethodsSection = ({ data, isLoading }: PaymentMethodsProps) => {
    if (isLoading) return <ChartSkeleton />;
    if (!data) return null;

    const paymentMethodData = Object.entries(data).map(([key, value]) => ({
        method: key,
        count: value.count,
        revenue: value.revenue,
        percentage: value.percentage,
    }));

    return (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {paymentMethodData.map((method) => (
                        <div key={method.method}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-900 dark:text-white capitalize">{method.method}</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {formatCurrency(method.revenue)} ({method.percentage}%)
                                </span>
                            </div>
                            <Progress value={method.percentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{method.count} orders</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// ==================== Top Customers Table Component ====================

interface TopCustomersTableProps {
    data?: TopCustomer[];
    isLoading: boolean;
}

const TopCustomersTable = ({ data, isLoading }: TopCustomersTableProps) => {
    if (isLoading) return <TableSkeleton />;

    return (
        <DataTable
            data={data as any || []}
            excludeColumns={['customer_id']}
            emptyTitle="No Customer Data"
            emptyDescription="No customer data available for the selected period."
        />
    );
};

// ==================== Fulfillment Section Component ====================

interface FulfillmentSectionProps {
    data?: FulfillmentAnalytics;
    isLoading: boolean;
}

const FulfillmentSection = ({ data, isLoading }: FulfillmentSectionProps) => {
    if (isLoading) return <TableSkeleton />;

    return (
        <>
            {/* Fulfillment Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-amber-600">{data?.fulfillment_status.pending || 0}</p>
                        <p className="text-sm text-gray-500">Pending Fulfillment</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-blue-600">{data?.fulfillment_status.shipped || 0}</p>
                        <p className="text-sm text-gray-500">Shipped</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{data?.fulfillment_status.delivered || 0}</p>
                        <p className="text-sm text-gray-500">Delivered</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-rose-600">{data?.fulfillment_status.cancelled || 0}</p>
                        <p className="text-sm text-gray-500">Cancelled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Fulfillment Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Average Fulfillment Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Order to Shipment</span>
                                    <span className="font-medium">{data?.fulfillment_times.average_fulfillment_days || 0} days</span>
                                </div>
                                <Progress value={((data?.fulfillment_times.average_fulfillment_days || 0) / 14) * 100} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Shipment to Delivery</span>
                                    <span className="font-medium">{data?.fulfillment_times.average_delivery_days || 0} days</span>
                                </div>
                                <Progress value={((data?.fulfillment_times.average_delivery_days || 0) / 10) * 100} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total Fulfillment Time</span>
                                    <span className="font-medium">{data?.fulfillment_times.total_fulfillment_time_days || 0} days</span>
                                </div>
                                <Progress value={((data?.fulfillment_times.total_fulfillment_time_days || 0) / 20) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Shipping Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.shipping_methods.map((method) => (
                                <div key={method.method}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{method.method}</span>
                                        <span>{method.count} orders ({method.percentage}%)</span>
                                    </div>
                                    <Progress value={method.percentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

// ==================== Refund Section Component ====================

interface RefundSectionProps {
    data?: RefundAnalytics;
    isLoading: boolean;
}

const RefundSection = ({ data, isLoading }: RefundSectionProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Refund Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-rose-600">{data?.summary.refund_rate || 0}%</p>
                            <p className="text-sm text-gray-500">Refund Rate</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatNumber(data?.summary.refunded_orders || 0)}</p>
                                <p className="text-xs text-gray-500">Refunded Orders</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{formatNumber(data?.summary.refund_transactions || 0)}</p>
                                <p className="text-xs text-gray-500">Refund Transactions</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Refunded Amount</span>
                                <span className="font-medium text-rose-600">{formatCurrency(data?.summary.total_refunded || 0)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Refund Reasons</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.refund_reasons.map((reason, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{reason.reason}</span>
                                    <span>{reason.count} refunds</span>
                                </div>
                                <Progress value={(reason.count / (data?.summary.refund_transactions || 1)) * 100} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">Amount: {formatCurrency(reason.amount)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Customer Retention Section Component ====================

interface CustomerRetentionSectionProps {
    data?: CustomerRetention;
    isLoading: boolean;
}

const CustomerRetentionSection = ({ data, isLoading }: CustomerRetentionSectionProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Customer Segments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>One-time Buyers</span>
                                <span>{data?.customer_segments.one_time_buyers || 0} ({data?.customer_segments.one_time_percentage || 0}%)</span>
                            </div>
                            <Progress value={data?.customer_segments.one_time_percentage || 0} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Repeat Customers</span>
                                <span>{data?.customer_segments.repeat_customers || 0} ({data?.customer_segments.repeat_percentage || 0}%)</span>
                            </div>
                            <Progress value={data?.customer_segments.repeat_percentage || 0} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Frequent Customers (5+ orders)</span>
                                <span>{data?.customer_segments.frequent_customers || 0}</span>
                            </div>
                            <Progress value={(data?.customer_segments.frequent_customers || 0) / (data?.retention_metrics.total_customers || 1) * 100} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Customer Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(data?.retention_metrics.average_customer_lifetime_value || 0)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Average CLV</p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Avg Orders per Customer</span>
                            <span className="font-medium">{data?.retention_metrics.average_orders_per_customer || 0}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-gray-500">Total Customers</span>
                            <span className="font-medium">{formatNumber(data?.retention_metrics.total_customers || 0)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Timing Analytics Section Component ====================

interface TimingAnalyticsSectionProps {
    hourlyData?: HourlyDistribution[];
    dayOfWeekData?: DayOfWeekDistribution[];
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const TimingAnalyticsSection = ({ hourlyData, dayOfWeekData, isLoading, chartColors }: TimingAnalyticsSectionProps) => {
    if (isLoading) return <ChartSkeleton />;

    const hourlyChartData = hourlyData?.map(h => ({
        hour: h.display_hour,
        orders: h.orders,
        revenue: h.revenue,
    })) || [];

    const dayOfWeekChartData = dayOfWeekData?.map(d => ({
        day: d.day,
        orders: d.orders,
        revenue: d.revenue,
        percentage: d.percentage,
    })) || [];

    const peakHour = hourlyData?.reduce((max, curr) => curr.orders > max.orders ? curr : max, hourlyData[0]);
    const peakRevenueHour = hourlyData?.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, hourlyData[0]);
    const busiestDay = dayOfWeekData?.reduce((max, curr) => curr.orders > max.orders ? curr : max, dayOfWeekData[0]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Orders by Hour of Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis dataKey="hour" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: chartColors.text }} />
                                    <Bar dataKey="orders" fill="#8884D8" name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Orders by Day of Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dayOfWeekChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis dataKey="day" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: chartColors.text }} />
                                    <Bar dataKey="orders" fill="#82CA9D" name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Peak Hours Summary */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Peak Hours Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                            <p className="text-sm text-gray-500">Peak Order Hour</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {peakHour?.display_hour || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {peakHour?.orders || 0} orders
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-sm text-gray-500">Peak Revenue Hour</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {peakRevenueHour?.display_hour || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatCurrency(peakRevenueHour?.revenue || 0)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <p className="text-sm text-gray-500">Busiest Day</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {busiestDay?.day || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {busiestDay?.orders || 0} orders
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

// ==================== Main Page ====================

export default function OrdersAnalyticsPage() {
    const queryClient = useQueryClient();
    const [tempDateRange, setTempDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [appliedDateRange, setAppliedDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [salesInterval, setSalesInterval] = useState('day');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const startDate = format(appliedDateRange.from, 'yyyy-MM-dd');
    const endDate = format(appliedDateRange.to, 'yyyy-MM-dd');

    const chartColors = {
        grid: isDarkMode ? '#374151' : '#e5e7eb',
        text: isDarkMode ? '#9ca3af' : '#6b7280',
    };

    // Individual queries for each section
    const { data: orderSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
        queryKey: ['order-analytics-summary', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.summary, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: salesTrends, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
        queryKey: ['order-analytics-sales-trends', startDate, endDate, salesInterval],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.salesTrends, { params: { start_date: startDate, end_date: endDate, interval: salesInterval } }).then(res => res.data.data),
    });

    const { data: orderStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
        queryKey: ['order-analytics-status', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.statusDistribution, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: paymentStatus, isLoading: paymentLoading, refetch: refetchPayment } = useQuery({
        queryKey: ['order-analytics-payment-status', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.paymentStatusDistribution, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: topCustomers, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
        queryKey: ['order-analytics-top-customers', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.topCustomers, { params: { start_date: startDate, end_date: endDate, limit: 10 } }).then(res => res.data.data),
    });

    const { data: fulfillment, isLoading: fulfillmentLoading, refetch: refetchFulfillment } = useQuery({
        queryKey: ['order-analytics-fulfillment', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.fulfillment, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: refunds, isLoading: refundsLoading, refetch: refetchRefunds } = useQuery({
        queryKey: ['order-analytics-refunds', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.refunds, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: retention, isLoading: retentionLoading, refetch: refetchRetention } = useQuery({
        queryKey: ['order-analytics-retention', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.customerRetention, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: hourlyData, isLoading: hourlyLoading, refetch: refetchHourly } = useQuery({
        queryKey: ['order-analytics-hourly', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.hourlyDistribution, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: dayOfWeekData, isLoading: dayOfWeekLoading, refetch: refetchDayOfWeek } = useQuery({
        queryKey: ['order-analytics-day-of-week', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.orders.analytics.dayOfWeekDistribution, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const isLoading = summaryLoading || trendsLoading || statusLoading || paymentLoading ||
        customersLoading || fulfillmentLoading || refundsLoading || retentionLoading ||
        hourlyLoading || dayOfWeekLoading;

    const handleApplyDateRange = () => { setAppliedDateRange(tempDateRange); toast.success('Date range applied'); };
    const handleResetDateRange = () => { const newRange = { from: addDays(new Date(), -30), to: new Date() }; setTempDateRange(newRange); setAppliedDateRange(newRange); toast.success('Date range reset'); };
    const handleRefresh = () => Promise.all([
        refetchSummary(), refetchTrends(), refetchStatus(), refetchPayment(),
        refetchCustomers(), refetchFulfillment(), refetchRefunds(), refetchRetention(),
        refetchHourly(), refetchDayOfWeek(),
    ]);

    const revenueTrendData = salesTrends?.map((t: any) => ({
        period: t.period ? format(new Date(t.period), 'MMM dd') : '',
        revenue: t.revenue,
        orders: t.orders,
        items_sold: t.items_sold,
    })) || [];

    // Prepare status chart data
    const orderStatusData = orderStatus ? Object.entries(orderStatus).map(([key, value]: [string, any]) => ({
        status: value.label,
        count: value.count,
        percentage: value.percentage,
    })) : [];

    const paymentStatusData = paymentStatus ? Object.entries(paymentStatus).map(([key, value]: [string, any]) => ({
        status: value.label,
        count: value.count,
        percentage: value.percentage,
    })) : [];

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Orders Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive insights into order performance, customer behavior, and operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <DateRangePicker date={tempDateRange as any} setDate={setTempDateRange as any} className="w-auto" />
                        <Button onClick={handleApplyDateRange} className="gap-1">Apply</Button>
                        <Button variant="outline" onClick={handleResetDateRange} className="gap-1">Reset</Button>
                    </div>
                    <RefreshButton onRefresh={handleRefresh} successMessage="Analytics data refreshed" />
                </div>
            </div>

            {/* KPI Cards - Loads independently */}
            <KPICards
                orderSummary={orderSummary}
                fulfillment={fulfillment}
                refunds={refunds}
                retention={retention}
                isLoading={summaryLoading || fulfillmentLoading || refundsLoading || retentionLoading}
            />

            {/* Tabs - Each tab content loads independently */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-900/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Overview</TabsTrigger>
                    <TabsTrigger value="revenue" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Revenue & Trends</TabsTrigger>
                    <TabsTrigger value="customers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Customers</TabsTrigger>
                    <TabsTrigger value="fulfillment" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Fulfillment</TabsTrigger>
                    <TabsTrigger value="refunds" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Refunds</TabsTrigger>
                    <TabsTrigger value="timing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200">Timing Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <RevenueTrendChart
                        data={revenueTrendData}
                        isLoading={trendsLoading}
                        chartColors={chartColors}
                        interval={salesInterval}
                        onIntervalChange={setSalesInterval}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Order Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={orderStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {orderStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Payment Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {paymentStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <PaymentMethodsSection data={orderSummary?.payment_method_stats} isLoading={summaryLoading} />
                    <OverviewSummaryCards orderSummary={orderSummary} isLoading={summaryLoading} />
                </TabsContent>

                {/* Revenue & Trends Tab */}
                <TabsContent value="revenue" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Revenue by Payment Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(orderSummary?.payment_type_stats.online.revenue || 0)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Online Payments</p>
                                    <div className="my-4 h-px bg-gray-200 dark:bg-gray-800" />
                                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                        {formatCurrency(orderSummary?.payment_type_stats.pod.revenue || 0)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pay on Delivery</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Performance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Total Items Sold</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{formatNumber(orderSummary?.summary.total_items_sold || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Average Items per Order</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {orderSummary?.summary.total_orders ? (orderSummary.summary.total_items_sold / orderSummary.summary.total_orders).toFixed(2) : 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Registered Orders</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{orderSummary?.customer_breakdown.registered_orders || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Guest Orders</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{orderSummary?.customer_breakdown.guest_orders || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Items Sold Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                        <XAxis dataKey="period" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                        <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ color: chartColors.text }} />
                                        <Area type="monotone" dataKey="items_sold" stroke="#82CA9D" fill="#82CA9D" fillOpacity={0.3} name="Items Sold" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-4">
                    <TopCustomersTable data={topCustomers} isLoading={customersLoading} />
                    <CustomerRetentionSection data={retention} isLoading={retentionLoading} />
                </TabsContent>

                {/* Fulfillment Tab */}
                <TabsContent value="fulfillment" className="space-y-4">
                    <FulfillmentSection data={fulfillment} isLoading={fulfillmentLoading} />
                </TabsContent>

                {/* Refunds Tab */}
                <TabsContent value="refunds" className="space-y-4">
                    <RefundSection data={refunds} isLoading={refundsLoading} />
                </TabsContent>

                {/* Timing Analytics Tab */}
                <TabsContent value="timing" className="space-y-4">
                    <TimingAnalyticsSection
                        hourlyData={hourlyData}
                        dayOfWeekData={dayOfWeekData}
                        isLoading={hourlyLoading || dayOfWeekLoading}
                        chartColors={chartColors}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
