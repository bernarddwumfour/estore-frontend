'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    TrendingUp, TrendingDown, Users, UserPlus, UserCheck, UserX,
    Mail, MailCheck, MailX, Calendar, Clock, MapPin, Globe,
    Award, Star, Trophy, DollarSign, ShoppingBag, Target,
    RefreshCw, Eye, Loader2, BarChart3, PieChart as PieChartIcon,
    Activity, Gift, Percent, CreditCard, Phone, Heart
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
import { endpoints } from '@/constants/endpoints/endpoints';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { DateRangePicker } from '@/widgets/date-picker/DateRangePicker';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';
import { AlertMessage } from '@/widgets/alert-message/AlertMessage';
import { useAnalyticsQuery } from '@/hooks/use-analytics-query';
import { useChartColors } from '@/hooks/use-chart-colors';
import { CustomTooltip } from '@/widgets/analytics/CustomTooltip';
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from '@/widgets/analytics/skeletons';
import { AnalyticsStatTile } from '@/widgets/analytics/AnalyticsStatTile';

// ==================== Types ====================

interface UserOverviewStats {
    summary: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        verified_emails: number;
        unverified_emails: number;
        verified_percentage: number;
    };
    role_distribution: {
        customers: number;
        staff: number;
        admins: number;
        guests: number;
        registered: number;
        customer_percentage: number;
        staff_percentage: number;
        guest_percentage: number;
    };
    growth: {
        new_users_30d: number;
        new_users_7d: number;
        active_today: number;
    };
}

interface UserGrowthTrend {
    period: string;
    new_users: number;
    active_users: number;
    verified_users: number;
}

interface UserEngagement {
    customer_engagement: {
        total_customers: number;
        active_customers: number;
        inactive_customers: number;
        active_percentage: number;
        repeat_customers: number;
        repeat_purchase_rate: number;
    };
    customer_lifetime_value: {
        average_clv: number;
        average_orders_per_customer: number;
    };
    guest_conversion: {
        total_guests: number;
        converted_guests: number;
        conversion_rate: number;
    };
}

interface GeographicDistribution {
    by_country: Array<{
        country: string;
        user_count: number;
        percentage: number;
    }>;
    by_city: Array<{
        city: string;
        country: string;
        user_count: number;
    }>;
}

interface UserActivity {
    login_activity: {
        average_days_since_last_login: number;
        recently_active_7d: number;
        never_logged_in: number;
        login_percentage: number;
    };
    registration_timing: {
        by_hour: Array<{
            hour: number;
            display_hour: string;
            registrations: number;
        }>;
        by_day_of_week: Array<{
            day: string;
            registrations: number;
            day_index: number;
        }>;
    };
}

interface AffiliateAnalytics {
    summary: {
        total_affiliates: number;
        approved_affiliates: number;
        pending_affiliates: number;
        approval_rate: number;
    };
    level_distribution: Record<string, {
        count: number;
        name: string;
        percentage: number;
    }>;
    earnings_summary: {
        total_earnings: number;
        total_pending: number;
        total_paid: number;
        total_referrals: number;
        average_earnings_per_affiliate: number;
    };
    top_affiliates: Array<{
        affiliate_id: string;
        email: string;
        name: string;
        level: string;
        total_earnings: number;
        total_referrals: number;
        commission_rate: number;
    }>;
}

interface AffiliateGrowthTrend {
    period: string;
    new_affiliates: number;
    total_earnings: number;
    total_referrals: number;
}

interface CustomerDemographics {
    age_distribution: Array<{
        group: string;
        count: number;
        percentage: number;
    }>;
    marketing_preferences: {
        receive_marketing: number;
        receive_newsletter: number;
        marketing_percentage: number;
        newsletter_percentage: number;
    };
    loyalty_program: {
        total_points: number;
        average_points: number;
        max_points: number;
        customers_with_points: number;
    };
}

