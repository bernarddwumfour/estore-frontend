// app/dashboard/products/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TrendingUp, TrendingDown, Package, DollarSign, Star,
    AlertTriangle, Layers, Target, Activity, Award, BadgePercent, Zap,
    RefreshCw, Eye, ShoppingCart, Wallet, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Line
} from 'recharts';
import { addDays, format } from 'date-fns';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { ActionItem, ActionsDropdown } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { DateRangePicker } from '@/widgets/DatePicker/DateRangePicker';

// ==================== Types ====================
interface OverviewStats {
    summary: {
        total_products: number;
        total_variants: number;
        active_products: number;
        draft_products: number;
        archived_products: number;
        total_categories: number;
        total_brands: number;
    };
    inventory_summary: {
        total_stock: number;
        out_of_stock_variants: number;
        low_stock_variants: number;
        total_inventory_value: number;
    };
    engagement: {
        total_reviews: number;
        average_rating: number;
        total_wishlists: number;
        products_with_reviews: number;
    };
}

interface SalesPerformance {
    sales_summary: {
        total_revenue: number;
        total_quantity_sold: number;
        total_orders: number;
        average_order_value: number;
        average_unit_price: number;
        items_per_order: number;
    };
    top_products: Array<{
        product_id: string;
        title: string;
        quantity_sold: number;
        revenue: number;
        orders: number;
    }>;
    products_without_sales: number;
    revenue_trends: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

interface ProductFunnel {
    total_products: number;
    products_with_wishlists: number;
    products_with_carts: number;
    products_with_purchases: number;
    conversion_rates: {
        overall_conversion: number;
    };
}

interface InventoryHealth {
    summary: {
        average_turnover_rate: number;
        fast_movers_count: number;
        slow_movers_count: number;
    };
    fast_movers: Array<{
        variant_id: string;
        sku: string;
        product_title: string;
        current_stock: number;
        days_of_stock: number;
        turnover_rate: number;
    }>;
    slow_movers: Array<{
        variant_id: string;
        sku: string;
        product_title: string;
        current_stock: number;
        days_of_stock: number;
        turnover_rate: number;
    }>;
    reorder_recommendations: Array<{
        variant_id: string;
        sku: string;
        product_title: string;
        current_stock: number;
        days_until_out: number;
        reorder_quantity: number;
        priority: string;
    }>;
}

interface PricingAnalytics {
    distribution: Array<{
        range: string;
        variant_count: number;
        percentage: number;
    }>;
    statistics: {
        min_price: number;
        max_price: number;
        avg_price: number;
        total_variants: number;
    };
    discount_analysis: {
        total_discounted_variants: number;
        discounted_percentage: number;
        average_discount_percentage: number;
    };
    price_elasticity: Array<{
        price: number;
        estimated_demand: number;
        estimated_revenue: number;
    }>;
    optimal_price_point: {
        price: number;
        estimated_revenue: number;
    };
}

interface CategoryDetail {
    id: string;
    name: string;
    slug: string;
    metrics: {
        total_products: number;
        total_revenue: number;
        total_orders: number;
    };
}

interface VariantAnalytics {
    id: string;
    sku: string;
    product_title: string;
    product_id: string;
    inventory: {
        current_stock: number;
        stock_status: string;
        stock_turnover_rate: number;
    };
    metrics: {
        quantity_sold: number;
        revenue: number;
        conversion_rate: number;
    };
    pricing: {
        price: number;
    };
}

// ==================== Helper Functions ====================
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
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

// ==================== Custom Chart Tooltip ====================
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

// ==================== Loading Skeleton Components ====================
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
    overview?: OverviewStats;
    salesPerformance?: SalesPerformance;
    productFunnel?: ProductFunnel;
    inventoryHealth?: InventoryHealth;
    isLoading: boolean;
}

