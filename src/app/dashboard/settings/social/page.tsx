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
import { Switch } from '@/components/ui/switch';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage, type ApiError } from '@/lib/api-message';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';
import { UserAvatar } from '@/widgets/user-avatar/UserAvatar';
import { StatTile, accountId, accountLabel, accountProfileId, type SocialAccount } from '@/widgets/social/social-shared';

/* ---------------- Types & fetchers ---------------- */

interface SocialConfig {
    mode: 'test' | 'live';
    live_configured: boolean;
}

interface SocialProfile {
    _id?: string;
    id?: string;
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
    uploads?: number;
    uploads_limit?: number;
}

const CONNECT_PLATFORMS = [
    'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin', 'youtube',
    'whatsapp', 'threads', 'pinterest', 'reddit', 'bluesky', 'telegram',
    'googlebusiness', 'snapchat', 'discord',
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

const profileId = (profile: SocialProfile) => String(profile._id ?? profile.id ?? '');
const platformLabel = (platform: string) =>
    platform === 'googlebusiness'
        ? 'Google Business'
        : platform.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

/* ---------------- Mode switch ---------------- */

function ModeSwitch({ config }: { config: SocialConfig }) {
    const queryClient = useQueryClient();

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
            queryClient.invalidateQueries({ queryKey: ['social-config'] });
            queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
            queryClient.invalidateQueries({ queryKey: ['social-usage'] });
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to switch mode')),
    });

    const isTest = config.mode === 'test';

    return (
        <SettingsCard
            icon={isTest ? <FlaskConical size={15} /> : <Radio size={15} />}
            title="Posting mode"
            description="Choose simulated posting or live Zernio publishing"
            headerRight={
                <div className="flex items-center gap-2">
                    {modeMutation.isPending && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    <Switch
                        checked={!isTest}
                        disabled={modeMutation.isPending}
                        onCheckedChange={(checked) => modeMutation.mutate(checked ? 'live' : 'test')}
                        title={isTest ? 'Switch to live mode' : 'Switch to test mode'}
                    />
                </div>
            }
        >
            <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isTest ? 'Test mode is active' : 'Live mode is active'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isTest
                        ? 'Posts, comments and DMs are simulated locally; nothing reaches real platforms.'
                        : 'Posts are published to your connected accounts through Zernio.'}
                </p>
            </div>
            {!config.live_configured && (
                <p className="text-[11px] text-gray-500">
                    Live mode needs <code className="font-mono">ZERNIO_API_KEY</code> on the backend.
                </p>
            )}
        </SettingsCard>
    );
}

/* ---------------- Usage card ---------------- */

function UsageCard({ usage }: { usage: UsageStats }) {
    return (
        <SettingsCard
            icon={<BarChart3 size={15} />}
            title="Usage"
            description="Plan usage for connected accounts, posts, profiles and uploads"
            headerRight={usage.plan ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                    {usage.plan} plan
                </span>
            ) : undefined}
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatTile icon={<Users size={12} />} label={usage.accounts_limit ? `Accounts / ${usage.accounts_limit}` : 'Accounts'} value={usage.accounts_connected} />
                <StatTile icon={<Send size={12} />} label={usage.posts_limit ? `Posts / ${usage.posts_limit}` : 'Posts this month'} value={usage.posts_this_month} />
                <StatTile icon={<FolderKanban size={12} />} label="Profiles" value={usage.profiles} />
                <StatTile icon={<Heart size={12} />} label={usage.uploads_limit ? `Uploads / ${usage.uploads_limit}` : 'Uploads'} value={usage.uploads ?? 0} />
            </div>
        </SettingsCard>
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
        <SettingsCard
            icon={<FolderKanban size={15} />}
            title="Profiles"
            description="Group connected accounts by brand, region or publishing workflow"
        >
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
                            key={profileId(profile)}
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
                                {deletingId === profileId(profile)
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
                            onClick={() => renaming && renameMutation.mutate({ id: profileId(renaming), name: renameValue.trim() })}
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
                infoMessage={`Delete "${confirmDelete?.name}"? Zernio may block deletion while active accounts are still assigned to it.`}
                variant="error"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                primaryAction={() => {
                    if (confirmDelete) deleteMutation.mutate(profileId(confirmDelete));
                    setConfirmDelete(null);
                }}
                secondaryAction={() => setConfirmDelete(null)}
            />
        </SettingsCard>
    );
}

/* ---------------- Accounts card ---------------- */