interface TopCustomer {
    user_id: string;
    email: string;
    name: string;
    total_spent: number;
    order_count: number;
    average_order_value: number;
    first_order: string | null;
    last_order: string | null;
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

// ==================== KPI Cards Component ====================

interface KPICardsProps {
    overview?: UserOverviewStats;
    engagement?: UserEngagement;
    isLoading: boolean;
}

const KPICards = ({ overview, engagement, isLoading }: KPICardsProps) => {
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
                <AnalyticsStatTile
                    label="Total Users"
                    value={formatNumber(overview?.summary.total_users || 0)}
                    icon={<Users className="h-6 w-6" />}
                    color="purple"
                    footer={
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                {overview?.summary.active_users || 0} Active
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                                {overview?.summary.inactive_users || 0} Inactive
                            </Badge>
                        </div>
                    }
                />

                <AnalyticsStatTile
                    label="Email Verified"
                    value={`${overview?.summary.verified_percentage || 0}%`}
                    icon={<MailCheck className="h-6 w-6" />}
                    color="blue"
                    footer={
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                                {formatNumber(overview?.summary.verified_emails || 0)} Verified
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                                {formatNumber(overview?.summary.unverified_emails || 0)} Unverified
                            </Badge>
                        </div>
                    }
                />

                <AnalyticsStatTile
                    label="Active Customers"
                    value={`${engagement?.customer_engagement.active_percentage || 0}%`}
                    icon={<UserCheck className="h-6 w-6" />}
                    color="emerald"
                    footer={<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatNumber(engagement?.customer_engagement.active_customers || 0)} of {formatNumber(engagement?.customer_engagement.total_customers || 0)}</p>}
                />

                <AnalyticsStatTile
                    label="Repeat Purchase Rate"
                    value={`${engagement?.customer_engagement.repeat_purchase_rate || 0}%`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="amber"
                    footer={<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatNumber(engagement?.customer_engagement.repeat_customers || 0)} repeat customers</p>}
                />
            </div>

