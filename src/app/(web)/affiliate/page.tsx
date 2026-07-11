'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    BadgePercent, Wallet, Clock, Users, Copy, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/currency';

interface CommissionRow {
    id: string;
    order_number: string;
    order_date: string;
    order_status: string;
    order_total: number;
    currency: string;
    discount_code: string | null;
    commission_rate: number;
    commission_amount: number;
    status: string;
    status_display: string;
}

interface DashboardData {
    affiliate: {
        referral_code: string;
        level: string;
        commission_rate: number;
        commission_basis: string;
        total_earnings: number;
        pending_earnings: number;
        paid_earnings: number;
        total_referrals: number;
        is_active: boolean;
    };
    summary: {
        order_count: number;
        order_total: number;
        earned: number;
        pending: number;
        reversed: number;
    };
    commissions: CommissionRow[];
    pagination: {
        current_page: number;
        total_pages: number;
        total: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const fetchDashboard = async (params: { year?: string; month?: string; page: number }): Promise<DashboardData> => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    if (params.month) query.append('month', params.month);
    query.append('page', String(params.page));
    const response = await securityAxios.get(`${endpoints.promotions.affiliateDashboard}?${query.toString()}`);
    return response.data.data;
};

const statusBadgeClass = (status: string) => {
    switch (status) {
        case 'accrued': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'reversed': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function AffiliatePage() {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(String(currentYear));
    const [page, setPage] = useState(1);

    // Filter by year only, or year+month; '' year = all time
    const { data, isLoading, isError } = useQuery({
        queryKey: ['affiliate-dashboard', year, month, page],
        queryFn: () => fetchDashboard({ year: year || undefined, month: month || undefined, page }),
        enabled: !!user?.id,
    });

    const copyReferralCode = () => {
        if (!data) return;
        navigator.clipboard.writeText(data.affiliate.referral_code);
        toast.success('Referral code copied');
    };

    if (user && user.is_affiliate === false) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md p-6">
                    <BadgePercent className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Not an affiliate yet</h2>
                    <p className="text-slate-500 mb-6">This page is only available to affiliate accounts.</p>
                    <Button asChild><Link href="/products">Continue Shopping</Link></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Affiliate Earnings</h1>
                    <p className="text-sm text-slate-500 mt-1">Orders placed with your referral code and what you have earned.</p>
                </div>
                {data && (
                    <button
                        onClick={copyReferralCode}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <span className="font-mono font-semibold text-slate-900">{data.affiliate.referral_code}</span>
                        <Copy size={14} className="text-slate-500" />
                        <Badge variant="outline" className="capitalize ml-1">{data.affiliate.level}</Badge>
                    </button>
                )}
            </div>

            {/* Lifetime summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100"><Wallet className="h-5 w-5 text-green-700" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Total Earned</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(data?.affiliate.total_earnings ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-700" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Pending Payout</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(data?.affiliate.pending_earnings ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100"><BadgePercent className="h-5 w-5 text-blue-700" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Commission Rate</p>
                            <p className="text-lg font-bold text-slate-900">{data ? `${data.affiliate.commission_rate}%` : '—'}</p>
                            {data && (
                                <p className="text-[11px] text-slate-400">
                                    of {data.affiliate.commission_basis === 'profit' ? 'profit' : 'sale amount'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-100"><Users className="h-5 w-5 text-violet-700" /></div>
                        <div>
                            <p className="text-xs text-slate-500">Referrals</p>
                            <p className="text-lg font-bold text-slate-900">{data?.affiliate.total_referrals ?? '—'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Period filter + period summary */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Filter period:</span>
                        <select
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            value={month}
                            onChange={(e) => { setMonth(e.target.value); setPage(1); }}
                        >
                            <option value="">All months</option>
                            {MONTHS.map((name, i) => (
                                <option key={name} value={String(i + 1)}>{name}</option>
                            ))}
                        </select>
                        <select
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            value={year}
                            onChange={(e) => { setYear(e.target.value); setPage(1); }}
                        >
                            <option value="">All years</option>
                            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                                <option key={y} value={String(y)}>{y}</option>
                            ))}
                        </select>
                        {(month || year) && (
                            <button
                                className="text-sm text-slate-500 underline hover:text-slate-800"
                                onClick={() => { setMonth(''); setYear(''); setPage(1); }}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {data && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500">Orders</p>
                                <p className="font-semibold text-slate-900">{data.summary.order_count}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Order Value</p>
                                <p className="font-semibold text-slate-900">{formatCurrency(data.summary.order_total)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Earned (period)</p>
                                <p className="font-semibold text-green-700">{formatCurrency(data.summary.earned)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pending (period)</p>
                                <p className="font-semibold text-amber-700">{formatCurrency(data.summary.pending)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Orders table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16 text-slate-500">Failed to load your affiliate orders.</div>
                    ) : !data || data.commissions.length === 0 ? (
                        <div className="text-center py-16">
                            <BadgePercent className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No orders for this period yet.</p>
                            <p className="text-sm text-slate-400 mt-1">Share your referral code to start earning.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Order Total</th>
                                        <th className="px-4 py-3">Rate</th>
                                        <th className="px-4 py-3">Commission</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.commissions.map((row) => (
                                        <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{row.order_number}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {new Date(row.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{formatCurrency(row.order_total)}</td>
                                            <td className="px-4 py-3 text-slate-600">{row.commission_rate}%</td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.commission_amount)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={statusBadgeClass(row.status)}>
                                                    {row.status_display}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {data && data.pagination.total_pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Page {data.pagination.current_page} of {data.pagination.total_pages} · {data.pagination.total} orders
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!data.pagination.has_previous}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!data.pagination.has_next}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