const KPICards = ({ overview, salesPerformance, productFunnel, inventoryHealth, isLoading }: KPICardsProps) => {
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatNumber(overview?.summary.total_products || 0)}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                        {overview?.summary.active_products} Active
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                        {overview?.summary.draft_products} Draft
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
                                    {formatCurrency(salesPerformance?.sales_summary.total_revenue || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatNumber(salesPerformance?.sales_summary.total_orders || 0)} orders
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
                                    {formatCurrency(salesPerformance?.sales_summary.average_order_value || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {salesPerformance?.sales_summary.items_per_order || 0} items per order
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {overview?.engagement.average_rating || 0} ★
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatNumber(overview?.engagement.total_reviews || 0)} reviews
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inventory Value</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(overview?.inventory_summary.total_inventory_value || 0)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatNumber(overview?.inventory_summary.total_stock || 0)} units
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Turnover</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {inventoryHealth?.summary.average_turnover_rate || 0}x
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                        {inventoryHealth?.summary.fast_movers_count || 0} Fast
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                        {inventoryHealth?.summary.slow_movers_count || 0} Slow
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Variants</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatNumber(overview?.summary.total_variants || 0)}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                                        {overview?.inventory_summary.out_of_stock_variants || 0} Out
                                    </Badge>
                                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                        {overview?.inventory_summary.low_stock_variants || 0} Low
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                <Layers className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {productFunnel?.conversion_rates.overall_conversion || 0}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {productFunnel?.products_with_purchases || 0} products selling
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                                <Target className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
    salesPerformance?: SalesPerformance;
    isLoading: boolean;
}

