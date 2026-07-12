// app/dashboard/marketing/social/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, BarChart3, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, EyeOff, Filter,
    Globe, Heart, Inbox, Loader2, MessageCircle, MousePointerClick, Plus, Search, Send, Share,
    ThumbsUp, Trash2, Users, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import { formatNumber, timeAgo } from '@/lib/format-time';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';
import { UserAvatar } from '@/widgets/user-avatar/UserAvatar';
import {
    SocialComposer, composerPayload, emptyComposer, type ComposerValues,
} from '@/widgets/social/SocialComposer';
import { TestModeBadge } from '@/widgets/social/TestModeBadge';
import {
    PostStatusBadge, SOURCE_ICONS, STATUS_DOTS, StatTile, commentAuthor, commentCid, commentIdOf,
    commentDepth, commentLikeUri, commentText, isCommentHidden, isCommentLiked, isVideoUrl,
    type PostAnalytics, type SocialAccount, type SocialComment, type SocialPost, type SocialPostMediaItem,
} from '@/widgets/social/social-shared';

/* ---------------- Data fetching ---------------- */

interface PostFilters {
    status: string;
    date_from: string;
    date_to: string;
}

interface PaginationMeta {
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

const emptyFilters: PostFilters = { status: '', date_from: '', date_to: '' };

const fetchAccounts = async (): Promise<SocialAccount[]> => {
    const response = await securityAxios.get(endpoints.social.adminAccounts);
    return response.data?.data?.accounts || [];
};

const fetchPosts = async (params: { page: number; search: string; filters: PostFilters }): Promise<{
    posts: SocialPost[];
    total: number;
    pagination: PaginationMeta;
}> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', '15');
    if (params.search) queryParams.append('search', params.search);
    if (params.filters.status) queryParams.append('status', params.filters.status);
    if (params.filters.date_from) queryParams.append('date_from', params.filters.date_from);
    if (params.filters.date_to) queryParams.append('date_to', params.filters.date_to);
    const response = await securityAxios.get(`${endpoints.social.adminPosts}?${queryParams.toString()}`);
    return response.data.data;
};

const firstPostAccountId = (post: SocialPost) => post.platforms?.[0]?.accountId || '';

const postMediaItems = (post: SocialPost): SocialPostMediaItem[] => {
    const mediaItems = (post.media_items || []).filter((item) => item?.url);
    if (mediaItems.length > 0) return mediaItems;
    if (!post.image_url) return [];
    return [{
        type: isVideoUrl(post.image_url) ? 'video' : 'image',
        url: post.image_url,
    }];
};

const fetchComments = async (postId: string, accountId?: string): Promise<SocialComment[]> => {
    const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await securityAxios.get(`${endpoints.social.adminPostComments.replace(':id', postId)}${query}`);
    return response.data?.data?.comments || [];
};

const fetchAnalytics = async (postId: string): Promise<PostAnalytics> => {
    const response = await securityAxios.get(endpoints.social.adminPostAnalytics.replace(':id', postId));
    return response.data.data.analytics;
};

/* ---------------- Column 1: post list ---------------- */

function PostListItem({ post, active, onSelect }: {
    post: SocialPost;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left px-3 py-3 rounded-xl transition-colors space-y-1.5 ${active
                ? 'bg-gray-100 dark:bg-gray-900 ring-1 ring-gray-300 dark:ring-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
        >
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOTS[post.status]}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1 capitalize">
                    {SOURCE_ICONS[post.source]} {post.source}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(post.sent_at || post.created_at)}
                </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{post.caption}</p>
        </button>
    );
}

/* ---------------- Column 2: post detail + analytics ---------------- */

