'use client';

import React from 'react';
import { Package, PenSquare, Tag } from 'lucide-react';
import { formatNumber } from '@/lib/format-time';

/* Shared types, constants and helpers for the social dashboard surfaces. */

export interface SocialAccount {
    _id?: string;
    id?: string;
    platform: string;
    name?: string;
    username?: string;
    displayName?: string;
    profileId?: string | { _id?: string; id?: string };
    profile_id?: string;
    [key: string]: unknown;
}

export interface SocialPostMediaItem {
    type: 'image' | 'video';
    url: string;
    title?: string;
}

export interface SocialPost {
    id: string;
    source: 'manual' | 'product' | 'promotion';
    object_id: string | null;
    caption: string;
    image_url: string;
    media_items?: SocialPostMediaItem[];
    platforms: { platform: string; accountId: string }[];
    status: 'pending_approval' | 'sent' | 'rejected' | 'failed' | 'skipped';
    zernio_post_id: string;
    scheduled_for: string | null;
    created_by: string | null;
    reviewed_by: string | null;
    created_at: string;
    sent_at: string | null;
}

export interface SocialComment {
    id?: string;
    _id?: string;
    parentId?: string;
    depth?: number;
    liked?: boolean;
    isLiked?: boolean;
    hidden?: boolean;
    isHidden?: boolean;
    isReply?: boolean;
    from?: unknown;
    [key: string]: unknown;
}

export interface PostAnalytics {
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate?: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    views?: number;
    saves?: number;
    follows?: number;
    syncStatus?: string;
    message?: string;
    lastUpdated?: string;
}

export const accountId = (account: SocialAccount) => account._id || account.id || '';
export const accountProfileId = (account: SocialAccount) => {
    const profile = account.profileId ?? account.profile_id;
    if (!profile) return '';
    if (typeof profile === 'string') return profile;
    if (typeof profile === 'object') return String(profile._id ?? profile.id ?? '');
    return '';
};
export const accountLabel = (account: SocialAccount) =>
    account.displayName || account.name || account.username || account.platform;

export const STATUS_STYLES: Record<string, string> = {
    pending_approval: 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400',
    sent: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
    rejected: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
    failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    skipped: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
};

export const STATUS_DOTS: Record<string, string> = {
    pending_approval: 'bg-gray-400',
    sent: 'bg-gray-900 dark:bg-white',
    rejected: 'bg-zinc-400',
    failed: 'bg-rose-500',
    skipped: 'bg-zinc-400',
};

export const STATUS_LABELS: Record<string, string> = {
    pending_approval: 'Pending approval',
    sent: 'Published',
    rejected: 'Rejected',
    failed: 'Failed',
    skipped: 'Skipped',
};

export const SOURCE_ICONS: Record<string, React.ReactNode> = {
    manual: <PenSquare size={12} />,
    product: <Package size={12} />,
    promotion: <Tag size={12} />,
};

export function PostStatusBadge({ status }: { status: SocialPost['status'] }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
        </span>
    );
}

export const commentText = (c: SocialComment) => {
    const content = c.content;
    if (content && typeof content === 'object') {
        const source = content as Record<string, unknown>;
        const text = source.text ?? source.message ?? source.body;
        if (text) return String(text);
    }
    return String(c.text ?? c.message ?? c.comment ?? '');
};
export const commentAuthor = (c: SocialComment) => {
    const from = c.from;
    if (from && typeof from === 'object') {
        const source = from as Record<string, unknown>;
        return String(source.name ?? source.username ?? source.displayName ?? 'User');
    }
    return String(c.author ?? c.username ?? from ?? c.user ?? 'User');
};
export const commentIdOf = (c: SocialComment, i: number) =>
    String(c.id ?? c._id ?? c.commentId ?? i);
export const commentCid = (c: SocialComment) =>
    String(c.cid ?? c.commentCid ?? '');
export const commentLikeUri = (c: SocialComment) =>
    String(c.likeUri ?? c.like_uri ?? '');
export const isCommentHidden = (c: SocialComment) =>
    Boolean(c.hidden ?? c.isHidden ?? false);
export const isCommentLiked = (c: SocialComment) =>
    Boolean(c.liked ?? c.isLiked ?? false);
export const commentDepth = (c: SocialComment) => {
    const depth = Number(c.depth ?? (c.isReply ? 1 : 0));
    return Number.isFinite(depth) && depth > 0 ? Math.min(depth, 3) : 0;
};


export function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-gray-400">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatNumber(value)}</p>
        </div>
    );
}


const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];

/** Whether a media URL points at a video (by extension). */
export const isVideoUrl = (url: string) =>
    VIDEO_EXTENSIONS.some((ext) => url.split('?')[0].toLowerCase().endsWith(ext));
