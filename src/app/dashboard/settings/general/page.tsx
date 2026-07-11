// app/dashboard/settings/general/page.tsx
'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Bell, ClipboardList, CreditCard, Loader2, Package, Save, Store,
} from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import RefreshButton from '@/widgets/RefreshButton/RefreshButton';

/* ---------------- Types ---------------- */

type NotificationChannels = { email: boolean; sms: boolean; whatsapp: boolean };

interface GeneralConfig {
    paystack_enabled: boolean;
    pod_enabled: boolean;
    default_payment_method: 'paystack' | 'pod';
    pod_max_order_value: string;
    pod_max_quantity: number;
    paystack_min_amount: string;
    paystack_max_amount: string;
    notifications: Record<string, NotificationChannels>;
    guest_checkout_enabled: boolean;
    min_order_value: string;
    order_number_prefix: string;
    auto_cancel_unpaid_hours: number;
    store_name: string;
    support_email: string;
    support_phone: string;
    currency: string;
    store_country: string;
    store_state: string;
    store_city: string;
    store_postal_code: string;
    store_address: string;
    default_low_stock_threshold: number;
    hide_out_of_stock: boolean;
    tax_rate: string;
    tax_inclusive: boolean;
    updated_at: string | null;
}

const NOTIFICATION_EVENTS: { key: string; label: string }[] = [
    { key: 'order_confirmation', label: 'Order confirmed' },
    { key: 'order_shipped', label: 'Order shipped' },
    { key: 'order_delivered', label: 'Order delivered' },
];
const NOTIFICATION_CHANNELS: { key: keyof NotificationChannels; label: string; connected: boolean }[] = [
    { key: 'email', label: 'Email', connected: true },
    { key: 'sms', label: 'SMS', connected: false },
    { key: 'whatsapp', label: 'WhatsApp', connected: false },
];

const fetchConfig = async (): Promise<GeneralConfig> => {
    const response = await securityAxios.get(endpoints.common.adminGeneralConfig);
    return response.data.data;
};

const inputClass =
    'w-full p-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40';

function useSaveConfig(successMessage: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const response = await securityAxios.post(endpoints.common.adminGeneralConfig, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success(successMessage);
            queryClient.invalidateQueries({ queryKey: ['general-config'] });
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to save settings')),
    });
}

/* ---------------- Building blocks ---------------- */

function SettingsCard({ icon, title, description, children, headerRight }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}) {
    return (
        <section className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 shrink-0">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>
                {headerRight}
            </div>
            {children}
        </section>
    );
}

function SaveButton({ pending, onClick, label = 'Save' }: {
    pending: boolean;
    onClick: () => void;
    label?: string;
}) {
    return (
        <Button size="sm" onClick={onClick} disabled={pending} className="gap-2 rounded-full">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {label}
        </Button>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
        </div>
    );
}

/* ---------------- Payments ---------------- */

