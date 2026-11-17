'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { apiMessage } from '@/lib/api-message';
import { accountId as socialAccountId, accountLabel, type SocialAccount } from '@/widgets/social/social-shared';

type AIConfig = { ai_enabled: boolean; ai_semantic_search_enabled: boolean; ai_discovery_enabled: boolean; ai_shopper_enabled: boolean; ai_guest_enabled: boolean; ai_admin_enabled: boolean };
type SocialAI = { enabled: boolean; comments_enabled: boolean; configured: boolean; queue_backend: string; worker_online: boolean | null };
type Activity = { id: string; text: string; response: string; status: string; error: string; created_at: string };
const controls: Array<{key: keyof AIConfig; label: string}> = [
    {key: 'ai_enabled', label: 'Enable AI features'},
    {key: 'ai_semantic_search_enabled', label: 'Storefront semantic search'},
    {key: 'ai_discovery_enabled', label: 'Product discovery tools in chat'},
    {key: 'ai_shopper_enabled', label: 'Shopper assistant'},
    {key: 'ai_guest_enabled', label: 'Guest assistant'},
    {key: 'ai_admin_enabled', label: 'Admin assistant'},
];

export default function AISettingsPage() {
    const client = useQueryClient();
    const [account, setAccount] = useState('');
    const config = useQuery({queryKey: ['general-config'], queryFn: async () => (await securityAxios.get(endpoints.common.adminGeneralConfig)).data.data as AIConfig});
    const accounts = useQuery({queryKey: ['social-accounts'], queryFn: async () => (await securityAxios.get(endpoints.social.adminAccounts)).data.data.accounts as SocialAccount[], retry: false});
    const social = useQuery({queryKey: ['social-agent-account', account], enabled: !!account, queryFn: async () => (await securityAxios.get(`/social/admin/agent/accounts/${encodeURIComponent(account)}`)).data.data as SocialAI});
    const activity = useQuery({queryKey: ['social-agent-comments', account], enabled: !!account, queryFn: async () => (await securityAxios.get(`/social/admin/agent/comments?account_id=${encodeURIComponent(account)}`)).data.data.comments as Activity[]});
    const save = useMutation({mutationFn: (data: Partial<AIConfig>) => securityAxios.post(endpoints.common.adminGeneralConfig, data), onSuccess: () => {client.invalidateQueries({queryKey: ['general-config']}); toast.success('AI settings saved');}, onError: (error: unknown) => toast.error(apiMessage(error, 'Could not save AI settings'))});
    const saveSocial = useMutation({mutationFn: (data: Partial<Pick<SocialAI, 'enabled' | 'comments_enabled'>>) => securityAxios.put(`/social/admin/agent/accounts/${encodeURIComponent(account)}`, data), onSuccess: () => {social.refetch(); toast.success('Social AI settings saved');}, onError: (error: unknown) => toast.error(apiMessage(error, 'Could not save social AI settings'))});
    return <div className="container mx-auto space-y-5">
        <div><h1 className="text-2xl font-bold">AI Settings</h1><p className="text-sm text-gray-500">Manage AI features, assistants and social replies.</p></div>
        <section className="rounded-2xl border bg-white dark:bg-[#111114] p-5 space-y-4"><h2 className="font-bold">AI features and agents</h2><p className="text-xs text-gray-500">Standard keyword search remains available when AI is off.</p>
            {config.isLoading ? <Loader2 className="animate-spin" /> : config.data ? controls.map(({key,label}) => <div key={key} className="flex items-center justify-between gap-3"><label htmlFor={key} className="text-sm">{label}</label><Switch id={key} checked={config.data[key]} disabled={save.isPending || (key !== 'ai_enabled' && !config.data.ai_enabled)} onCheckedChange={value => save.mutate({[key]: value})} /></div>) : <p className="text-sm text-red-600">Could not load AI settings.</p>}
        </section>
        <section className="rounded-2xl border bg-white dark:bg-[#111114] p-5 space-y-4"><h2 className="font-bold">Social AI replies</h2><p className="text-xs text-gray-500">Choose a connected account to control automatic direct message and public comment replies.</p>
            <select aria-label="Social account" className="rounded-lg border bg-transparent p-2 text-sm" value={account} onChange={e => setAccount(e.target.value)}><option value="">Select an account</option>{accounts.data?.map(item => {const id = socialAccountId(item); return id ? <option key={id} value={id}>{accountLabel(item)}</option> : null;})}</select>
            {accounts.isError && <p className="text-sm text-red-600">Could not load social accounts. Connect an account in Social Settings.</p>}
            {social.data && <><div className="flex justify-between items-center gap-3"><span className="text-sm">Direct message replies</span><Switch checked={social.data.enabled} disabled={saveSocial.isPending || (!social.data.enabled && !social.data.configured)} onCheckedChange={enabled => saveSocial.mutate({enabled})} /></div><div className="flex justify-between items-center gap-3"><span className="text-sm">Public comment replies</span><Switch checked={social.data.comments_enabled} disabled={saveSocial.isPending || (!social.data.comments_enabled && !social.data.configured)} onCheckedChange={comments_enabled => saveSocial.mutate({comments_enabled})} /></div>{!social.data.configured && <p className="text-xs text-amber-600">Configure the webhook secret to enable replies.</p>}{social.data.queue_backend === 'database' && !social.data.worker_online && <p className="text-xs text-amber-600">The database worker is offline; incoming messages and comments will wait.</p>}</>}
        </section>
        {account && <section className="rounded-2xl border bg-white dark:bg-[#111114] p-5 space-y-3"><div className="flex justify-between items-center"><h2 className="font-bold">Comment reply activity</h2><Button variant="outline" size="sm" onClick={() => activity.refetch()}>Refresh</Button></div>{activity.isLoading ? <Loader2 className="animate-spin" /> : activity.isError ? <p className="text-sm text-red-600">Could not load comment activity.</p> : activity.data?.length ? activity.data.map(item => <div key={item.id} className="border-t py-3 space-y-1"><p className="text-sm">{item.text}</p>{item.response && <p className="text-sm text-gray-500">AI: {item.response}</p>}<p className="text-xs text-gray-500">{item.status.replace('_', ' ')}{item.error ? ` · ${item.error}` : ''} · {new Date(item.created_at).toLocaleString()}</p></div>) : <p className="text-sm text-gray-500">No comment activity yet.</p>}</section>}
    </div>;
}