            {/* Second Row KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsStatTile
                    label="New Users (30d)"
                    value={formatNumber(overview?.growth.new_users_30d || 0)}
                    icon={<UserPlus className="h-6 w-6" />}
                    color="cyan"
                    footer={<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatNumber(overview?.growth.new_users_7d || 0)} in last 7 days</p>}
                />

                <AnalyticsStatTile
                    label="Average CLV"
                    value={formatCurrency(engagement?.customer_lifetime_value.average_clv || 0)}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="indigo"
                    footer={<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{engagement?.customer_lifetime_value.average_orders_per_customer || 0} avg orders</p>}
                />

                <AnalyticsStatTile
                    label="Guest Conversion"
                    value={`${engagement?.guest_conversion.conversion_rate || 0}%`}
                    icon={<Users className="h-6 w-6" />}
                    color="orange"
                    footer={<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatNumber(engagement?.guest_conversion.converted_guests || 0)} converted</p>}
                />

                <AnalyticsStatTile
                    label="Role Distribution"
                    value={`${overview?.role_distribution.customer_percentage || 0}%`}
                    icon={<Target className="h-6 w-6" />}
                    color="teal"
                    footer={
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                                {formatNumber(overview?.role_distribution.customers || 0)} Customers
                            </Badge>
                            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600">
                                {formatNumber(overview?.role_distribution.staff || 0)} Staff
                            </Badge>
                        </div>
                    }
                />
            </div>
        </>
    );
};

// ==================== Role Distribution Chart ====================

interface RoleDistributionChartProps {
    data?: UserOverviewStats;
    isLoading: boolean;
}

const RoleDistributionChart = ({ data, isLoading }: RoleDistributionChartProps) => {
    if (isLoading) return <ChartSkeleton />;

    const chartData = [
        { name: "Customers", value: data?.role_distribution.customers || 0, percentage: data?.role_distribution.customer_percentage || 0 },
        { name: "Staff", value: data?.role_distribution.staff || 0, percentage: data?.role_distribution.staff_percentage || 0 },
        { name: "Admins", value: data?.role_distribution.admins || 0 },
        { name: "Guests", value: data?.role_distribution.guests || 0, percentage: data?.role_distribution.guest_percentage || 0 },
    ];

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// ==================== User Growth Trend Chart ====================

interface UserGrowthTrendChartProps {
    data: UserGrowthTrend[];
    isLoading: boolean;
    chartColors: { grid: string; text: string };
    interval: string;
    onIntervalChange: (interval: string) => void;
}

const UserGrowthTrendChart = ({ data, isLoading, chartColors, interval, onIntervalChange }: UserGrowthTrendChartProps) => {
    if (isLoading) return <ChartSkeleton />;
    if (!data.length) return null;

    return (
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">User Growth Trends</CardTitle>
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
                            <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: chartColors.text }} />
                            <Line type="monotone" dataKey="new_users" stroke="#0088FE" name="New Users" strokeWidth={2} />
                            <Line type="monotone" dataKey="active_users" stroke="#00C49F" name="Active Users" strokeWidth={2} />
                            <Line type="monotone" dataKey="verified_users" stroke="#FFBB28" name="Verified Users" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// ==================== Registration Timing Charts ====================

interface RegistrationTimingProps {
    data?: UserActivity;
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const RegistrationTimingSection = ({ data, isLoading, chartColors }: RegistrationTimingProps) => {
    if (isLoading) return <ChartSkeleton />;

    const hourlyData = data?.registration_timing.by_hour || [];
    const dailyData = data?.registration_timing.by_day_of_week || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Registrations by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="display_hour" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="registrations" fill="#8884D8" name="Registrations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Registrations by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="day" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="registrations" fill="#82CA9D" name="Registrations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Geographic Distribution Component ====================

interface GeographicDistributionProps {
    data?: GeographicDistribution;
    isLoading: boolean;
}

const GeographicDistributionSection = ({ data, isLoading }: GeographicDistributionProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Users by Country</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.by_country.slice(0, 10).map((country) => (
                            <div key={country.country}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{country.country}</span>
                                    <span className="text-gray-500">{country.user_count} users ({country.percentage}%)</span>
                                </div>
                                <Progress value={country.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Top Cities</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.by_city.slice(0, 10).map((city, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{city.city}</p>
                                    <p className="text-xs text-gray-500">{city.country}</p>
                                </div>
                                <Badge variant="outline">{city.user_count} users</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Affiliate Analytics Component ====================

interface AffiliateAnalyticsProps {
    data?: AffiliateAnalytics;
    growthData?: AffiliateGrowthTrend[];
    isLoading: boolean;
    chartColors: { grid: string; text: string };
}

const AffiliateAnalyticsSection = ({ data, growthData, isLoading, chartColors }: AffiliateAnalyticsProps) => {
    if (isLoading) return <ChartSkeleton />;

    const levelData = data?.level_distribution ? Object.entries(data.level_distribution).map(([key, value]) => ({
        level: value.name,
        count: value.count,
        percentage: value.percentage,
    })) : [];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-purple-600">{formatNumber(data?.summary.total_affiliates || 0)}</p>
                        <p className="text-sm text-gray-500">Total Affiliates</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{data?.summary.approval_rate || 0}%</p>
                        <p className="text-sm text-gray-500">Approval Rate</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(data?.earnings_summary.total_earnings || 0)}</p>
                        <p className="text-sm text-gray-500">Total Earnings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatNumber(data?.earnings_summary.total_referrals || 0)}</p>
                        <p className="text-sm text-gray-500">Total Referrals</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Affiliate Level Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {levelData.map((level) => (
                                <div key={level.level}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{level.level}</span>
                                        <span>{level.count} affiliates ({level.percentage}%)</span>
                                    </div>
                                    <Progress value={level.percentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Affiliate Earnings Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Earnings</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(data?.earnings_summary.total_earnings || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pending Payout</span>
                                <span className="font-medium text-amber-600">{formatCurrency(data?.earnings_summary.total_pending || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Already Paid</span>
                                <span className="font-medium text-blue-600">{formatCurrency(data?.earnings_summary.total_paid || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Avg per Affiliate</span>
                                <span className="font-medium">{formatCurrency(data?.earnings_summary.average_earnings_per_affiliate || 0)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Affiliate Growth Chart */}
            {growthData && growthData.length > 0 && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Affiliate Growth & Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis dataKey="period" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <YAxis yAxisId="left" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: chartColors.text }} />
                                    <Line yAxisId="left" type="monotone" dataKey="new_affiliates" stroke="#0088FE" name="New Affiliates" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="total_earnings" stroke="#00C49F" name="Total Earnings" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Affiliates Table */}
            <DataTable
                data={data?.top_affiliates || []}
                excludeColumns={['affiliate_id']}
                links={{
                    email: (affiliate: any) => `/dashboard/users/${affiliate.user_id}`,
                }}
                emptyTitle="No Affiliates"
                emptyDescription="No affiliate data available."
            />
        </>
    );
};

