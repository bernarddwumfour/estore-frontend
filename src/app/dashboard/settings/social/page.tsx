// app/dashboard/settings/social/page.tsx
'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BarChart3, FlaskConical, FolderKanban, Globe, Heart, Layers, Link2, Loader2, Pencil, Plus,
    Radio, Send, Trash2, Unplug, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage, type ApiError } from '@/lib/api-message';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import RefreshButton from '@/widgets/RefreshButton/RefreshButton';
import { UserAvatar } from '@/widgets/UserAvatar/UserAvatar';
import { StatTile, accountId, accountLabel, type SocialAccount } from '@/widgets/social/social-shared';

/* ---------------- Types & fetchers ---------------- */

interface SocialConfig {
    mode: 'test' | 'live';
    live_configured: boolean;
}

interface SocialProfile {
    _id: string;
    name: string;
    description?: string;
    accounts?: number;
}

interface UsageStats {
    plan: string;
    accounts_connected: number;
    accounts_limit: number;
    posts_this_month: number;
    posts_limit: number;
    profiles: number;
}

const CONNECT_PLATFORMS = [
    'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin', 'youtube',
    'whatsapp', 'threads', 'pinterest', 'reddit', 'bluesky', 'telegram',
    'google_business', 'snapchat', 'discord',
];

const fetchAccounts = async (): Promise<SocialAccount[]> => {
    const response = await securityAxios.get(endpoints.social.adminAccounts);
    return response.data?.data?.accounts || [];
};

const fetchConfig = async (): Promise<SocialConfig> => {
    const response = await securityAxios.get(endpoints.social.adminConfig);
    return response.data.data;
};

const fetchProfiles = async (): Promise<SocialProfile[]> => {
    const response = await securityAxios.get(endpoints.social.adminProfiles);
    return response.data?.data?.profiles || [];
};

const fetchUsage = async (): Promise<UsageStats> => {
    const response = await securityAxios.get(endpoints.social.adminUsage);
    return response.data.data.usage;
};

const inputClass =
    'w-full p-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40';

/* ---------------- Mode switch ---------------- */