function PaymentsCard({ config }: { config: GeneralConfig }) {
    const save = useSaveConfig('Payment settings saved');
    const [form, setForm] = useState({
        default_payment_method: config.default_payment_method,
        pod_max_order_value: config.pod_max_order_value,
        pod_max_quantity: String(config.pod_max_quantity),
        paystack_min_amount: config.paystack_min_amount,
        paystack_max_amount: config.paystack_max_amount,
    });

    return (
        <SettingsCard
            icon={<CreditCard size={15} />}
            title="Payments"
            description="Which payment methods are offered at checkout, and their limits"
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Paystack (card, transfer, mobile money)</p>
                    <Switch
                        checked={config.paystack_enabled}
                        disabled={save.isPending}
                        onCheckedChange={(next) => save.mutate({ paystack_enabled: next })}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Pay on Delivery</p>
                    <Switch
                        checked={config.pod_enabled}
                        disabled={save.isPending}
                        onCheckedChange={(next) => save.mutate({ pod_enabled: next })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-900 pt-4">
                <Field label="Default method">
                    <select
                        value={form.default_payment_method}
                        onChange={(e) => setForm((c) => ({ ...c, default_payment_method: e.target.value as 'paystack' | 'pod' }))}
                        className={inputClass}
                    >
                        <option value="paystack">Paystack</option>
                        <option value="pod">Pay on Delivery</option>
                    </select>
                </Field>
                <Field label={`POD max order value (${config.currency})`}>
                    <input type="number" min="0" step="0.01" value={form.pod_max_order_value}
                        onChange={(e) => setForm((c) => ({ ...c, pod_max_order_value: e.target.value }))} className={inputClass} />
                </Field>
                <Field label="POD max items">
                    <input type="number" min="1" value={form.pod_max_quantity}
                        onChange={(e) => setForm((c) => ({ ...c, pod_max_quantity: e.target.value }))} className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Paystack min">
                        <input type="number" min="0" step="0.01" value={form.paystack_min_amount}
                            onChange={(e) => setForm((c) => ({ ...c, paystack_min_amount: e.target.value }))} className={inputClass} />
                    </Field>
                    <Field label="Paystack max">
                        <input type="number" min="0" step="0.01" value={form.paystack_max_amount}
                            onChange={(e) => setForm((c) => ({ ...c, paystack_max_amount: e.target.value }))} className={inputClass} />
                    </Field>
                </div>
            </div>
            <div className="flex justify-end">
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({
                        default_payment_method: form.default_payment_method,
                        pod_max_order_value: form.pod_max_order_value,
                        pod_max_quantity: Number(form.pod_max_quantity),
                        paystack_min_amount: form.paystack_min_amount,
                        paystack_max_amount: form.paystack_max_amount,
                    })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Notifications ---------------- */

function NotificationsCard({ config }: { config: GeneralConfig }) {
    const save = useSaveConfig('Notification settings saved');
    const [grid, setGrid] = useState<Record<string, NotificationChannels>>(
        () => structuredClone(config.notifications)
    );

    const toggle = (event: string, channel: keyof NotificationChannels) => {
        setGrid((current) => ({
            ...current,
            [event]: { ...current[event], [channel]: !current[event]?.[channel] },
        }));
    };

    return (
        <SettingsCard
            icon={<Bell size={15} />}
            title="Order notifications"
            description="Which updates customers receive as their order progresses"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="py-2 pr-3 text-xs font-semibold text-gray-500">Event</th>
                            {NOTIFICATION_CHANNELS.map((channel) => (
                                <th key={channel.key} className="py-2 px-3 text-xs font-semibold text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        {channel.label}
                                        {!channel.connected && (
                                            <span className="px-1.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                provider not connected
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {NOTIFICATION_EVENTS.map((event) => (
                            <tr key={event.key} className="border-t border-gray-100 dark:border-gray-900">
                                <td className="py-2.5 pr-3 text-gray-700 dark:text-gray-300">{event.label}</td>
                                {NOTIFICATION_CHANNELS.map((channel) => (
                                    <td key={channel.key} className="py-2.5 px-3">
                                        <Switch
                                            checked={grid[event.key]?.[channel.key] ?? false}
                                            onCheckedChange={() => toggle(event.key, channel.key)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-[11px] text-gray-500">
                SMS and WhatsApp switches are stored but do nothing until a messaging provider is integrated.
            </p>
            <div className="flex justify-end">
                <SaveButton pending={save.isPending} onClick={() => save.mutate({ notifications: grid })} />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Order rules ---------------- */

function OrderRulesCard({ config }: { config: GeneralConfig }) {
    const save = useSaveConfig('Order rules saved');
    const [form, setForm] = useState({
        min_order_value: config.min_order_value,
        order_number_prefix: config.order_number_prefix,
        auto_cancel_unpaid_hours: String(config.auto_cancel_unpaid_hours),
    });

    return (
        <SettingsCard
            icon={<ClipboardList size={15} />}
            title="Order rules"
            description="Checkout requirements and order housekeeping"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Guest checkout</p>
                    <p className="text-[11px] text-gray-500">When off, customers must sign in to place an order</p>
                </div>
                <Switch
                    checked={config.guest_checkout_enabled}
                    disabled={save.isPending}
                    onCheckedChange={(next) => save.mutate({ guest_checkout_enabled: next })}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-100 dark:border-gray-900 pt-4">
                <Field label={`Minimum order value (${config.currency})`} hint="0 = no minimum">
                    <input type="number" min="0" step="0.01" value={form.min_order_value}
                        onChange={(e) => setForm((c) => ({ ...c, min_order_value: e.target.value }))} className={inputClass} />
                </Field>
                <Field label="Order number prefix" hint='e.g. "ORD" → ORD202607101234'>
                    <input value={form.order_number_prefix} maxLength={10}
                        onChange={(e) => setForm((c) => ({ ...c, order_number_prefix: e.target.value.toUpperCase() }))}
                        className={`${inputClass} uppercase`} />
                </Field>
                <Field label="Auto-cancel unpaid after (hours)" hint="0 = never; frees reserved stock">
                    <input type="number" min="0" value={form.auto_cancel_unpaid_hours}
                        onChange={(e) => setForm((c) => ({ ...c, auto_cancel_unpaid_hours: e.target.value }))} className={inputClass} />
                </Field>
            </div>
            <div className="flex justify-end">
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({
                        min_order_value: form.min_order_value,
                        order_number_prefix: form.order_number_prefix,
                        auto_cancel_unpaid_hours: Number(form.auto_cancel_unpaid_hours),
                    })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Store identity ---------------- */

function StoreIdentityCard({ config }: { config: GeneralConfig }) {
    const save = useSaveConfig('Store details saved');
    const [form, setForm] = useState({
        store_name: config.store_name,
        support_email: config.support_email,
        support_phone: config.support_phone,
        currency: config.currency,
        store_country: config.store_country,
        store_state: config.store_state,
        store_city: config.store_city,
        store_postal_code: config.store_postal_code,
        store_address: config.store_address,
    });

    const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((c) => ({ ...c, [field]: e.target.value }));

    return (
        <SettingsCard
            icon={<Store size={15} />}
            title="Store identity"
            description="Name and contact details used in emails; address is the shipping origin for carrier quotes"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Store name" hint="Shown in customer email subjects">
                    <input value={form.store_name} onChange={update('store_name')} placeholder="My Store" className={inputClass} />
                </Field>
                <Field label="Currency (3-letter code)">
                    <input value={form.currency} maxLength={3}
                        onChange={(e) => setForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))}
                        className={`${inputClass} uppercase`} />
                </Field>
                <Field label="Support email">
                    <input type="email" value={form.support_email} onChange={update('support_email')} className={inputClass} />
                </Field>
                <Field label="Support phone">
                    <input value={form.support_phone} onChange={update('support_phone')} className={inputClass} />
                </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 dark:border-gray-900 pt-4">
                <Field label="Country (2-letter)">
                    <input value={form.store_country} maxLength={2}
                        onChange={(e) => setForm((c) => ({ ...c, store_country: e.target.value.toUpperCase() }))}
                        className={`${inputClass} uppercase`} />
                </Field>
                <Field label="Region/State">
                    <input value={form.store_state} onChange={update('store_state')} className={inputClass} />
                </Field>
                <Field label="City">
                    <input value={form.store_city} onChange={update('store_city')} className={inputClass} />
                </Field>
                <Field label="Postal code">
                    <input value={form.store_postal_code} onChange={update('store_postal_code')} className={inputClass} />
                </Field>
                <div className="col-span-2 sm:col-span-4">
                    <Field label="Street address">
                        <input value={form.store_address} onChange={update('store_address')} className={inputClass} />
                    </Field>
                </div>
            </div>
            <div className="flex justify-end">
                <SaveButton pending={save.isPending} onClick={() => save.mutate({ ...form })} />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Inventory ---------------- */

function InventoryCard({ config }: { config: GeneralConfig }) {
    const save = useSaveConfig('Inventory settings saved');
    const [form, setForm] = useState({
        default_low_stock_threshold: String(config.default_low_stock_threshold),
        tax_rate: config.tax_rate,
    });

    return (
        <SettingsCard
            icon={<Package size={15} />}
            title="Inventory & tax"
            description="Stock warnings, out-of-stock visibility, and order tax"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Hide out-of-stock products</p>
                    <p className="text-[11px] text-gray-500">Removed from storefront listings until restocked</p>
                </div>
                <Switch
                    checked={config.hide_out_of_stock}
                    disabled={save.isPending}
                    onCheckedChange={(next) => save.mutate({ hide_out_of_stock: next })}
                />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-900 pt-4">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Tax included in product prices</p>
                    <p className="text-[11px] text-gray-500">
                        When on, nothing is added at checkout — the storefront shows &quot;included in prices&quot;
                    </p>
                </div>
                <Switch
                    checked={config.tax_inclusive}
                    disabled={save.isPending}
                    onCheckedChange={(next) => save.mutate({ tax_inclusive: next })}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Default low-stock threshold" hint="Used when a variant doesn't set its own">
                    <input type="number" min="0" value={form.default_low_stock_threshold}
                        onChange={(e) => setForm((c) => ({ ...c, default_low_stock_threshold: e.target.value }))} className={inputClass} />
                </Field>
                <Field
                    label="Tax rate (%)"
                    hint={config.tax_inclusive
                        ? "Informational only while tax is included in prices"
                        : "Applied to order subtotals; 0 = tax off"}
                >
                    <input type="number" min="0" max="100" step="0.01" value={form.tax_rate}
                        onChange={(e) => setForm((c) => ({ ...c, tax_rate: e.target.value }))} className={inputClass} />
                </Field>
            </div>
            <div className="flex justify-end">
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({
                        default_low_stock_threshold: Number(form.default_low_stock_threshold),
                        tax_rate: form.tax_rate,
                    })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Page ---------------- */

export default function GeneralSettingsPage() {
    const { data: config, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['general-config'],
        queryFn: fetchConfig,
        retry: false,
    });

    return (
        <div className="container mx-auto space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">General Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Payments, notifications, order rules, store identity and inventory
                    </p>
                </div>
                <RefreshButton
                    onRefresh={() => refetch()}
                    queryKey={['general-config']}
                    successMessage="Settings refreshed"
                />
            </div>

            {isLoading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={28} />
                </div>
            ) : isError || !config ? (
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">
                        {apiMessage(error, 'Failed to load settings')}
                    </p>
                </div>
            ) : (
                // key remounts the editors after each save/refetch so their
                // local draft state re-initializes from the fresh config
                <React.Fragment key={config.updated_at ?? 'initial'}>
                    <PaymentsCard config={config} />
                    <NotificationsCard config={config} />
                    <OrderRulesCard config={config} />
                    <StoreIdentityCard config={config} />
                    <InventoryCard config={config} />
                </React.Fragment>
            )}
        </div>
    );
}