// ==================== Customer Demographics Component ====================

interface CustomerDemographicsProps {
    data?: CustomerDemographics;
    isLoading: boolean;
}

const CustomerDemographicsSection = ({ data, isLoading }: CustomerDemographicsProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.age_distribution.map((ageGroup) => (
                            <div key={ageGroup.group}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{ageGroup.group}</span>
                                    <span>{ageGroup.count} customers ({ageGroup.percentage}%)</span>
                                </div>
                                <Progress value={ageGroup.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Marketing Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Receive Marketing Emails</span>
                                <span>{data?.marketing_preferences.marketing_percentage || 0}%</span>
                            </div>
                            <Progress value={data?.marketing_preferences.marketing_percentage || 0} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                                {formatNumber(data?.marketing_preferences.receive_marketing || 0)} customers
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Receive Newsletter</span>
                                <span>{data?.marketing_preferences.newsletter_percentage || 0}%</span>
                            </div>
                            <Progress value={data?.marketing_preferences.newsletter_percentage || 0} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                                {formatNumber(data?.marketing_preferences.receive_newsletter || 0)} customers
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Loyalty Program</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{formatNumber(data?.loyalty_program.total_points || 0)}</p>
                            <p className="text-xs text-gray-500">Total Points Issued</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{formatNumber(data?.loyalty_program.average_points || 0)}</p>
                            <p className="text-xs text-gray-500">Average Points</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(data?.loyalty_program.max_points || 0)}</p>
                            <p className="text-xs text-gray-500">Max Points</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{formatNumber(data?.loyalty_program.customers_with_points || 0)}</p>
                            <p className="text-xs text-gray-500">Customers with Points</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== Login Activity Component ====================

interface LoginActivityProps {
    data?: UserActivity;
    isLoading: boolean;
}

const LoginActivitySection = ({ data, isLoading }: LoginActivityProps) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-amber-600">{data?.login_activity.average_days_since_last_login || 0} days</p>
                    <p className="text-sm text-gray-500">Avg Days Since Last Login</p>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{formatNumber(data?.login_activity.recently_active_7d || 0)}</p>
                    <p className="text-sm text-gray-500">Active in Last 7 Days</p>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-rose-600">{formatNumber(data?.login_activity.never_logged_in || 0)}</p>
                    <p className="text-sm text-gray-500">Never Logged In</p>
                </CardContent>
            </Card>
        </div>
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
            excludeColumns={['user_id']}
            // links={{
            //     email: (customer: TopCustomer) => `/dashboard/users/${customer.user_id}`,
            // }}
            emptyTitle="No Customer Data"
            emptyDescription="No customer data available for the selected period."
        />
    );
};

// ==================== Main Page ====================

export default function UsersAnalyticsPage() {
    const queryClient = useQueryClient();
    const [tempDateRange, setTempDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [appliedDateRange, setAppliedDateRange] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [growthInterval, setGrowthInterval] = useState('day');
    const [affiliateInterval, setAffiliateInterval] = useState('month');
    const { grid, text } = useChartColors();

    const startDate = format(appliedDateRange.from, 'yyyy-MM-dd');
    const endDate = format(appliedDateRange.to, 'yyyy-MM-dd');
    const chartColors = { grid, text };

    // Individual queries for each section - they load independently
    const { data: overview, isLoading: overviewLoading, isError: overviewError, refetch: refetchOverview } = useAnalyticsQuery<UserOverviewStats>(
        ['user-analytics-overview', startDate, endDate],
        endpoints.users.analytics.overview,
        { start_date: startDate, end_date: endDate },
    );

    const { data: growthTrends, isLoading: growthLoading, isError: growthError, refetch: refetchGrowth } = useAnalyticsQuery<UserGrowthTrend[]>(
        ['user-analytics-growth', startDate, endDate, growthInterval],
        endpoints.users.analytics.growthTrends,
        { start_date: startDate, end_date: endDate, interval: growthInterval },
    );

    const { data: engagement, isLoading: engagementLoading, isError: engagementError, refetch: refetchEngagement } = useAnalyticsQuery<UserEngagement>(
        ['user-analytics-engagement', startDate, endDate],
        endpoints.users.analytics.engagement,
        { start_date: startDate, end_date: endDate },
    );

    const { data: geographic, isLoading: geographicLoading, isError: geographicError, refetch: refetchGeographic } = useAnalyticsQuery<GeographicDistribution>(
        ['user-analytics-geographic'],
        endpoints.users.analytics.geographic,
    );

    const { data: activity, isLoading: activityLoading, isError: activityError, refetch: refetchActivity } = useAnalyticsQuery<UserActivity>(
        ['user-analytics-activity', startDate, endDate],
        endpoints.users.analytics.activity,
        { start_date: startDate, end_date: endDate },
    );

    const { data: affiliates, isLoading: affiliatesLoading, isError: affiliatesError, refetch: refetchAffiliates } = useAnalyticsQuery<AffiliateAnalytics>(
        ['user-analytics-affiliates', startDate, endDate],
        endpoints.users.analytics.affiliates,
        { start_date: startDate, end_date: endDate },
    );

    const { data: affiliateGrowth, isLoading: affiliateGrowthLoading, isError: affiliateGrowthError, refetch: refetchAffiliateGrowth } = useAnalyticsQuery<AffiliateGrowthTrend[]>(
        ['user-analytics-affiliate-growth', startDate, endDate, affiliateInterval],
        endpoints.users.analytics.affiliateGrowth,
        { start_date: startDate, end_date: endDate, interval: affiliateInterval },
    );

    const { data: demographics, isLoading: demographicsLoading, isError: demographicsError, refetch: refetchDemographics } = useAnalyticsQuery<CustomerDemographics>(
        ['user-analytics-demographics'],
        endpoints.users.analytics.customerDemographics,
    );

    const { data: topCustomers, isLoading: topCustomersLoading, isError: topCustomersError, refetch: refetchTopCustomers } = useAnalyticsQuery<TopCustomer[]>(
        ['user-analytics-top-customers', startDate, endDate],
        endpoints.users.analytics.topCustomers,
        { start_date: startDate, end_date: endDate, limit: 10 },
    );

    const handleApplyDateRange = () => { setAppliedDateRange(tempDateRange); toast.success('Date range applied'); };
    const handleResetDateRange = () => { const newRange = { from: addDays(new Date(), -30), to: new Date() }; setTempDateRange(newRange); setAppliedDateRange(newRange); toast.success('Date range reset'); };
    const handleRefresh = () => Promise.all([
        refetchOverview(), refetchGrowth(), refetchEngagement(), refetchGeographic(),
        refetchActivity(), refetchAffiliates(), refetchAffiliateGrowth(), refetchDemographics(), refetchTopCustomers(),
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Users Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive insights into user base, behavior, and engagement</p>
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
            {(overviewError || engagementError) && (
                <AlertMessage variant="error" message="Failed to load some overview metrics. Try refreshing." />
            )}
            <KPICards overview={overview} engagement={engagement} isLoading={overviewLoading || engagementLoading} />

            {/* Tabs - Each tab content loads independently */}
            <Tabs defaultValue="overview" className="space-y-4">
                <div className="overflow-x-auto">
                    <TabsList className="bg-gray-100 dark:bg-gray-900/50">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Overview</TabsTrigger>
                        <TabsTrigger value="growth" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Growth & Activity</TabsTrigger>
                        <TabsTrigger value="geographic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Geographic</TabsTrigger>
                        <TabsTrigger value="affiliates" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Affiliates</TabsTrigger>
                        <TabsTrigger value="demographics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Demographics</TabsTrigger>
                        <TabsTrigger value="top-customers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">Top Customers</TabsTrigger>
                    </TabsList>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {(growthError || overviewError || activityError) && (
                        <AlertMessage variant="error" message="Failed to load overview data." />
                    )}
                    <UserGrowthTrendChart
                        data={growthTrends || []}
                        isLoading={growthLoading}
                        chartColors={chartColors}
                        interval={growthInterval}
                        onIntervalChange={setGrowthInterval}
                    />
                    <RoleDistributionChart data={overview} isLoading={overviewLoading} />
                    <LoginActivitySection data={activity} isLoading={activityLoading} />
                </TabsContent>

                {/* Growth & Activity Tab */}
                <TabsContent value="growth" className="space-y-4">
                    {(activityError || engagementError) && (
                        <AlertMessage variant="error" message="Failed to load growth & activity data." />
                    )}
                    <RegistrationTimingSection data={activity} isLoading={activityLoading} chartColors={chartColors} />

                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">User Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-emerald-600">{engagement?.customer_engagement.active_percentage || 0}%</p>
                                    <p className="text-sm text-gray-500">Active Customers</p>
                                    <p className="text-xs text-gray-400">{formatNumber(engagement?.customer_engagement.active_customers || 0)} of {formatNumber(engagement?.customer_engagement.total_customers || 0)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{engagement?.customer_engagement.repeat_purchase_rate || 0}%</p>
                                    <p className="text-sm text-gray-500">Repeat Purchase Rate</p>
                                    <p className="text-xs text-gray-400">{formatNumber(engagement?.customer_engagement.repeat_customers || 0)} repeat customers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-amber-600">{engagement?.guest_conversion.conversion_rate || 0}%</p>
                                    <p className="text-sm text-gray-500">Guest Conversion Rate</p>
                                    <p className="text-xs text-gray-400">{formatNumber(engagement?.guest_conversion.converted_guests || 0)} converted guests</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Geographic Tab */}
                <TabsContent value="geographic" className="space-y-4">
                    {geographicError && <AlertMessage variant="error" message="Failed to load geographic data." />}
                    <GeographicDistributionSection data={geographic} isLoading={geographicLoading} />
                </TabsContent>

                {/* Affiliates Tab */}
                <TabsContent value="affiliates" className="space-y-4">
                    {(affiliatesError || affiliateGrowthError) && (
                        <AlertMessage variant="error" message="Failed to load affiliate data." />
                    )}
                    <AffiliateAnalyticsSection
                        data={affiliates}
                        growthData={affiliateGrowth}
                        isLoading={affiliatesLoading || affiliateGrowthLoading}
                        chartColors={chartColors}
                    />
                </TabsContent>

                {/* Demographics Tab */}
                <TabsContent value="demographics" className="space-y-4">
                    {demographicsError && <AlertMessage variant="error" message="Failed to load demographics data." />}
                    <CustomerDemographicsSection data={demographics} isLoading={demographicsLoading} />
                </TabsContent>

                {/* Top Customers Tab */}
                <TabsContent value="top-customers" className="space-y-4">
                    {topCustomersError && <AlertMessage variant="error" message="Failed to load top customers data." />}
                    <TopCustomersTable data={topCustomers} isLoading={topCustomersLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
