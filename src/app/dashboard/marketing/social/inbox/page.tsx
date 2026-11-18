// app/dashboard/marketing/social/inbox/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthCookie } from '@/lib/providers/auth-provider';
import { ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import { clockTime, timeAgo } from '@/lib/format-time';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';
import { UserAvatar } from '@/widgets/user-avatar/UserAvatar';
import { TestModeBadge } from '@/widgets/social/TestModeBadge';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';

interface Conversation {
    id?: string;
    _id?: string;
    conversationId?: string;
    conversation_id?: string;
    platform?: string;
    accountId?: string;
    account_id?: string;
    participantName?: string;
    accountUsername?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    lastMessageIsOwn?: boolean;
    [key: string]: unknown;
}

interface Message {
    id?: string;
    _id?: string;
    messageId?: string;
    message_id?: string;
    createdAt?: string;
    sentAt?: string;
    direction?: string;
    [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (source: Record<string, unknown> | null | undefined, keys: string[]) => {
    if (!source) return '';
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
        if (typeof value === 'number') return String(value);
    }
    return '';
};

const nestedName = (value: unknown) =>
    isRecord(value)
        ? readString(value, ['participantName', 'displayName', 'name', 'username', 'fullName', 'handle', 'title'])
        : '';

const conversationParticipantName = (c: Conversation) => {
    for (const key of ['participant', 'sender', 'contact', 'customer', 'user', 'from']) {
        const name = nestedName(c[key]);
        if (name) return name;
    }
    if (Array.isArray(c.participants)) {
        for (const participant of c.participants) {
            const name = nestedName(participant);
            if (name) return name;
        }
    }
    const lastMessage = c.lastMessage;
    if (isRecord(lastMessage)) {
        const fromName = nestedName(lastMessage.from) || nestedName(lastMessage.sender);
        if (fromName) return fromName;
    }
    return '';
};

const conversationId = (c: Conversation) =>
    readString(c, ['_id', 'id', 'conversationId', 'conversation_id']);
const conversationAccountId = (c: Conversation) =>
    readString(c, ['accountId', 'account_id'])
    || (isRecord(c.account) ? readString(c.account, ['_id', 'id', 'accountId']) : '');
const conversationName = (c: Conversation) => {
    const direct = readString(c, [
        'participantName', 'senderName', 'displayName', 'contactName', 'customerName',
        'name', 'username', 'accountUsername',
    ]);
    if (direct) return direct;
    const nested = conversationParticipantName(c);
    if (nested) return nested;
    const title = readString(c, ['title', 'subject']);
    return title && title.toLowerCase() !== 'conversation' ? title : 'Conversation';
};
const messageText = (m: Message | Record<string, unknown> | string | unknown): string => {
    if (typeof m === 'string') return m;
    if (!isRecord(m)) return '';
    const direct = readString(m, ['text', 'message', 'content', 'body']);
    if (direct) return direct;
    return isRecord(m.content) ? readString(m.content, ['text', 'message', 'body']) : '';
};
const conversationPreview = (c: Conversation) => messageText(c.lastMessage) || readString(c, ['preview', 'snippet']);
const messageTime = (m: Message) =>
    readString(m, ['sentAt', 'createdAt', 'created_at', 'timestamp', 'time']);
const conversationTime = (c: Conversation) =>
    readString(c, ['lastMessageAt', 'updatedTime', 'updatedAt', 'lastActivityAt']);
const isOutgoing = (m: Message) => {
    if (m.direction === 'outgoing') return true;
    if (m.direction === 'incoming') return false;
    return Boolean(m.isOwn ?? m.fromMe ?? m.outgoing ?? m.is_outgoing ?? false);
};
const lastMessageIsOwn = (c: Conversation) => {
    if (typeof c.lastMessageIsOwn === 'boolean') return c.lastMessageIsOwn;
    return isRecord(c.lastMessage) ? isOutgoing(c.lastMessage as Message) : false;
};

const PLATFORM_OPTIONS = [
    { value: '', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'X / Twitter' },
    { value: 'bluesky', label: 'Bluesky' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'telegram', label: 'Telegram' },
];

const fetchConversations = async (platform: string): Promise<Conversation[]> => {
    const suffix = platform ? `?platform=${encodeURIComponent(platform)}` : '';
    const response = await securityAxios.get(`${endpoints.social.adminConversations}${suffix}`);
    return response.data?.data?.conversations || [];
};

const fetchMessages = async (id: string, accountId: string): Promise<Message[]> => {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await securityAxios.get(`${endpoints.social.adminMessages.replace(':id', id)}${query}`);
    return response.data?.data?.messages || [];
};

/* ---------------- Conversation list item ---------------- */

function ConversationItem({ conversation, active, onSelect }: {
    conversation: Conversation;
    active: boolean;
    onSelect: () => void;
}) {
    const previewText = conversationPreview(conversation);
    const preview = previewText
        ? `${lastMessageIsOwn(conversation) ? 'You: ' : ''}${previewText}`
        : 'No messages yet';
    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${active
                ? 'bg-gray-100 dark:bg-gray-900 ring-1 ring-gray-300 dark:ring-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
        >
            <UserAvatar name={conversationName(conversation)} variant="neutral" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {conversationName(conversation)}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                        {timeAgo(conversationTime(conversation))}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 truncate">{preview}</p>
                    {conversation.platform ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-[9px] font-bold uppercase tracking-wider text-gray-500 shrink-0">
                            {String(conversation.platform)}
                        </span>
                    ) : null}
                </div>
            </div>
        </button>
    );
}

/* ---------------- Message thread ---------------- */

function MessageThread({ conversation, onBack, liveConnected }: {
    conversation: Conversation;
    onBack: () => void;
    liveConnected: boolean;
}) {
    const [reply, setReply] = useState('');
    const [takeoverOpen, setTakeoverOpen] = useState(false);
    const queryClient = useQueryClient();
    const bottomRef = useRef<HTMLDivElement>(null);
    const id = conversationId(conversation);
    const accountId = conversationAccountId(conversation);

    const threadAgent = useQuery({
        queryKey: ['social-agent-thread', accountId, id],
        queryFn: async () => (await securityAxios.get(`/social/admin/agent/conversations/${encodeURIComponent(id)}?account_id=${encodeURIComponent(accountId)}`)).data.data as {paused: boolean; ai_available: boolean; handler: 'ai' | 'staff'; needs_attention: boolean; activity: Array<{provider_message_id: string; reply_message_id: string; status: string; error: string}>},
        enabled: !!id && !!accountId,
        refetchInterval: liveConnected ? 60000 : 30000,
    });
    const toggleThread = useMutation({
        mutationFn: async (paused: boolean) => (await securityAxios.put(`/social/admin/agent/conversations/${encodeURIComponent(id)}?account_id=${encodeURIComponent(accountId)}`, {paused})).data.data,
        onSuccess: (data, paused) => {
            queryClient.setQueryData(['social-agent-thread', accountId, id], data);
            setTakeoverOpen(false);
            toast.success(paused ? 'You are handling this conversation' : 'Conversation handed over to AI');
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Could not update agent settings')),
    });

    const { data: messages, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['social-messages', id, accountId],
        queryFn: () => fetchMessages(id, accountId),
        enabled: !!id && !!accountId,
        retry: false,
        refetchInterval: liveConnected ? 60000 : 30000,
    });

    // keep the newest message in view, like any messenger
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMutation = useMutation({
        mutationFn: async (message: string) => {
            const response = await securityAxios.post(
                endpoints.social.adminMessageSend.replace(':id', id),
                { message, account_id: accountId }
            );
            return response.data;
        },
        onSuccess: () => {
            setReply('');
            refetch();
            threadAgent.refetch();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to send message')),
    });

    const staffHandling = threadAgent.data?.handler === 'staff';
    const canSend = !!accountId && staffHandling && !toggleThread.isPending && !threadAgent.isError;
    const handleSend = () => {
        if (!canSend || !reply.trim() || sendMutation.isPending) return;
        sendMutation.mutate(reply.trim());
    };

    return (
        <>
            {accountId && <div className="flex flex-wrap gap-2 items-center px-4 py-2 border-b text-xs">
                <span className="font-medium">{threadAgent.isError ? 'Unable to load conversation control' : !threadAgent.data ? 'Loading conversation control…' : staffHandling ? 'Handled by staff' : 'Handled by AI'}</span>
                {!staffHandling && threadAgent.data && <Button size="sm" variant="outline" disabled={toggleThread.isPending} onClick={() => setTakeoverOpen(true)}>Take over from AI</Button>}
                {staffHandling && <Button size="sm" variant="outline" disabled={!threadAgent.data?.ai_available || toggleThread.isPending || sendMutation.isPending} onClick={() => toggleThread.mutate(false)}>Hand over to AI</Button>}
                {staffHandling && !threadAgent.data?.ai_available && <span className="text-gray-500">Enable the guest assistant and social AI replies in AI settings to hand over.</span>}
                {threadAgent.data?.needs_attention && <span className="text-amber-600">Needs staff attention: {threadAgent.data.activity.find(item => item.error)?.error || "Review this conversation"}</span>}
            </div>}
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={onBack}
                    className="lg:hidden p-1 -ml-1 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    title="Back to conversations"
                >
                    <ArrowLeft size={18} />
                </button>
                <UserAvatar name={conversationName(conversation)} size="sm" variant="neutral" />
                <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {conversationName(conversation)}
                    </p>
                    {conversation.platform ? (
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                            {String(conversation.platform)}
                        </p>
                    ) : null}
                </div>
                <div className="ml-auto">
                    <RefreshButton
                        onRefresh={() => refetch()}
                        queryKey={['social-messages', id, accountId]}
                        label=""
                        className="h-8 w-8 p-0 rounded-full border-none"
                        successMessage="Messages refreshed"
                    />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!accountId ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                        This conversation is missing its account id.
                    </p>
                ) : isError ? (
                    <p className="text-sm text-red-600 dark:text-red-400 text-center py-8">
                        {apiMessage(error, 'Error loading messages')}
                    </p>
                ) : isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                ) : !messages || messages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No messages in this conversation.</p>
                ) : (
                    messages.map((message, index) => {
                        const outgoing = isOutgoing(message);
                        const providerId = String(message.id ?? message._id ?? message.messageId ?? message.message_id ?? "");
                        const agentReply = !!providerId && threadAgent.data?.activity.some(item => item.reply_message_id === providerId);
                        return (
                            <div
                                key={String(message._id ?? message.id ?? index)}
                                className={`flex flex-col max-w-[75%] ${outgoing ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                                <div
                                    className={`px-3 py-2 text-sm ${outgoing
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md'
                                        }`}
                                >
                                    {messageText(message)}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                                    {agentReply ? "AI · " : ""}{clockTime(messageTime(message))}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <InfoDialog open={takeoverOpen} onOpenChange={setTakeoverOpen}
                title="Take over from AI?"
                infoMessage="AI replies will pause for this conversation. You can reply manually and hand it back to AI later."
                primaryButtonText={toggleThread.isPending ? 'Taking over…' : 'Take over'}
                primaryAction={() => { if (!toggleThread.isPending) toggleThread.mutate(true); }}
                secondaryAction={() => setTakeoverOpen(false)} />
            {/* Reply box */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={threadAgent.data?.handler === 'ai' ? "AI is handling this conversation" : "Type a message..."}
                    disabled={sendMutation.isPending || !canSend}
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-60"
                />
                <Button
                    disabled={!reply.trim() || sendMutation.isPending || !canSend}
                    onClick={handleSend}
                    className="rounded-full gap-2"
                >
                    {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </Button>
            </div>
        </>
    );
}


function useSocialInboxEvents() {
    const client = useQueryClient();
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        const refresh = () => {
            client.invalidateQueries({queryKey: ['social-conversations']});
            client.invalidateQueries({queryKey: ['social-messages']});
            client.invalidateQueries({queryKey: ['social-agent-thread']});
        };
        const connect = async () => {
            try {
                const token = getAuthCookie()?.tokens?.access_token;
                if (!token) throw new Error('Not signed in');
                const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
                const response = await fetch(`${base}/social/admin/inbox/events`, {
                    headers: {Authorization: `Bearer ${token}`, Accept: 'text/event-stream'},
                    cache: 'no-store', signal: controller.signal,
                });
                if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('Stream unavailable');
                setConnected(true);
                refresh();
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                while (!controller.signal.aborted) {
                    const {value, done} = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, {stream: true}).replace(/\r\n/g, '\n');
                    let boundary: number;
                    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                        const event = buffer.slice(0, boundary);
                        buffer = buffer.slice(boundary + 2);
                        if (event.split('\n').some(line => line.trim() === 'event: inbox.changed')) refresh();
                    }
                    if (buffer.length > 65536) throw new Error('Invalid stream');
                }
            } catch {
                // Polling continues while the connection is unavailable.
            } finally {
                if (!controller.signal.aborted) {
                    setConnected(false);
                    retryTimer = setTimeout(connect, 5000);
                }
            }
        };
        connect();
        return () => { controller.abort(); if (retryTimer) clearTimeout(retryTimer); };
    }, [client]);
    return connected;
}

export default function SocialInboxPage() {
    const liveConnected = useSocialInboxEvents();
    const [platform, setPlatform] = useState('');
    const [selectedId, setSelectedId] = useState<string>('');
    const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

    const {
        data: conversations,
        isLoading: conversationsLoading,
        isError: conversationsError,
        error: conversationsErrorObj,
        refetch: refetchConversations,
    } = useQuery({
        queryKey: ['social-conversations', platform],
        queryFn: () => fetchConversations(platform),
        retry: false,
        refetchInterval: liveConnected ? 60000 : 30000,
    });

    const selectedConversation =
        conversations?.find((c) => conversationId(c) === selectedId) || null;

    const selectClass =
        'p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-sm text-gray-900 dark:text-white';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inbox</h1>
                    <TestModeBadge />
                </div>
                <div className="flex gap-2 items-center">
                    <select
                        value={platform}
                        onChange={(e) => { setPlatform(e.target.value); setSelectedId(''); setMobileThreadOpen(false); }}
                        className={selectClass}
                    >
                        {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <Link href="/dashboard/marketing/social">
                        <Button variant="outline" size="sm" className="gap-2 rounded-full">
                            <ArrowLeft size={15} /> Posts
                        </Button>
                    </Link>
                </div>
            </div>

            {conversationsError ? (
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">
                        {apiMessage(conversationsErrorObj, 'Error loading conversations')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">
                    {/* Conversations list */}
                    <div className={`${mobileThreadOpen ? 'hidden' : 'flex'} lg:flex bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 flex-col lg:max-h-[calc(100vh-170px)]`}>
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                                Conversations {conversations ? `(${conversations.length})` : ''}
                            </span>
                            <RefreshButton
                                onRefresh={() => refetchConversations()}
                                queryKey={['social-conversations', platform]}
                                label=""
                                className="h-7 w-7 p-0 rounded-full border-none"
                                successMessage="Conversations refreshed"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-0.5">
                            {conversationsLoading ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="animate-spin text-gray-400" size={24} />
                                </div>
                            ) : !conversations || conversations.length === 0 ? (
                                <div className="py-12 text-center px-4">
                                    <MessageSquare className="mx-auto text-gray-300 dark:text-gray-700 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">No conversations yet.</p>
                                </div>
                            ) : (
                                conversations.map((conversation) => {
                                    const id = conversationId(conversation);
                                    return (
                                        <ConversationItem
                                            key={id}
                                            conversation={conversation}
                                            active={id === selectedId}
                                            onSelect={() => { setSelectedId(id); setMobileThreadOpen(true); }}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Message thread */}
                    <div className={`${mobileThreadOpen ? 'flex' : 'hidden'} lg:flex bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl flex-col h-[calc(100vh-170px)]`}>
                        {selectedConversation ? (
                            <MessageThread
                                key={conversationId(selectedConversation)}
                                conversation={selectedConversation}
                                onBack={() => setMobileThreadOpen(false)}
                                liveConnected={liveConnected}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-2">
                                <MessageSquare className="text-gray-300 dark:text-gray-700" size={36} />
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Your messages</p>
                                <p className="text-xs text-gray-500">Select a conversation to read and reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