function ModeSwitch() {
    const queryClient = useQueryClient();
    const { data: config, isLoading } = useQuery({
        queryKey: ['social-config'],
        queryFn: fetchConfig,
        retry: false,
    });

    const modeMutation = useMutation({
        mutationFn: async (mode: 'test' | 'live') => {
            const response = await securityAxios.post(endpoints.social.adminConfig, { mode });
            return response.data;
        },
        onSuccess: (response) => {
            const mode = response?.data?.mode;
            toast.success(
                mode === 'test'
                    ? 'Test mode on — posts and messages are simulated locally'
                    : 'Live mode on — posts go to your real social accounts'
            );
            queryClient.invalidateQueries();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to switch mode')),
    });

    if (isLoading) {
        return <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={18} /></div>;
    }

    const isTest = config?.mode === 'test';

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${isTest ? 'bg-gray-500' : 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900'}`}>
                        {isTest ? <FlaskConical size={15} /> : <Radio size={15} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {isTest ? 'Test mode' : 'Live mode'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isTest
                                ? 'Posts, comments and DMs are simulated locally — nothing reaches real platforms.'
                                : 'Posts are published to your connected accounts through Zernio.'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isTest}
                    disabled={modeMutation.isPending}
                    onClick={() => modeMutation.mutate(isTest ? 'live' : 'test')}
                    className={`relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full transition-colors ${isTest ? 'bg-gray-500' : 'bg-gray-900 dark:bg-gray-200'} ${modeMutation.isPending ? 'opacity-60' : ''}`}
                    title={isTest ? 'Switch to live mode' : 'Switch to test mode'}
                >
                    {modeMutation.isPending ? (
                        <Loader2 size={13} className="animate-spin text-white mx-auto" />
                    ) : (
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isTest ? 'translate-x-[28px]' : 'translate-x-1'}`} />
                    )}
                </button>
            </div>
            {!config?.live_configured && (
                <p className="text-[11px] text-gray-500">
                    Live mode needs <code className="font-mono">ZERNIO_API_KEY</code> on the backend.
                </p>
            )}
        </div>
    );
}

/* ---------------- Usage card ---------------- */

function UsageCard() {
    const { data: usage, isLoading, isError } = useQuery({
        queryKey: ['social-usage'],
        queryFn: fetchUsage,
        retry: false,
    });

    if (isError) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-gray-500">
                <BarChart3 size={14} />
                <h3 className="text-xs font-black uppercase tracking-wider">Usage {usage?.plan ? `· ${usage.plan} plan` : ''}</h3>
            </div>
            {isLoading ? (
                <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={18} /></div>
            ) : usage ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatTile icon={<Users size={12} />} label={`Accounts / ${usage.accounts_limit}`} value={usage.accounts_connected} />
                    <StatTile icon={<Send size={12} />} label={`Posts / ${usage.posts_limit}`} value={usage.posts_this_month} />
                    <StatTile icon={<FolderKanban size={12} />} label="Profiles" value={usage.profiles} />
                    <StatTile icon={<Heart size={12} />} label="Platforms" value={CONNECT_PLATFORMS.length} />
                </div>
            ) : null}
        </div>
    );
}

/* ---------------- Profiles card ---------------- */

function ProfilesCard({ profiles, refetchAll }: {
    profiles: SocialProfile[];
    refetchAll: () => void;
}) {
    const [newName, setNewName] = useState('');
    const [renaming, setRenaming] = useState<SocialProfile | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<SocialProfile | null>(null);

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await securityAxios.post(endpoints.social.adminProfiles, { name });
            return response.data;
        },
        onSuccess: () => { toast.success('Profile created'); setNewName(''); refetchAll(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to create profile')),
    });

    const renameMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const response = await securityAxios.patch(
                endpoints.social.adminProfileDetail.replace(':id', id), { name }
            );
            return response.data;
        },
        onSuccess: () => { toast.success('Profile renamed'); setRenaming(null); refetchAll(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to rename profile')),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await securityAxios.delete(
                endpoints.social.adminProfileDetail.replace(':id', id)
            );
            return response.data;
        },
        onSuccess: () => { toast.success('Profile deleted'); refetchAll(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to delete profile')),
    });

    const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-gray-500">
                <FolderKanban size={14} />
                <h3 className="text-xs font-black uppercase tracking-wider">Profiles</h3>
            </div>

            <div className="flex gap-2">
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && newName.trim() && !createMutation.isPending) {
                            createMutation.mutate(newName.trim());
                        }
                    }}
                    placeholder="New profile name..."
                    disabled={createMutation.isPending}
                    className={inputClass}
                />
                <Button
                    size="sm"
                    className="gap-1.5 rounded-lg shrink-0"
                    disabled={!newName.trim() || createMutation.isPending}
                    onClick={() => createMutation.mutate(newName.trim())}
                >
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add
                </Button>
            </div>

            {profiles.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No profiles yet — create one to organize your accounts.</p>
            ) : (
                <div className="space-y-1.5">
                    {profiles.map((profile) => (
                        <div
                            key={profile._id}
                            className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5"
                        >
                            <UserAvatar name={profile.name} size="sm" icon={<Layers size={13} />} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.name}</p>
                                <p className="text-[11px] text-gray-500">
                                    {profile.accounts ?? 0} account{(profile.accounts ?? 0) !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                                title="Rename"
                                disabled={deleteMutation.isPending || renameMutation.isPending}
                                onClick={() => { setRenaming(profile); setRenameValue(profile.name); }}
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 disabled:opacity-50"
                                title="Delete"
                                disabled={deleteMutation.isPending || renameMutation.isPending}
                                onClick={() => setConfirmDelete(profile)}
                            >
                                {deletingId === profile._id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Trash2 size={14} />}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <CustomDialog
                title="Rename Profile"
                open={!!renaming}
                onOpenChange={(open) => !open && setRenaming(null)}
                contentWidth="max-w-[400px]"
            >
                <div className="space-y-3">
                    <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                        disabled={renameMutation.isPending}
                        className={inputClass}
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm" className="gap-2 rounded-full px-5"
                            disabled={!renameValue.trim() || renameMutation.isPending}
                            onClick={() => renaming && renameMutation.mutate({ id: renaming._id, name: renameValue.trim() })}
                        >
                            {renameMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                            Save
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            <InfoDialog
                open={!!confirmDelete}
                onOpenChange={(open) => !open && setConfirmDelete(null)}
                title="Delete Profile"
                infoMessage={`Delete "${confirmDelete?.name}"? Its accounts stay connected but become unassigned.`}
                variant="error"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                primaryAction={() => {
                    if (confirmDelete) deleteMutation.mutate(confirmDelete._id);
                    setConfirmDelete(null);
                }}
                secondaryAction={() => setConfirmDelete(null)}
            />
        </div>
    );
}

/* ---------------- Accounts card ---------------- */

function AccountsCard({ accounts, profiles, refetchAll, notConfigured, isLoading, error, isError }: {
    accounts: SocialAccount[];
    profiles: SocialProfile[];
    refetchAll: () => void;
    notConfigured: boolean;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}) {
    const [connectOpen, setConnectOpen] = useState(false);
    const [connectPlatform, setConnectPlatform] = useState('instagram');
    const [connectProfile, setConnectProfile] = useState('');
    const [confirmDisconnect, setConfirmDisconnect] = useState<SocialAccount | null>(null);

    const connectMutation = useMutation({
        mutationFn: async () => {
            const response = await securityAxios.post(endpoints.social.adminAccountConnect, {
                platform: connectPlatform,
                ...(connectProfile ? { profile_id: connectProfile } : {}),
            });
            return response.data;
        },
        onSuccess: (response) => {
            const data = response?.data || {};
            if (data.url) {
                window.open(data.url, '_blank', 'noopener');
                toast.info('Complete the authorization on Zernio, then refresh this list.');
            } else {
                toast.success('Account connected');
            }
            setConnectOpen(false);
            refetchAll();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to start connection')),
    });

    const disconnectMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await securityAxios.delete(
                endpoints.social.adminAccountDisconnect.replace(':id', id)
            );
            return response.data;
        },
        onSuccess: () => { toast.success('Account disconnected'); refetchAll(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to disconnect account')),
    });

    const moveMutation = useMutation({
        mutationFn: async ({ id, profileId }: { id: string; profileId: string }) => {
            const response = await securityAxios.post(
                endpoints.social.adminAccountMove.replace(':id', id),
                { profile_id: profileId }
            );
            return response.data;
        },
        onSuccess: () => { toast.success('Account moved'); refetchAll(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to move account')),
    });

    const disconnectingId = disconnectMutation.isPending ? disconnectMutation.variables : null;
    const movingId = moveMutation.isPending ? moveMutation.variables?.id : null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-500">
                    <Link2 size={14} />
                    <h3 className="text-xs font-black uppercase tracking-wider">Connected accounts</h3>
                </div>
                <Button
                    size="sm" className="gap-1.5 rounded-full"
                    onClick={() => setConnectOpen(true)}
                >
                    <Plus size={14} /> Connect
                </Button>
            </div>

            {isLoading ? (
                <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={22} />
                </div>
            ) : notConfigured ? (
                <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    Social posting is not configured. Add your <code className="font-mono text-xs">ZERNIO_API_KEY</code> to
                    the backend environment, or flip on test mode above to try it out.
                </div>
            ) : isError ? (
                <p className="text-sm text-red-600 dark:text-red-400 py-2">
                    {apiMessage(error, 'Failed to load connected accounts')}
                </p>
            ) : accounts.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                    <Globe className="mx-auto text-gray-300 dark:text-gray-700" size={32} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No accounts connected yet</p>
                    <p className="text-xs text-gray-500">Use Connect to link Instagram, X, Facebook and more.</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {accounts.map((account) => {
                        const id = accountId(account);
                        return (
                            <div
                                key={id}
                                className="flex flex-wrap items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5"
                            >
                                <UserAvatar name={account.platform} size="sm" variant="neutral" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {accountLabel(account)}
                                    </p>
                                    <p className="text-[11px] text-gray-500 capitalize">
                                        {account.platform}
                                        {account.profileName ? ` · ${String(account.profileName)}` : ''}
                                    </p>
                                </div>
                                {profiles.length > 0 && (
                                    <select
                                        value={String(account.profileId || '')}
                                        disabled={movingId === id || disconnectMutation.isPending}
                                        onChange={(e) => e.target.value && moveMutation.mutate({ id, profileId: e.target.value })}
                                        className="p-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                        title="Move to profile"
                                    >
                                        <option value="">No profile</option>
                                        {profiles.map((p) => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                )}
                                {movingId === id && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                <button
                                    className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 disabled:opacity-50"
                                    title="Disconnect"
                                    disabled={disconnectMutation.isPending || moveMutation.isPending}
                                    onClick={() => setConfirmDisconnect(account)}
                                >
                                    {disconnectingId === id
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Unplug size={14} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <CustomDialog
                title="Connect an Account"
                description="Link a new social account through Zernio"
                open={connectOpen}
                onOpenChange={setConnectOpen}
                contentWidth="max-w-[420px]"
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</label>
                        <select
                            value={connectPlatform}
                            onChange={(e) => setConnectPlatform(e.target.value)}
                            className={inputClass}
                        >
                            {CONNECT_PLATFORMS.map((p) => (
                                <option key={p} value={p} className="capitalize">{p.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    {profiles.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile (optional)</label>
                            <select
                                value={connectProfile}
                                onChange={(e) => setConnectProfile(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Default</option>
                                {profiles.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button
                            size="sm" className="gap-2 rounded-full px-5"
                            disabled={connectMutation.isPending}
                            onClick={() => connectMutation.mutate()}
                        >
                            {connectMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                            Connect
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            <InfoDialog
                open={!!confirmDisconnect}
                onOpenChange={(open) => !open && setConfirmDisconnect(null)}
                title="Disconnect Account"
                infoMessage={`Disconnect ${confirmDisconnect ? accountLabel(confirmDisconnect) : ''} (${confirmDisconnect?.platform})? Posting to it will stop immediately.`}
                variant="error"
                primaryButtonText="Disconnect"
                secondaryButtonText="Cancel"
                primaryAction={() => {
                    if (confirmDisconnect) disconnectMutation.mutate(accountId(confirmDisconnect));
                    setConfirmDisconnect(null);
                }}
                secondaryAction={() => setConfirmDisconnect(null)}
            />
        </div>
    );
}

/* ---------------- Social section ---------------- */

function SocialSettingsSection() {
    const queryClient = useQueryClient();

    const accountsQuery = useQuery({
        queryKey: ['social-accounts'],
        queryFn: fetchAccounts,
        retry: false,
    });

    const profilesQuery = useQuery({
        queryKey: ['social-profiles'],
        queryFn: fetchProfiles,
        retry: false,
    });

    const notConfigured = (accountsQuery.error as ApiError)?.response?.status === 503;

    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['social-usage'] });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <RefreshButton
                    onRefresh={async () => { refetchAll(); return accountsQuery.refetch(); }}
                    queryKey={['social-accounts']}
                    label=""
                    className="h-8 w-8 p-0 rounded-full border-none"
                    successMessage="Social settings refreshed"
                />
            </div>

            <ModeSwitch />
            {!notConfigured && <UsageCard />}
            <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6 items-start">
                <div className="xl:border-r xl:border-gray-100 xl:dark:border-gray-900 xl:pr-6">
                    <AccountsCard
                        accounts={accountsQuery.data || []}
                        profiles={profilesQuery.data || []}
                        refetchAll={refetchAll}
                        notConfigured={notConfigured}
                        isLoading={accountsQuery.isLoading}
                        isError={accountsQuery.isError}
                        error={accountsQuery.error}
                    />
                </div>
                {!notConfigured && (
                    <ProfilesCard profiles={profilesQuery.data || []} refetchAll={refetchAll} />
                )}
            </div>
        </div>
    );
}

/* ---------------- Page ---------------- */

export default function SocialSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Social Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Posting mode, connected accounts, profiles and plan usage
                </p>
            </div>
            <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <SocialSettingsSection />
            </div>
        </div>
    );
}
