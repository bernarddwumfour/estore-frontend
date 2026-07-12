'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, ChevronUp, Film, ImageIcon, Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { accountId, accountLabel, isVideoUrl, type SocialAccount } from './social-shared';
import { MediaPicker, type PickedMedia } from './MediaPicker';

const MAX_MEDIA_ITEMS = 10;

export interface ComposerValues {
    caption: string;
    image_url: string;
    media_items: PickedMedia[];
    scheduled_for: string;
    account_ids: string[];
}

export const emptyComposer: ComposerValues = {
    caption: '', image_url: '', media_items: [], scheduled_for: '', account_ids: [],
};

const normalizeMediaItems = (mediaItems: PickedMedia[] = [], imageUrl = ''): PickedMedia[] => {
    const seen = new Set<string>();
    const items: PickedMedia[] = [];

    mediaItems.forEach((item) => {
        const url = item.url.trim();
        if (!url || seen.has(url)) return;
        seen.add(url);
        items.push({
            type: item.type || (isVideoUrl(url) ? 'video' : 'image'),
            url,
            ...(item.title?.trim() ? { title: item.title.trim() } : {}),
        });
    });

    const legacyUrl = imageUrl.trim();
    if (legacyUrl && !seen.has(legacyUrl)) {
        items.push({ type: isVideoUrl(legacyUrl) ? 'video' : 'image', url: legacyUrl });
    }

    return items.slice(0, MAX_MEDIA_ITEMS);
};

export function composerPayload(values: ComposerValues) {
    const mediaItems = normalizeMediaItems(values.media_items, values.image_url);
    const imageUrl = mediaItems[0]?.url || values.image_url.trim();

    return {
        caption: values.caption.trim(),
        media_items: mediaItems.map((item) => ({
            type: item.type,
            url: item.url,
            ...(item.title ? { title: item.title } : {}),
        })),
        ...(imageUrl ? { image_url: imageUrl } : {}),
        ...(values.scheduled_for ? { scheduled_for: new Date(values.scheduled_for).toISOString() } : {}),
        ...(values.account_ids.length ? { account_ids: values.account_ids } : {}),
    };
}

interface SocialComposerProps {
    accounts: SocialAccount[];
    initial: ComposerValues;
    submitLabel: string;
    onSubmit: (values: ComposerValues) => void;
    isSubmitting: boolean;
}

/** Post creation/edit form used in the New Post and Review & Publish dialogs. */
export function SocialComposer({ accounts, initial, submitLabel, onSubmit, isSubmitting }: SocialComposerProps) {
    const [form, setForm] = useState<ComposerValues>(() => {
        const mediaItems = normalizeMediaItems(initial.media_items, initial.image_url);
        return {
            ...initial,
            image_url: mediaItems[0]?.url || initial.image_url,
            media_items: mediaItems,
        };
    });
    const [showOptions, setShowOptions] = useState(!!initial.image_url || initial.media_items.length > 0);
    const [pickerOpen, setPickerOpen] = useState(false);
    const selectedMedia = normalizeMediaItems(form.media_items, form.image_url);

    const toggleAccount = (id: string) => {
        setForm((c) => ({
            ...c,
            account_ids: c.account_ids.includes(id)
                ? c.account_ids.filter((a) => a !== id)
                : [...c.account_ids, id],
        }));
    };

    const handleSubmit = () => {
        if (!form.caption.trim()) {
            toast.error('Write something first');
            return;
        }
        onSubmit(form);
    };

    const setMediaItems = (items: PickedMedia[]) => {
        const mediaItems = normalizeMediaItems(items);
        setForm((c) => ({
            ...c,
            image_url: mediaItems[0]?.url || '',
            media_items: mediaItems,
        }));
    };

    const addMediaItems = (media: PickedMedia[]) => {
        const current = selectedMedia;
        const seen = new Set(current.map((item) => item.url));
        const next = [...current];
        let skippedForLimit = false;

        media.forEach((item) => {
            const [cleanItem] = normalizeMediaItems([item]);
            if (!cleanItem || seen.has(cleanItem.url)) return;
            if (next.length >= MAX_MEDIA_ITEMS) {
                skippedForLimit = true;
                return;
            }
            seen.add(cleanItem.url);
            next.push(cleanItem);
        });

        if (skippedForLimit) {
            toast.error(`You can attach up to ${MAX_MEDIA_ITEMS} media items`);
        }

        setForm((c) => {
            return {
                ...c,
                image_url: next[0]?.url || '',
                media_items: next,
            };
        });
    };

    const removeMediaItem = (url: string) => {
        setMediaItems(selectedMedia.filter((item) => item.url !== url));
    };

    return (
        <div className="space-y-3">
            <textarea
                value={form.caption}
                onChange={(e) => setForm((c) => ({ ...c, caption: e.target.value }))}
                placeholder="What do you want to share?"
                rows={5}
                autoFocus
                className="w-full p-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-gray-400/40"
            />

            {selectedMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {selectedMedia.map((item, index) => {
                        const isVideo = item.type === 'video' || isVideoUrl(item.url);
                        return (
                            <div
                                key={item.url}
                                className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950"
                            >
                                {isVideo ? (
                                    <video src={item.url} controls className="w-full h-full object-cover" />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.url} alt={item.title || 'Post media'} className="w-full h-full object-cover" />
                                )}
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold flex items-center gap-1">
                                    {isVideo ? <Film size={9} /> : <ImageIcon size={9} />}
                                    {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeMediaItem(item.url)}
                                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                                    title="Remove media"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ImageIcon size={15} className="shrink-0" />
                        {selectedMedia.length > 0
                            ? `${selectedMedia.length}/${MAX_MEDIA_ITEMS} media selected`
                            : 'Add image / video'}
                    </button>
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-lg px-3">
                        <Calendar size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="datetime-local"
                            value={form.scheduled_for}
                            onChange={(e) => setForm((c) => ({ ...c, scheduled_for: e.target.value }))}
                            className="flex-1 p-2 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            )}

            {accounts.length === 0 ? (
                <p className="text-xs text-gray-500">
                    No connected accounts.{' '}
                    <Link href="/dashboard/settings/social" className="underline text-gray-900 dark:text-white">
                        Manage accounts in Settings
                    </Link>
                </p>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {accounts.map((account) => {
                        const id = accountId(account);
                        const active = form.account_ids.includes(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => toggleAccount(id)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors capitalize ${active
                                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                                    : 'bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                {account.platform} · {accountLabel(account)}
                            </button>
                        );
                    })}
                    <span className="text-[11px] text-gray-400 self-center">
                        {form.account_ids.length === 0 ? 'posting to all accounts' : `${form.account_ids.length} selected`}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={() => setShowOptions((s) => !s)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                    {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showOptions ? 'Hide options' : 'Add media / schedule'}
                </button>
                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="gap-2 rounded-full px-5">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {form.scheduled_for ? 'Schedule' : submitLabel}
                </Button>
            </div>

            <MediaPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                selectedUrls={selectedMedia.map((item) => item.url)}
                onSelect={addMediaItems}
            />
        </div>
    );
}