function PostDetail({
    post,
    accounts,
    onApprove,
    onReject,
    onDelete,
    onShowComments,
    onBack,
    isApproving,
    isRejecting,
    isDeleting,
}: {
    post: SocialPost;
    accounts: SocialAccount[];
    onApprove: (postId: string, values: ComposerValues) => void;
    onReject: (post: SocialPost) => void;
    onDelete: (post: SocialPost) => void;
    onShowComments: () => void;
    onBack: () => void;
    isApproving: boolean;
    isRejecting: boolean;
    isDeleting: boolean;
}) {
    const [reviewOpen, setReviewOpen] = useState(false);
    const isPending = post.status === 'pending_approval' || post.status === 'failed';
    const isPublished = post.status === 'sent' && !!post.zernio_post_id;
    const anyActionBusy = isApproving || isRejecting || isDeleting;

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['social-analytics', post.id],
        queryFn: () => fetchAnalytics(post.id),
        enabled: isPublished,
        retry: false,
    });

    const commentAccountId = firstPostAccountId(post);
    const { data: comments } = useQuery({
        queryKey: ['social-comments', post.id, commentAccountId],
        queryFn: () => fetchComments(post.id, commentAccountId),
        enabled: isPublished && !!commentAccountId,
    });
    const commentCount = Math.max(comments?.length ?? 0, analytics?.comments ?? 0);
    const mediaItems = postMediaItems(post);

    return (
        <div className="space-y-4">
            {/* Mobile back to list */}
            <button
                onClick={onBack}
                className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
                <ArrowLeft size={14} /> All posts
            </button>

            {/* Post header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={post.created_by || 'Store'}
                        icon={SOURCE_ICONS[post.source] || <Globe size={14} />}
                    />
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                            {post.source === 'manual' ? (post.created_by || 'Store') : `${post.source} post`}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <Clock size={11} /> {timeAgo(post.sent_at || post.created_at)}
                            {post.scheduled_for && post.status !== 'sent' && (
                                <span className="text-gray-500">· scheduled {new Date(post.scheduled_for).toLocaleString()}</span>
                            )}
                        </p>
                    </div>
                </div>
                <PostStatusBadge status={post.status} />
            </div>

            {/* Body */}
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{post.caption}</p>
            {mediaItems.length > 0 && (
                <div className={`grid gap-2 ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {mediaItems.map((item, index) => {
                        const isVideo = item.type === 'video' || isVideoUrl(item.url);
                        const mediaClass = mediaItems.length === 1
                            ? 'w-full max-h-80 object-cover'
                            : 'w-full h-full object-cover';
                        return (
                            <div
                                key={`${item.url}-${index}`}
                                className={`relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 ${mediaItems.length === 1 ? '' : 'aspect-square'}`}
                            >
                                {isVideo ? (
                                    <video
                                        src={item.url}
                                        controls
                                        className={mediaClass}
                                    />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.url}
                                        alt={item.title || 'Post media'}
                                        className={mediaClass}
                                    />
                                )}
                                {mediaItems.length > 1 && (
                                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {post.platforms?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {post.platforms.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-[10px] font-semibold text-gray-600 dark:text-gray-400 capitalize">
                            {p.platform}
                        </span>
                    ))}
                </div>
            )}

            {/* Engagement row — like the platforms themselves */}
            {isPublished && (
                <div className="flex items-center gap-5 border-y border-gray-100 dark:border-gray-900 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Heart size={16} className="text-rose-500 fill-rose-500" />
                        <span className="font-semibold">{formatNumber(analytics?.likes ?? 0)}</span>
                    </span>
                    <button
                        onClick={onShowComments}
                        className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <MessageCircle size={16} />
                        <span className="font-semibold">{formatNumber(commentCount)}</span>
                        <span className="text-xs">comments</span>
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Share size={16} />
                        <span className="font-semibold">{formatNumber(analytics?.shares ?? 0)}</span>
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
                {isPending && (
                    <>
                        <Button
                            size="sm"
                            className="gap-1.5 rounded-full"
                            disabled={anyActionBusy}
                            onClick={() => setReviewOpen(true)}
                        >
                            {isApproving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Review & Publish
                        </Button>
                        {post.status === 'pending_approval' && (
                            <Button
                                size="sm" variant="outline"
                                className="gap-1.5 rounded-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                                disabled={anyActionBusy}
                                onClick={() => onReject(post)}
                            >
                                {isRejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Reject
                            </Button>
                        )}
                    </>
                )}
                <Button
                    size="sm" variant="ghost"
                    className="gap-1.5 rounded-full text-gray-500 hover:text-rose-600 ml-auto"
                    disabled={anyActionBusy}
                    onClick={() => onDelete(post)}
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                </Button>
            </div>

            {/* Analytics */}
            {isPublished && (
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-900 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <BarChart3 size={14} />
                        <h3 className="text-xs font-black uppercase tracking-wider">Analytics</h3>
                    </div>
                    {analyticsLoading ? (
                        <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={18} /></div>
                    ) : analytics ? (
                        <>
                            {analytics.message && (
                                <p className="text-xs text-gray-500">{analytics.message}</p>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <StatTile icon={<Eye size={12} />} label="Impressions" value={analytics.impressions} />
                                <StatTile icon={<Users size={12} />} label="Reach" value={analytics.reach} />
                                <StatTile icon={<ThumbsUp size={12} />} label="Engagement" value={analytics.engagement} />
                                <StatTile icon={<Heart size={12} />} label="Likes" value={analytics.likes} />
                                <StatTile icon={<Share size={12} />} label="Shares" value={analytics.shares} />
                                <StatTile icon={<MousePointerClick size={12} />} label="Clicks" value={analytics.clicks} />
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-gray-500">Analytics not available for this post yet.</p>
                    )}
                </div>
            )}

            {/* Review dialog */}
            <CustomDialog
                title="Review & Publish"
                description={`Queued from ${post.source} — edit before publishing if needed`}
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                contentWidth="max-w-[620px]"
            >
                <SocialComposer
                    accounts={accounts}
                    initial={{
                        caption: post.caption,
                        image_url: post.image_url || '',
                        media_items: postMediaItems(post),
                        scheduled_for: '',
                        account_ids: [],
                    }}
                    submitLabel="Approve & Publish"
                    isSubmitting={isApproving}
                    onSubmit={(values) => {
                        onApprove(post.id, values);
                        setReviewOpen(false);
                    }}
                />
            </CustomDialog>
        </div>
    );
}

/* ---------------- Column 3: comments ---------------- */

function CommentsPanel({ post, onBack }: { post: SocialPost; onBack: () => void }) {
    const defaultAccountId = firstPostAccountId(post);
    const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId);
    const [replyTo, setReplyTo] = useState('');
    const [replyText, setReplyText] = useState('');
    const queryClient = useQueryClient();

    const isPublished = post.status === 'sent' && !!post.zernio_post_id;

    const { data: comments, isLoading, refetch } = useQuery({
        queryKey: ['social-comments', post.id, selectedAccountId],
        queryFn: () => fetchComments(post.id, selectedAccountId),
        enabled: isPublished && !!selectedAccountId,
    });

    const refresh = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['social-analytics', post.id] });
    };

    const replyMutation = useMutation({
        mutationFn: async ({ commentId, message }: { commentId: string; message: string }) => {
            const response = await securityAxios.post(
                endpoints.social.adminCommentReply.replace(':id', post.id),
                { comment_id: commentId, message, account_id: selectedAccountId }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success('Reply sent');
            setReplyTo('');
            setReplyText('');
            refresh();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to send reply')),
    });

    const actionMutation = useMutation({
        mutationFn: async ({ commentId, action, cid, likeUri }: {
            commentId: string;
            action: string;
            cid?: string;
            likeUri?: string;
        }) => {
            const response = await securityAxios.post(
                endpoints.social.adminCommentAction.replace(':id', post.id),
                {
                    comment_id: commentId,
                    action,
                    account_id: selectedAccountId,
                    ...(cid ? { cid } : {}),
                    ...(likeUri ? { like_uri: likeUri } : {}),
                }
            );
            return response.data;
        },
        onSuccess: (response) => { toast.success(response?.message || 'Done'); refresh(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Action failed')),
    });

    // which exact button is busy — so only it spins while all stay disabled
    const pendingAction = actionMutation.isPending ? actionMutation.variables : null;
    const anyBusy = actionMutation.isPending || replyMutation.isPending;

    const backButton = (
        <button
            onClick={onBack}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
            <ArrowLeft size={14} /> Back to post
        </button>
    );

    if (!isPublished) {
        return (
            <div className="space-y-3">
                {backButton}
                <div className="flex flex-col items-center justify-center text-center px-6 py-16 space-y-2">
                    <MessageCircle className="text-gray-300 dark:text-gray-700" size={32} />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No comments yet</p>
                    <p className="text-xs text-gray-500">Comments appear here once the post is published.</p>
                </div>
            </div>
        );
    }

    if (!selectedAccountId) {
        return (
            <div className="space-y-3">
                {backButton}
                <div className="flex flex-col items-center justify-center text-center px-6 py-16 space-y-2">
                    <MessageCircle className="text-gray-300 dark:text-gray-700" size={32} />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No post account found</p>
                    <p className="text-xs text-gray-500">Comments need the social account used to publish this post.</p>
                </div>
            </div>
        );
    }

    const actionButton = (
        commentId: string,
        action: string,
        label: string,
        icon: React.ReactNode,
        hoverClass: string,
        activeClass = '',
        options: { cid?: string; likeUri?: string } = {},
    ) => {
        const isThisPending = pendingAction?.commentId === commentId && pendingAction?.action === action;
        return (
            <button
                className={`text-[11px] font-semibold disabled:opacity-50 ${activeClass || `text-gray-500 ${hoverClass}`}`}
                disabled={anyBusy}
                onClick={() => actionMutation.mutate({ commentId, action, ...options })}
            >
                {isThisPending
                    ? <Loader2 size={11} className="inline mr-1 animate-spin" />
                    : <span className="inline mr-1">{icon}</span>}
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-3">
            {backButton}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <MessageCircle size={14} /> Comments {comments ? `(${comments.length})` : ''}
                </h3>
                <RefreshButton
                    onRefresh={() => refetch()}
                    queryKey={['social-comments', post.id, selectedAccountId]}
                    label=""
                    className="h-7 w-7 p-0 rounded-full border-none"
                    successMessage="Comments refreshed"
                />
            </div>
            {post.platforms.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                    {post.platforms.map((platform) => (
                        <button
                            key={platform.accountId}
                            type="button"
                            onClick={() => setSelectedAccountId(platform.accountId)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${selectedAccountId === platform.accountId
                                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                                : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {platform.platform}
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={18} /></div>
            ) : !comments || comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No comments on this post yet.</p>
            ) : (
                comments.map((comment, index) => {
                    const cid = commentIdOf(comment, index);
                    const hidden = isCommentHidden(comment);
                    const liked = isCommentLiked(comment);
                    const depth = commentDepth(comment);
                    return (
                        <div
                            key={cid}
                            className={`flex gap-2.5 ${hidden ? 'opacity-60' : ''} ${depth ? 'ml-6 pl-3 border-l border-gray-200 dark:border-gray-800' : ''}`}
                        >
                            <UserAvatar
                                name={commentAuthor(comment)}
                                size="sm"
                                variant={depth ? 'brand' : 'neutral'}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{commentAuthor(comment)}</p>
                                        {hidden && (
                                            <span className="px-1.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-500 text-[9px] font-black uppercase tracking-wider">
                                                Hidden from customers
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{commentText(comment)}</p>
                                </div>
                                <div className="flex flex-wrap gap-3 px-3 pt-1">
                                    {actionButton(
                                        cid,
                                        liked ? 'unlike' : 'like',
                                        liked ? 'Liked' : 'Like',
                                        <ThumbsUp size={11} className="inline" />,
                                        'hover:text-gray-900 dark:hover:text-white',
                                        liked ? 'font-bold text-gray-900 dark:text-white' : '',
                                        liked ? { likeUri: commentLikeUri(comment) } : { cid: commentCid(comment) },
                                    )}
                                    <button
                                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                                        disabled={anyBusy}
                                        onClick={() => setReplyTo(replyTo === cid ? '' : cid)}
                                    >
                                        <MessageCircle size={11} className="inline mr-1" />Reply
                                    </button>
                                    {hidden
                                        ? actionButton(cid, 'unhide', 'Unhide', <Eye size={11} className="inline" />, 'hover:text-gray-900 dark:hover:text-white', 'text-gray-500 underline')
                                        : actionButton(cid, 'hide', 'Hide', <EyeOff size={11} className="inline" />, 'hover:text-gray-900 dark:hover:text-white')}
                                    {actionButton(cid, 'delete', 'Delete', <Trash2 size={11} className="inline" />, 'hover:text-rose-600')}
                                </div>
                                {replyTo === cid && (
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && replyText.trim() && !replyMutation.isPending) {
                                                    replyMutation.mutate({ commentId: cid, message: replyText.trim() });
                                                }
                                            }}
                                            placeholder="Write a reply..."
                                            autoFocus
                                            disabled={replyMutation.isPending}
                                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-60"
                                        />
                                        <Button
                                            size="sm" className="rounded-full"
                                            disabled={!replyText.trim() || anyBusy}
                                            onClick={() => replyMutation.mutate({ commentId: cid, message: replyText.trim() })}
                                        >
                                            {replyMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

/* ---------------- Page ---------------- */

type MobilePane = 'list' | 'detail' | 'comments';

export default function SocialManagerPage() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState<PostFilters>(emptyFilters);
    const [draftFilters, setDraftFilters] = useState<PostFilters>(emptyFilters);
    const [filterOpen, setFilterOpen] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [mobilePane, setMobilePane] = useState<MobilePane>('list');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => { } });

    const { data: accounts } = useQuery({
        queryKey: ['social-accounts'],
        queryFn: fetchAccounts,
        retry: false,
    });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['social-posts', page, search, filters],
        queryFn: () => fetchPosts({ page, search, filters }),
    });

    const posts = React.useMemo(() => data?.posts || [], [data]);
    const pagination = data?.pagination;
    const selectedPost = posts.find((p) => p.id === selectedId) || posts[0] || null;

    // debounce search box
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const invalidate = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    };

    const createMutation = useMutation({
        mutationFn: async (values: ComposerValues) => {
            const response = await securityAxios.post(endpoints.social.adminPostCreate, composerPayload(values));
            return response.data;
        },
        onSuccess: (response) => {
            toast.success(response?.message || 'Post published');
            setComposerOpen(false);
            if (response?.data?.id) {
                setSelectedId(response.data.id);
                setMobilePane('detail');
            }
            invalidate();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to publish post')),
    });

    const approveMutation = useMutation({
        mutationFn: async ({ postId, values }: { postId: string; values: ComposerValues }) => {
            const response = await securityAxios.post(
                endpoints.social.adminPostApprove.replace(':id', postId),
                composerPayload(values)
            );
            return response.data;
        },
        onSuccess: (response) => { toast.success(response?.message || 'Post approved and published'); invalidate(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to approve post')),
    });

    const rejectMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await securityAxios.post(endpoints.social.adminPostReject.replace(':id', postId));
            return response.data;
        },
        onSuccess: () => { toast.success('Post rejected'); invalidate(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to reject post')),
    });

    const deleteMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await securityAxios.delete(endpoints.social.adminPostDelete.replace(':id', postId));
            return response.data;
        },
        onSuccess: () => {
            toast.success('Post deleted');
            setMobilePane('list');
            invalidate();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to delete post')),
    });

    const handleReject = (post: SocialPost) => setConfirmDialog({
        open: true,
        title: 'Reject Post',
        message: 'Reject this queued post? It will never be published.',
        onConfirm: () => {
            rejectMutation.mutate(post.id);
            setConfirmDialog((c) => ({ ...c, open: false }));
        },
    });

    const handleDelete = (post: SocialPost) => setConfirmDialog({
        open: true,
        title: 'Delete Post',
        message: post.scheduled_for && post.status === 'sent'
            ? 'Delete this post? Its scheduled publication will be cancelled on Zernio.'
            : post.zernio_post_id
                ? 'Remove this post from your store records? Already-published posts stay live on the platform — delete them there (e.g. on Facebook) if needed.'
                : 'Delete this post record?',
        onConfirm: () => {
            deleteMutation.mutate(post.id);
            setConfirmDialog((c) => ({ ...c, open: false }));
        },
    });

    const activeFilterCount = [filters.status, filters.date_from, filters.date_to].filter(Boolean).length;

    const inputClass =
        'w-full p-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/40';

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Social</h1>
                    <TestModeBadge />
                </div>
                <Link href="/dashboard/marketing/social/inbox">
                    <Button variant="outline" size="sm" className="gap-2 rounded-full">
                        <Inbox size={15} /> Inbox
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)_1fr] gap-4 items-start">
                {/* ---- Column 1: post list ---- */}
                <div className={`${mobilePane === 'list' ? 'flex' : 'hidden'} lg:flex bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 space-y-3 lg:max-h-[calc(100vh-170px)] flex-col`}>
                    <Button onClick={() => setComposerOpen(true)} className="w-full gap-2 rounded-xl">
                        <Plus size={16} /> New Post
                    </Button>

                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 flex-1 border border-gray-200 dark:border-gray-800 rounded-lg px-2.5">
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search posts..."
                                className="flex-1 py-2 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white min-w-0"
                            />
                        </div>
                        <button
                            onClick={() => { setDraftFilters(filters); setFilterOpen(true); }}
                            className="relative p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-500 transition-colors"
                            title="Filters"
                        >
                            <Filter size={15} />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
                        {isError ? (
                            <p className="text-xs text-red-600 dark:text-red-400 text-center py-8">
                                {apiMessage(error, 'Error loading posts')}
                            </p>
                        ) : isLoading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={20} /></div>
                        ) : posts.length === 0 ? (
                            <div className="py-12 text-center space-y-1 px-4">
                                <Globe className="mx-auto text-gray-300 dark:text-gray-700" size={28} />
                                <p className="text-xs text-gray-500">No posts match. Try adjusting search or filters.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostListItem
                                    key={post.id}
                                    post={post}
                                    active={selectedPost?.id === post.id}
                                    onSelect={() => { setSelectedId(post.id); setMobilePane('detail'); }}
                                />
                            ))
                        )}
                    </div>

                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-900 pt-2">
                            <Button
                                variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0"
                                disabled={!pagination.has_previous}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft size={15} />
                            </Button>
                            <span className="text-[11px] text-gray-500">
                                {pagination.current_page} / {pagination.total_pages}
                            </span>
                            <Button
                                variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0"
                                disabled={!pagination.has_next}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                <ChevronRight size={15} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* ---- Column 2: selected post ---- */}
                <div className={`${mobilePane === 'detail' ? 'block' : 'hidden'} lg:block bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 lg:max-h-[calc(100vh-170px)] lg:overflow-y-auto`}>
                    {selectedPost ? (
                        <PostDetail
                            post={selectedPost}
                            accounts={accounts || []}
                            onApprove={(postId, values) => approveMutation.mutate({ postId, values })}
                            onReject={handleReject}
                            onDelete={handleDelete}
                            onShowComments={() => setMobilePane('comments')}
                            onBack={() => setMobilePane('list')}
                            isApproving={approveMutation.isPending}
                            isRejecting={rejectMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                        />
                    ) : (
                        <div className="py-24 text-center space-y-2">
                            <Globe className="mx-auto text-gray-300 dark:text-gray-700" size={36} />
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No post selected</p>
                            <p className="text-xs text-gray-500">Create your first post or publish a product to fill the queue.</p>
                        </div>
                    )}
                </div>

                {/* ---- Column 3: comments ---- */}
                <div className={`${mobilePane === 'comments' ? 'block' : 'hidden'} lg:block bg-white dark:bg-[#111114] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 lg:max-h-[calc(100vh-170px)] lg:overflow-y-auto`}>
                    {selectedPost ? (
                        <CommentsPanel
                            key={selectedPost.id}
                            post={selectedPost}
                            onBack={() => setMobilePane('detail')}
                        />
                    ) : (
                        <div className="py-24 text-center">
                            <MessageCircle className="mx-auto text-gray-300 dark:text-gray-700" size={32} />
                        </div>
                    )}
                </div>
            </div>

            {/* New post dialog */}
            <CustomDialog
                title="New Social Post"
                description="Publish to your connected social accounts"
                open={composerOpen}
                onOpenChange={setComposerOpen}
                contentWidth="max-w-[620px]"
            >
                <SocialComposer
                    accounts={accounts || []}
                    initial={emptyComposer}
                    submitLabel="Publish"
                    isSubmitting={createMutation.isPending}
                    onSubmit={(values) => createMutation.mutate(values)}
                />
            </CustomDialog>

            {/* Filter dialog */}
            <CustomDialog
                title="Filter Posts"
                description="Narrow the post list by status and date"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                contentWidth="max-w-[440px]"
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            value={draftFilters.status}
                            onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                            className={inputClass}
                        >
                            <option value="">All statuses</option>
                            <option value="pending_approval">Pending approval</option>
                            <option value="sent">Published</option>
                            <option value="failed">Failed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                            <input
                                type="date"
                                value={draftFilters.date_from}
                                onChange={(e) => setDraftFilters((f) => ({ ...f, date_from: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                            <input
                                type="date"
                                value={draftFilters.date_to}
                                onChange={(e) => setDraftFilters((f) => ({ ...f, date_to: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                                setDraftFilters(emptyFilters);
                                setFilters(emptyFilters);
                                setPage(1);
                                setFilterOpen(false);
                            }}
                        >
                            Clear all
                        </Button>
                        <Button
                            size="sm" className="rounded-full px-5"
                            onClick={() => {
                                setFilters(draftFilters);
                                setPage(1);
                                setFilterOpen(false);
                            }}
                        >
                            Apply filters
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            <InfoDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                infoMessage={confirmDialog.message}
                variant="error"
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                primaryAction={confirmDialog.onConfirm}
                secondaryAction={() => setConfirmDialog({ ...confirmDialog, open: false })}
            />
        </div>
    );
}
