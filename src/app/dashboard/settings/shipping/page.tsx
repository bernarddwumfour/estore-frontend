// app/dashboard/settings/shipping/page.tsx
'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronDown, ChevronUp, Gift, Globe, Loader2, MapPin, Pencil, Plus, Save, Store,
    Trash2, Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import { Switch } from '@/components/ui/switch';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import RefreshButton from '@/widgets/RefreshButton/RefreshButton';

/* ---------------- Types ---------------- */

interface CountryEntry { code: string; name: string }
interface RateEntry { base: string; per_kg: string; free_shipping_threshold: string }
interface MethodEntry { name: string; multiplier: string; estimated_days: string; enabled?: boolean }
interface PopularAddress {
    id: string;
    name: string;
    region: string;
    country: string;
    price: string;
    is_free?: boolean;
    active: boolean;
}

interface ShippingConfig {
    use_carrier_rates: boolean;
    terminal_africa_configured: boolean;
    free_shipping_all: boolean;
    free_shipping_threshold: string | null;
    pickup_enabled: boolean;
    handling_fee: string;
    max_shipping_cap: string | null;
    fallback_surcharge_percent: string;
    allowed_countries: CountryEntry[];
    fallback_rates: Record<string, RateEntry>;
    shipping_methods: Record<string, MethodEntry>;
    popular_addresses: PopularAddress[];
    updated_at: string | null;
}

const fetchConfig = async (): Promise<ShippingConfig> => {
    const response = await securityAxios.get(endpoints.orders.adminShippingConfig);
    return response.data.data;
};

const inputClass =
    'w-full p-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40';

function useSaveConfig(successMessage: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const response = await securityAxios.post(endpoints.orders.adminShippingConfig, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success(successMessage);
            queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to save shipping settings')),
    });
}

/* ---------------- Small building blocks ---------------- */

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

/* ---------------- Carrier + pickup toggles ---------------- */

function CarrierCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Carrier setting saved');
    return (
        <SettingsCard
            icon={<Truck size={15} />}
            title="Carrier rates (Terminal Africa)"
            description="Quote live courier rates at checkout; internal rates are used as fallback"
            headerRight={
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.terminal_africa_configured
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'border border-gray-300 dark:border-gray-700 text-gray-500'}`}>
                    {config.terminal_africa_configured ? 'Configured' : 'Not configured'}
                </span>
            }
        >
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {config.use_carrier_rates
                        ? 'Live carrier rates are used when available.'
                        : 'Only the internal rate table is used.'}
                </p>
                <Switch
                    checked={config.use_carrier_rates}
                    disabled={save.isPending}
                    onCheckedChange={(next) => save.mutate({ use_carrier_rates: next })}
                />
            </div>
            {!config.terminal_africa_configured && config.use_carrier_rates && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Add TERMINAL_AFRICA_API_KEY to the backend environment to activate live rates. Until then the internal rates below apply.
                </p>
            )}
        </SettingsCard>
    );
}

function PickupCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Pickup setting saved');
    return (
        <SettingsCard
            icon={<Store size={15} />}
            title="In-store pickup"
            description="Offer 'In-store Pickup — Free' as a delivery choice at checkout"
        >
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {config.pickup_enabled ? 'Customers can choose pickup at checkout.' : 'Pickup is not offered at web checkout.'}
                </p>
                <Switch
                    checked={config.pickup_enabled}
                    disabled={save.isPending}
                    onCheckedChange={(next) => save.mutate({ pickup_enabled: next })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Free shipping ---------------- */

function FreeShippingCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Free shipping settings saved');
    const [threshold, setThreshold] = useState(config.free_shipping_threshold ?? '');
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <SettingsCard
            icon={<Gift size={15} />}
            title="Free shipping"
            description="Make everything free, or free above an order amount"
        >
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    Free shipping for <span className="font-bold">all orders</span>
                    {config.free_shipping_all ? ' — active' : ''}
                </p>
                <Switch
                    checked={config.free_shipping_all}
                    disabled={save.isPending}
                    onCheckedChange={(next) => {
                        if (next) setConfirmOpen(true);
                        else save.mutate({ free_shipping_all: false });
                    }}
                />
            </div>

            <InfoDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Enable free shipping for everyone?"
                infoMessage="Every order will ship free regardless of destination or cart value. This overrides carrier rates, thresholds and popular-address prices."
                variant="info"
                primaryButtonText="Enable"
                secondaryButtonText="Cancel"
                primaryAction={() => { save.mutate({ free_shipping_all: true }); setConfirmOpen(false); }}
                secondaryAction={() => setConfirmOpen(false)}
            />

            <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Free above (order subtotal, GHS) — empty to disable
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Heads up: the per-country &quot;Free above&quot; values in the Internal rates card below also grant free
                        shipping on their own. Keep both above your typical cart value, or shipping will always be free.
                    </p>
                    <input
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        placeholder="e.g. 500"
                        className={inputClass}
                    />
                </div>
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({
                        free_shipping_threshold: threshold.trim() === '' ? null : threshold.trim(),
                    })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Allowed countries ---------------- */

function CountriesCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Shipping countries saved');
    const [countries, setCountries] = useState<CountryEntry[]>(config.allowed_countries);

    const update = (index: number, field: keyof CountryEntry, value: string) => {
        setCountries((current) => current.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    return (
        <SettingsCard
            icon={<Globe size={15} />}
            title="Shipping countries"
            description="Destinations you ship to — leave empty to ship anywhere"
        >
            <div className="space-y-2">
                {countries.map((country, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            value={country.code}
                            onChange={(e) => update(index, 'code', e.target.value.toUpperCase())}
                            placeholder="GH"
                            maxLength={2}
                            className={`${inputClass} w-16 uppercase text-center`}
                        />
                        <input
                            value={country.name}
                            onChange={(e) => update(index, 'name', e.target.value)}
                            placeholder="Ghana"
                            className={inputClass}
                        />
                        <button
                            onClick={() => setCountries((c) => c.filter((_, i) => i !== index))}
                            className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Remove"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {countries.length === 0 && (
                    <p className="text-xs text-gray-500">No restrictions — orders can ship to any country.</p>
                )}
            </div>
            <div className="flex justify-between">
                <Button
                    size="sm" variant="outline" className="gap-1.5 rounded-full"
                    onClick={() => setCountries((c) => [...c, { code: '', name: '' }])}
                >
                    <Plus size={14} /> Add country
                </Button>
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({ allowed_countries: countries })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Popular addresses ---------------- */

const emptyAddress: PopularAddress = {
    id: '', name: '', region: '', country: 'GH', price: '0.00', active: true,
};

function PopularAddressesCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Popular addresses saved');
    const [editing, setEditing] = useState<PopularAddress | null>(null);
    const [deleting, setDeleting] = useState<PopularAddress | null>(null);

    const persist = (next: PopularAddress[]) => save.mutate({
        popular_addresses: next.map((addr) => ({
            ...(addr.id ? { id: addr.id } : {}),
            name: addr.name,
            region: addr.region,
            country: addr.country,
            price: addr.price,
            active: addr.active,
        })),
    });

    const upsert = () => {
        if (!editing) return;
        if (!editing.name.trim() || !editing.region.trim() || editing.country.trim().length !== 2) {
            toast.error('Name, region and a 2-letter country code are required');
            return;
        }
        const list = [...config.popular_addresses];
        const index = list.findIndex((a) => a.id === editing.id);
        if (index >= 0) list[index] = editing;
        else list.push(editing);
        persist(list);
        setEditing(null);
    };

    return (
        <SettingsCard
            icon={<MapPin size={15} />}
            title="Popular addresses"
            description="Curated delivery areas (campuses, malls) offered as a dropdown at checkout — price 0 means free delivery"
            headerRight={
                <Button size="sm" className="gap-1.5 rounded-full" onClick={() => setEditing({ ...emptyAddress })}>
                    <Plus size={14} /> Add
                </Button>
            }
        >
            {config.popular_addresses.length === 0 ? (
                <p className="text-xs text-gray-500">
                    None yet. Add areas like &quot;University of Ghana - Legon&quot; so customers there get one-click (often free) delivery.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-900">
                    {config.popular_addresses.map((addr) => (
                        <div key={addr.id} className="flex items-center gap-3 py-2.5">
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${addr.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                    {addr.name}
                                </p>
                                <p className="text-[11px] text-gray-500">{addr.region} · {addr.country}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${Number(addr.price) <= 0
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'}`}>
                                {Number(addr.price) <= 0 ? 'Free' : `GHS ${addr.price}`}
                            </span>
                            <button
                                onClick={() => setEditing({ ...addr })}
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => setDeleting(addr)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <CustomDialog
                title={editing?.id ? 'Edit popular address' : 'Add popular address'}
                description="Customers in this region can pick it from a dropdown at checkout"
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                contentWidth="max-w-[480px]"
            >
                {editing && (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                value={editing.name}
                                onChange={(e) => setEditing((c) => c && { ...c, name: e.target.value })}
                                placeholder="University of Ghana - Legon"
                                className={inputClass}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Region</label>
                                <input
                                    value={editing.region}
                                    onChange={(e) => setEditing((c) => c && { ...c, region: e.target.value })}
                                    placeholder="Greater Accra"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Country code</label>
                                <input
                                    value={editing.country}
                                    onChange={(e) => setEditing((c) => c && { ...c, country: e.target.value.toUpperCase() })}
                                    maxLength={2}
                                    className={`${inputClass} uppercase`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Delivery price (0 = free)
                                </label>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={editing.price}
                                    onChange={(e) => setEditing((c) => c && { ...c, price: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex items-center justify-between pb-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active</span>
                                <Switch
                                    checked={editing.active}
                                    onCheckedChange={(next) => setEditing((c) => c && { ...c, active: next })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                            <SaveButton pending={save.isPending} onClick={upsert} label={editing.id ? 'Save' : 'Add'} />
                        </div>
                    </div>
                )}
            </CustomDialog>

            <InfoDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete popular address"
                infoMessage={`Remove "${deleting?.name}"? Customers will no longer see it at checkout.`}
                variant="error"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                primaryAction={() => {
                    if (deleting) persist(config.popular_addresses.filter((a) => a.id !== deleting.id));
                    setDeleting(null);
                }}
                secondaryAction={() => setDeleting(null)}
            />
        </SettingsCard>
    );
}

/* ---------------- Fallback rates & methods ---------------- */

function RatesCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Rates saved');
    const [rates, setRates] = useState(config.fallback_rates);
    const [methods, setMethods] = useState(config.shipping_methods);
    const [newCountry, setNewCountry] = useState('');

    const updateRate = (code: string, field: keyof RateEntry, value: string) => {
        setRates((current) => ({ ...current, [code]: { ...current[code], [field]: value } }));
    };
    const updateMethod = (key: string, field: keyof MethodEntry, value: string) => {
        setMethods((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
    };

    return (
        <SettingsCard
            icon={<Truck size={15} />}
            title="Internal rates & methods"
            description="Used when carrier rates are off or unavailable: cost = (base + weight × per kg) × method multiplier"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left text-gray-500">
                            <th className="py-1 pr-2 font-semibold">Country</th>
                            <th className="py-1 pr-2 font-semibold">Base</th>
                            <th className="py-1 pr-2 font-semibold">Per kg</th>
                            <th className="py-1 pr-2 font-semibold">Free above (per country)</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(rates).map(([code, rate]) => (
                            <tr key={code}>
                                <td className="py-1 pr-2 font-bold text-gray-900 dark:text-white">{code}</td>
                                {(['base', 'per_kg', 'free_shipping_threshold'] as const).map((field) => (
                                    <td key={field} className="py-1 pr-2">
                                        <input
                                            type="number" min="0" step="0.01"
                                            value={rate[field]}
                                            onChange={(e) => updateRate(code, field, e.target.value)}
                                            className={`${inputClass} w-24`}
                                        />
                                    </td>
                                ))}
                                <td>
                                    {code !== 'DEFAULT' && (
                                        <button
                                            onClick={() => setRates((c) => {
                                                const next = { ...c };
                                                delete next[code];
                                                return next;
                                            })}
                                            className="p-1.5 rounded-full text-gray-400 hover:text-rose-600"
                                            title="Remove"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 items-center">
                <input
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                    placeholder="Country code e.g. NG"
                    maxLength={2}
                    className={`${inputClass} w-40 uppercase`}
                />
                <Button
                    size="sm" variant="outline" className="gap-1.5 rounded-full"
                    onClick={() => {
                        const code = newCountry.trim();
                        if (code.length !== 2) { toast.error('Enter a 2-letter country code'); return; }
                        setRates((c) => ({
                            [code]: { base: '15.00', per_kg: '5.00', free_shipping_threshold: '500.00' },
                            ...c,
                        }));
                        setNewCountry('');
                    }}
                >
                    <Plus size={14} /> Add country rates
                </Button>
            </div>
            <p className="text-[11px] text-gray-500">
                Orders above a country&apos;s &quot;Free above&quot; value ship free automatically. Set it very high
                (e.g. 999999) to never give free shipping for that country.
            </p>

            <div className="border-t border-gray-100 dark:border-gray-900 pt-3 space-y-2">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Methods (on/off · name · multiplier · delivery estimate)</p>
                {Object.entries(methods).map(([key, method]) => {
                    const enabled = method.enabled !== false;
                    return (
                    <div key={key} className={`grid grid-cols-[auto_1fr_5rem_1fr] gap-2 items-center ${enabled ? '' : 'opacity-50'}`}>
                        <Switch
                            checked={enabled}
                            disabled={save.isPending}
                            onCheckedChange={(next) => {
                                const enabledCount = Object.values(methods).filter((m) => m.enabled !== false).length;
                                if (!next && enabledCount <= 1) {
                                    toast.error('At least one shipping method must stay enabled');
                                    return;
                                }
                                const updated = { ...methods, [key]: { ...method, enabled: next } };
                                setMethods(updated);
                                save.mutate({ shipping_methods: updated });
                            }}
                            title={enabled ? 'Offered at checkout' : 'Hidden from checkout'}
                        />
                        <input
                            value={method.name}
                            onChange={(e) => updateMethod(key, 'name', e.target.value)}
                            className={inputClass}
                        />
                        <input
                            type="number" min="0.1" step="0.1"
                            value={method.multiplier}
                            onChange={(e) => updateMethod(key, 'multiplier', e.target.value)}
                            className={inputClass}
                            title="Multiplier"
                        />
                        <input
                            value={method.estimated_days}
                            onChange={(e) => updateMethod(key, 'estimated_days', e.target.value)}
                            placeholder="3-7 business days"
                            className={inputClass}
                        />
                    </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <SaveButton
                    pending={save.isPending}
                    onClick={() => save.mutate({ fallback_rates: rates, shipping_methods: methods })}
                />
            </div>
        </SettingsCard>
    );
}

/* ---------------- Advanced ---------------- */

function AdvancedCard({ config }: { config: ShippingConfig }) {
    const save = useSaveConfig('Advanced settings saved');
    const [open, setOpen] = useState(false);
    const [handlingFee, setHandlingFee] = useState(config.handling_fee);
    const [maxCap, setMaxCap] = useState(config.max_shipping_cap ?? '');
    const [surcharge, setSurcharge] = useState(config.fallback_surcharge_percent);

    return (
        <section className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between text-left"
            >
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Advanced</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Handling fee, shipping cap, internal-rate surcharge</p>
                </div>
                {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {open && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Handling fee (GHS)</label>
                            <input type="number" min="0" step="0.01" value={handlingFee}
                                onChange={(e) => setHandlingFee(e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Max shipping cap (empty = none)</label>
                            <input type="number" min="0" step="0.01" value={maxCap}
                                onChange={(e) => setMaxCap(e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Internal surcharge (%)</label>
                            <input type="number" min="0" max="100" step="0.5" value={surcharge}
                                onChange={(e) => setSurcharge(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <SaveButton
                            pending={save.isPending}
                            onClick={() => save.mutate({
                                handling_fee: handlingFee || '0.00',
                                max_shipping_cap: maxCap.trim() === '' ? null : maxCap.trim(),
                                fallback_surcharge_percent: surcharge || '0.00',
                            })}
                        />
                    </div>
                </>
            )}
        </section>
    );
}

/* ---------------- Page ---------------- */

export default function ShippingSettingsPage() {
    const { data: config, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['shipping-config'],
        queryFn: fetchConfig,
        retry: false,
    });

    return (
        <div className="container mx-auto space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shipping Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Rates, free-shipping rules, delivery areas and pickup
                    </p>
                </div>
                <RefreshButton
                    onRefresh={() => refetch()}
                    queryKey={['shipping-config']}
                    successMessage="Shipping settings refreshed"
                />
            </div>

            {isLoading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={28} />
                </div>
            ) : isError || !config ? (
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">
                        {apiMessage(error, 'Failed to load shipping configuration')}
                    </p>
                </div>
            ) : (
                // key remounts the editors after each save/refetch so their
                // local draft state re-initializes from the fresh config
                <React.Fragment key={config.updated_at ?? 'initial'}>
                    <CarrierCard config={config} />
                    <FreeShippingCard config={config} />
                    <PopularAddressesCard config={config} />
                    <CountriesCard config={config} />
                    <PickupCard config={config} />
                    <RatesCard config={config} />
                    <AdvancedCard config={config} />
                </React.Fragment>
            )}
        </div>
    );
}