const OverviewSummaryCards = ({ salesPerformance, isLoading }: OverviewSummaryCardsProps) => {
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantity Sold</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatNumber(salesPerformance?.sales_summary.total_quantity_sold || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">units across all products</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Unit Price</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(salesPerformance?.sales_summary.average_unit_price || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per item</p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Products Without Sales</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                        {formatNumber(salesPerformance?.products_without_sales || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">products with zero orders</p>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Revenue Trend Chart Component ====================
interface RevenueTrendChartProps {
    data: Array<{ date: string; revenue: number; orders: number }>;
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const RevenueTrendChart = ({ data, isLoading, chartColors }: RevenueTrendChartProps) => {
    if (isLoading) return <ChartSkeleton />;
    if (!data.length) return null;

    return (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue & Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                            <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 12 }} />
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

// ==================== Top Products Table Component ====================
interface TopProductsTableProps {
    data: Array<{ product_id: string; title: string; quantity_sold: number; revenue: number; orders: number }>;
    isLoading: boolean;
}

const TopProductsTable = ({ data, isLoading }: TopProductsTableProps) => {
    if (isLoading) return <TableSkeleton />;

    return (
        <DataTable
            data={data || []}
            excludeColumns={['product_id']}
            links={{
                title: (product: any) => `/dashboard/products/${product.product_id}`,
            }}
            emptyTitle="No Sales Data"
            emptyDescription="No product sales data available for the selected period."
        />
    );
};

// ==================== Inventory Health Component ====================
interface InventoryHealthProps {
    data?: InventoryHealth;
    isLoading: boolean;
}

const InventoryHealthSection = ({ data, isLoading }: InventoryHealthProps) => {
    if (isLoading) return <TableSkeleton />;

    return (
        <>
            {/* Reorder Recommendations */}
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Reorder Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.reorder_recommendations.slice(0, 5).map((rec) => (
                            <div key={rec.variant_id} className={`p-4 rounded-lg ${rec.priority === 'high' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' : rec.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-blue-50 dark:bg-blue-950/20'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{rec.product_title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{rec.sku}</p>
                                    </div>
                                    <Badge className={rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : rec.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}>
                                        {rec.priority.toUpperCase()} Priority
                                    </Badge>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                                    <div><span className="text-gray-500 dark:text-gray-400">Stock:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{rec.current_stock}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">Days Until Out:</span> <span className="ml-2 font-medium text-amber-600 dark:text-amber-400">{rec.days_until_out} days</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">Reorder Qty:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{rec.reorder_quantity}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Fast & Slow Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-white">Fast Movers (High Turnover)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data?.fast_movers.slice(0, 5).map((mover) => (
                                <div key={mover.variant_id} className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                    <div><p className="font-medium text-sm text-gray-900 dark:text-white">{mover.product_title}</p><p className="text-xs text-gray-500 dark:text-gray-400">{mover.sku}</p></div>
                                    <div className="text-right"><p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{mover.turnover_rate}x turnover</p><p className="text-xs text-gray-500 dark:text-gray-400">{mover.days_of_stock} days stock</p></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-white">Slow Movers (Low Turnover)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data?.slow_movers.slice(0, 5).map((mover) => (
                                <div key={mover.variant_id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                    <div><p className="font-medium text-sm text-gray-900 dark:text-white">{mover.product_title}</p><p className="text-xs text-gray-500 dark:text-gray-400">{mover.sku}</p></div>
                                    <div className="text-right"><p className="text-sm font-medium text-amber-600 dark:text-amber-400">{mover.turnover_rate}x turnover</p><p className="text-xs text-gray-500 dark:text-gray-400">{mover.days_of_stock} days stock</p></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

// ==================== Pricing Analytics Component ====================
interface PricingAnalyticsProps {
    data?: PricingAnalytics;
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const PricingAnalyticsSection = ({ data, isLoading, chartColors }: PricingAnalyticsProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <>
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Price Elasticity of Demand</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.price_elasticity || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="price" tick={{ fill: chartColors.text, fontSize: 12 }} label={{ value: 'Price ($)', position: 'bottom', fill: chartColors.text }} />
                                <YAxis yAxisId="left" tick={{ fill: chartColors.text, fontSize: 12 }} label={{ value: 'Demand', angle: -90, position: 'left', fill: chartColors.text }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 12 }} label={{ value: 'Revenue ($)', angle: 90, position: 'right', fill: chartColors.text }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: chartColors.text }} />
                                <Line yAxisId="left" type="monotone" dataKey="estimated_demand" stroke="#8884D8" name="Demand" />
                                <Line yAxisId="right" type="monotone" dataKey="estimated_revenue" stroke="#82CA9D" name="Revenue" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Optimal Price Point</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(data?.optimal_price_point.price || 0)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Maximizes revenue at</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(data?.optimal_price_point.estimated_revenue || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Discount Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Discounted Variants</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatNumber(data?.discount_analysis.total_discounted_variants || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Percentage Discounted</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data?.discount_analysis.discounted_percentage || 0}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Average Discount</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data?.discount_analysis.average_discount_percentage || 0}%
                                </span>
                            </div>
                            <Progress value={data?.discount_analysis.discounted_percentage || 0} className="mt-4 h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Price Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data?.distribution.map((range) => (
                            <div key={range.range}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300">{range.range}</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {range.variant_count} variants ({range.percentage}%)
                                    </span>
                                </div>
                                <Progress value={range.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Min Price</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(data?.statistics.min_price || 0)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Price</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(data?.statistics.avg_price || 0)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Max Price</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(data?.statistics.max_price || 0)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

// ==================== Category Analytics Component ====================
interface CategoryAnalyticsProps {
    data?: CategoryDetail[];
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const CategoryAnalyticsSection = ({ data, isLoading, chartColors }: CategoryAnalyticsProps) => {
    const chartData = data?.map(c => ({ name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name, revenue: c.metrics.total_revenue })) || [];

    if (isLoading) return <ChartSkeleton />;

    return (
        <>
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={(v) => formatCompactNumber(v)} />
                                <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                                <Bar dataKey="revenue" fill="#8884D8" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <DataTable
                data={data || []}
                excludeColumns={['id', 'slug']}
                links={{ name: (category: CategoryDetail) => `/dashboard/categories/${category.slug}` }}
                emptyTitle="No Categories"
                emptyDescription="No category data available."
            />
        </>
    );
};

// ==================== Variant Analytics Table Component ====================
interface VariantAnalyticsTableProps {
    data?: VariantAnalytics[];
    isLoading: boolean;
}

const VariantAnalyticsTable = ({ data, isLoading }: VariantAnalyticsTableProps) => {
    if (isLoading) return <TableSkeleton />;

    return (
        <DataTable
            data={data || []}
            renderActions={(variant: VariantAnalytics) => (
                <ActionsDropdown
                    actions={[{ label: 'View Product', icon: <Eye size={14} />, onClick: () => window.location.href = `/dashboard/products/${variant.product_id}`, color: 'blue' }]}
                    maxVisible={1}
                    showLabels={false}
                    buttonSize="sm"
                />
            )}
            excludeColumns={['id', 'product_id', 'attributes']}
            dots={{ 'inventory.stock_status': { in_stock: 'emerald', low_stock: 'amber', out_of_stock: 'rose' } }}
            badges={{ 'inventory.stock_status': { in_stock: 'emerald', low_stock: 'amber', out_of_stock: 'rose' } }}
            links={{ sku: (variant: VariantAnalytics) => `/dashboard/products/${variant.product_id}/variants/${variant.id}`, product_title: (variant: VariantAnalytics) => `/dashboard/products/${variant.product_id}` }}
            emptyTitle="No Variants Found"
            emptyDescription="No variant data available for the selected period."
        />
    );
};

// ==================== Main Page ====================
export default function ProductsAnalyticsPage() {
    const queryClient = useQueryClient();
    const [tempDateRange, setTempDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [appliedDateRange, setAppliedDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
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
    const chartColors = { grid: isDarkMode ? '#374151' : '#e5e7eb', text: isDarkMode ? '#9ca3af' : '#6b7280' };

    // Individual queries for each section - they load independently
    const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
        queryKey: ['product-analytics-overview', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.products.analytics.overview, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: salesPerformance, isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['product-analytics-sales', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.products.analytics.salesPerformance, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: productFunnel, isLoading: funnelLoading, refetch: refetchFunnel } = useQuery({
        queryKey: ['product-analytics-funnel', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.products.analytics.productFunnel, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: inventoryHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
        queryKey: ['product-analytics-inventory-health'],
        queryFn: () => securityAxios.get(endpoints.products.analytics.inventoryHealth).then(res => res.data.data),
    });

    const { data: pricingAnalytics, isLoading: pricingLoading, refetch: refetchPricing } = useQuery({
        queryKey: ['product-analytics-pricing'],
        queryFn: () => securityAxios.get(endpoints.products.analytics.pricing).then(res => res.data.data),
    });

    const { data: categoryAnalytics, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
        queryKey: ['product-analytics-categories', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.products.analytics.categories, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data),
    });

    const { data: variants, isLoading: variantsLoading, refetch: refetchVariants } = useQuery({
        queryKey: ['product-analytics-variants', startDate, endDate],
        queryFn: () => securityAxios.get(endpoints.products.analytics.variants, { params: { start_date: startDate, end_date: endDate } }).then(res => res.data.data.variants),
    });

    const handleApplyDateRange = () => { setAppliedDateRange(tempDateRange); toast.success('Date range applied'); };
    const handleResetDateRange = () => { const newRange = { from: addDays(new Date(), -30), to: new Date() }; setTempDateRange(newRange); setAppliedDateRange(newRange); toast.success('Date range reset'); };
    const handleRefresh = () => {
        refetchOverview(); refetchSales(); refetchFunnel(); refetchHealth();
        refetchPricing(); refetchCategories(); refetchVariants();
        toast.success('Analytics data refreshed');
    };

    const revenueTrendData = salesPerformance?.revenue_trends.map((t: any) => ({ date: format(new Date(t.date), 'MMM dd'), revenue: t.revenue, orders: t.orders })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Products Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive insights into product performance, sales, and inventory</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <DateRangePicker date={tempDateRange} setDate={setTempDateRange as any} className="w-auto" />
                        <Button onClick={handleApplyDateRange} className="gap-1">Apply</Button>
                        <Button variant="outline" onClick={handleResetDateRange} className="gap-1">Reset</Button>
                    </div>
                    <Button variant="outline" onClick={handleRefresh} className="gap-2"><RefreshCw size={16} /> Refresh</Button>
                </div>
            </div>

            {/* KPI Cards - Loads independently */}
            <KPICards overview={overview} salesPerformance={salesPerformance} productFunnel={productFunnel} inventoryHealth={inventoryHealth} isLoading={overviewLoading || salesLoading || funnelLoading || healthLoading} />

            {/* Tabs - Each tab content loads independently */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-900/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Overview</TabsTrigger>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Sales</TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Inventory</TabsTrigger>
                    <TabsTrigger value="pricing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Pricing</TabsTrigger>
                    <TabsTrigger value="categories" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Categories</TabsTrigger>
                    <TabsTrigger value="variants" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 hover:!text-gray-200">Variants</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <RevenueTrendChart data={revenueTrendData} isLoading={salesLoading} chartColors={chartColors} />
                    <OverviewSummaryCards salesPerformance={salesPerformance} isLoading={salesLoading} />
                </TabsContent>

                <TabsContent value="sales">
                    <TopProductsTable data={salesPerformance?.top_products || []} isLoading={salesLoading} />
                </TabsContent>

                <TabsContent value="inventory">
                    <InventoryHealthSection data={inventoryHealth} isLoading={healthLoading} />
                </TabsContent>

                <TabsContent value="pricing">
                    <PricingAnalyticsSection data={pricingAnalytics} isLoading={pricingLoading} chartColors={chartColors} />
                </TabsContent>

                <TabsContent value="categories">
                    <CategoryAnalyticsSection data={categoryAnalytics} isLoading={categoriesLoading} chartColors={chartColors} />
                </TabsContent>

                <TabsContent value="variants">
                    <VariantAnalyticsTable data={variants} isLoading={variantsLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}