function AccountsCard({ accounts, profiles, refetchAll, notConfigured, error, isError }: {
    accounts: SocialAccount[];
    profiles: SocialProfile[];
    refetchAll: () => void;
    notConfigured: boolean;
    isError: boolean;
    error: unknown;
}) {
    const [connectOpen, setConnectOpen] = useState(false);
    const [connectPlatform, setConnectPlatform] = useState('instagram');
    const [connectProfile, setConnectProfile] = useState('');
    const [confirmDisconnect, setConfirmDisconnect] = useState<SocialAccount | null>(null);
    const firstProfileId = profiles[0] ? profileId(profiles[0]) : '';
    const connectProfileValid = profiles.some((profile) => profileId(profile) === connectProfile);
    const selectedConnectProfile = connectProfileValid ? connectProfile : firstProfileId;

    const connectMutation = useMutation({
        mutationFn: async () => {
            const response = await securityAxios.post(endpoints.social.adminAccountConnect, {
                platform: connectPlatform,
                profile_id: selectedConnectProfile,
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
        <SettingsCard
            icon={<Link2 size={15} />}
            title="Connected accounts"
            description="Accounts available for publishing posts and managing inbox activity"
            headerRight={
                <Button
                    size="sm" className="gap-1.5 rounded-full"
                    onClick={() => {
                        setConnectProfile(profiles[0] ? profileId(profiles[0]) : '');
                        setConnectOpen(true);
                    }}
                >
                    <Plus size={14} /> Connect
                </Button>
            }
        >
            {notConfigured ? (
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
                                        value={accountProfileId(account)}
                                        disabled={movingId === id || disconnectMutation.isPending}
                                        onChange={(e) => e.target.value && moveMutation.mutate({ id, profileId: e.target.value })}
                                        className="p-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                        title="Move to profile"
                                    >
                                        <option value="">No profile</option>
                                        {profiles.map((p) => (
                                            <option key={profileId(p)} value={profileId(p)}>{p.name}</option>
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
                                <option key={p} value={p}>{platformLabel(p)}</option>
                            ))}
                        </select>
                    </div>
                    {profiles.length > 0 ? (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</label>
                            <select
                                value={selectedConnectProfile}
                                onChange={(e) => setConnectProfile(e.target.value)}
                                className={inputClass}
                            >
                                {profiles.map((p) => (
                                    <option key={profileId(p)} value={profileId(p)}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">
                            Create a profile before connecting an account.
                        </p>
                    )}
                    <div className="flex justify-end">
                        <Button
                            size="sm" className="gap-2 rounded-full px-5"
                            disabled={connectMutation.isPending || !selectedConnectProfile}
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
        </SettingsCard>
    );
}

/* ---------------- Page ---------------- */

export default function SocialSettingsPage() {
    const queryClient = useQueryClient();

    const configQuery = useQuery({
        queryKey: ['social-config'],
        queryFn: fetchConfig,
        retry: false,
    });

    const accountsQuery = useQuery({
        queryKey: ['social-accounts'],
        queryFn: fetchAccounts,
        retry: false,
    });

    const notConfigured = (accountsQuery.error as ApiError)?.response?.status === 503;

    const profilesQuery = useQuery({
        queryKey: ['social-profiles'],
        queryFn: fetchProfiles,
        enabled: accountsQuery.isSuccess,
        retry: false,
    });

    const usageQuery = useQuery({
        queryKey: ['social-usage'],
        queryFn: fetchUsage,
        enabled: accountsQuery.isSuccess,
        retry: false,
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: ['social-config'] });
        queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['social-usage'] });
    };

    const refreshAll = async () => {
        const [configResult, accountsResult] = await Promise.all([
            configQuery.refetch(),
            accountsQuery.refetch(),
        ]);

        if (accountsResult.isSuccess) {
            await Promise.all([
                profilesQuery.refetch(),
                usageQuery.refetch(),
            ]);
        }

        if (configResult.isError) return configResult;

        const accountStatus = (accountsResult.error as ApiError)?.response?.status;
        if (accountsResult.isError && accountStatus !== 503) return accountsResult;

        return configResult;
    };

    const isInitialLoading =
        configQuery.isLoading ||
        accountsQuery.isLoading ||
        (accountsQuery.isSuccess && (profilesQuery.isLoading || usageQuery.isLoading));
    const isFatalError =
        configQuery.isError ||
        (accountsQuery.isError && !notConfigured) ||
        (accountsQuery.isSuccess && profilesQuery.isError);
    const loadError = configQuery.error || accountsQuery.error || profilesQuery.error;

    return (
        <div className="container mx-auto space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Social Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posting mode, connected accounts, profiles and plan usage
                    </p>
                </div>
                <RefreshButton
                    onRefresh={refreshAll}
                    queryKey={['social-accounts']}
                    successMessage="Social settings refreshed"
                />
            </div>

            {isInitialLoading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={28} />
                </div>
            ) : isFatalError || !configQuery.data ? (
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">
                        {apiMessage(loadError, 'Failed to load social settings')}
                    </p>
                </div>
            ) : (
                <>
                    <ModeSwitch config={configQuery.data} />
                    {!notConfigured && usageQuery.data && <UsageCard usage={usageQuery.data} />}
                    <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5 items-start">
                        <AccountsCard
                            accounts={accountsQuery.data || []}
                            profiles={profilesQuery.data || []}
                            refetchAll={refetchAll}
                            notConfigured={notConfigured}
                            isError={accountsQuery.isError && !notConfigured}
                            error={accountsQuery.error}
                        />
                        {!notConfigured && (
                            <ProfilesCard profiles={profilesQuery.data || []} refetchAll={refetchAll} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
