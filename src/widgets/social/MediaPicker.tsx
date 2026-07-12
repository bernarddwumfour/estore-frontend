'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Film, ImageIcon, Loader2, Play, Trash2, Upload, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import { timeAgo } from '@/lib/format-time';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import RefreshButton from '@/widgets/refresh-button/RefreshButton';

export interface PickedMedia {
    url: string;
    type: 'image' | 'video';
    title?: string;
}

interface MediaItem {
    id: string;
    url: string;
    media_type: 'image' | 'video';
    name: string;
    created_at: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;
const MAX_PICKED_MEDIA = 10;

const fileKind = (name: string): 'image' | 'video' | null => {
    const lower = name.toLowerCase();
    if (IMAGE_EXTENSIONS.some((e) => lower.endsWith(e))) return 'image';
    if (VIDEO_EXTENSIONS.some((e) => lower.endsWith(e))) return 'video';
    return null;
};

const fetchLibrary = async (mediaType: string): Promise<MediaItem[]> => {
    const suffix = mediaType ? `?media_type=${mediaType}` : '';
    const response = await securityAxios.get(`${endpoints.social.adminMedia}${suffix}`);
    return response.data?.data?.media || [];
};

/* ---------------- Upload tab ---------------- */

interface QueuedUpload {
    id: string;
    file: File;
    type: 'image' | 'video';
    previewUrl: string;
}

function UploadTab({ remainingSlots, onSelect }: {
    remainingSlots: number;
    onSelect: (media: PickedMedia[]) => void;
}) {
    const [files, setFiles] = useState<QueuedUpload[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const previewUrlsRef = useRef<string[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => () => {
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    const uploadItem = (candidate: File): QueuedUpload | null => {
        const kind = fileKind(candidate.name);
        if (!kind) {
            toast.error(`Unsupported file type. Allowed: ${[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join(', ')}`);
            return null;
        }
        const maxMb = kind === 'image' ? MAX_IMAGE_MB : MAX_VIDEO_MB;
        if (candidate.size > maxMb * 1024 * 1024) {
            toast.error(`File too large. Max ${maxMb}MB for ${kind}s.`);
            return null;
        }
        const previewUrl = URL.createObjectURL(candidate);
        previewUrlsRef.current.push(previewUrl);
        return {
            id: `${candidate.name}-${candidate.size}-${candidate.lastModified}-${Math.random()}`,
            file: candidate,
            type: kind,
            previewUrl,
        };
    };

    const pickFiles = (candidates: File[]) => {
        if (remainingSlots <= 0) {
            toast.error(`You can attach up to ${MAX_PICKED_MEDIA} media items`);
            return;
        }
        const validItems = candidates
            .map(uploadItem)
            .filter((item): item is QueuedUpload => !!item);

        setFiles((current) => {
            const openSlots = Math.max(0, remainingSlots - current.length);
            const accepted = validItems.slice(0, openSlots);
            const skipped = validItems.length - accepted.length;
            if (skipped > 0) {
                const rejectedItems = validItems.slice(openSlots);
                rejectedItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                previewUrlsRef.current = previewUrlsRef.current.filter(
                    (url) => !rejectedItems.some((item) => item.previewUrl === url)
                );
                toast.error(`Only ${openSlots} more media item${openSlots === 1 ? '' : 's'} can be attached`);
            }
            return [...current, ...accepted];
        });
    };

    const removeFile = (id: string) => {
        setFiles((current) => {
            const removed = current.find((item) => item.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
                previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== removed.previewUrl);
            }
            return current.filter((item) => item.id !== id);
        });
    };

    const clearFiles = () => {
        files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        previewUrlsRef.current = previewUrlsRef.current.filter(
            (url) => !files.some((item) => item.previewUrl === url)
        );
        setFiles([]);
    };

    const uploadMutation = useMutation({
        mutationFn: async (uploads: QueuedUpload[]) => {
            const form = new FormData();
            uploads.forEach((upload) => form.append('files', upload.file));
            const response = await securityAxios.post(endpoints.social.adminMediaUpload, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: (response) => {
            const responseData = response?.data;
            const uploaded = Array.isArray(responseData?.media)
                ? responseData.media
                : responseData?.url
                    ? [responseData]
                    : [];
            const mediaItems = uploaded
                .filter((media: MediaItem) => media?.url)
                .map((media: MediaItem) => ({
                    url: media.url,
                    type: media.media_type,
                    title: media.name,
                }));
            toast.success(`${mediaItems.length || files.length} media file${(mediaItems.length || files.length) === 1 ? '' : 's'} uploaded`);
            queryClient.invalidateQueries({ queryKey: ['social-media'] });
            if (mediaItems.length > 0) {
                onSelect(mediaItems);
            }
            clearFiles();
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Upload failed')),
    });

    const isUploading = uploadMutation.isPending;

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join(',')}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.length) pickFiles(Array.from(e.target.files));
                    e.target.value = '';
                }}
            />

            {files.length === 0 ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files?.length) pickFiles(Array.from(e.dataTransfer.files));
                    }}
                    className={`w-full rounded-xl border-2 border-dashed py-12 flex flex-col items-center gap-2 transition-colors ${dragOver
                        ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-900'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <UploadCloud size={32} className="text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Click to choose files or drag them here
                    </p>
                    <p className="text-xs text-gray-500">
                        {remainingSlots} slot{remainingSlots === 1 ? '' : 's'} left · Images up to {MAX_IMAGE_MB}MB · Videos up to {MAX_VIDEO_MB}MB
                    </p>
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                        {files.map((item, index) => (
                            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                                {item.type === 'video' ? (
                                    <video src={item.previewUrl} controls className="w-full h-full object-cover" />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                                )}
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                                    {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(item.id)}
                                    disabled={isUploading}
                                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
                                    title="Remove media"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500 truncate">
                            {files.length} selected · {Math.max(0, remainingSlots - files.length)} slot{Math.max(0, remainingSlots - files.length) === 1 ? '' : 's'} left
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant="ghost" size="sm"
                                disabled={isUploading}
                                onClick={() => inputRef.current?.click()}
                            >
                                Add more
                            </Button>
                            <Button
                                variant="ghost" size="sm"
                                disabled={isUploading}
                                onClick={clearFiles}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm" className="gap-2 rounded-full px-5"
                                disabled={isUploading || files.length === 0}
                                onClick={() => uploadMutation.mutate(files)}
                            >
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                Upload {files.length} & use
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------------- Library tab ---------------- */

function LibraryTab({ selectedUrls, remainingSlots, onSelect }: {
    selectedUrls: string[];
    remainingSlots: number;
    onSelect: (media: PickedMedia[]) => void;
}) {
    const [typeFilter, setTypeFilter] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
    const [selected, setSelected] = useState<Record<string, PickedMedia>>({});

    const { data: items, isLoading, refetch } = useQuery({
        queryKey: ['social-media', typeFilter],
        queryFn: () => fetchLibrary(typeFilter),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await securityAxios.delete(
                endpoints.social.adminMediaDelete.replace(':id', id)
            );
            return response.data;
        },
        onSuccess: () => { toast.success('Media deleted'); refetch(); },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Failed to delete media')),
    });

    const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;
    const selectedItems = Object.values(selected);

    const toggleSelected = (item: MediaItem) => {
        if (selectedUrls.includes(item.url)) return;
        setSelected((current) => {
            const next = { ...current };
            if (next[item.id]) {
                delete next[item.id];
            } else {
                if (Object.keys(next).length >= remainingSlots) {
                    toast.error(`You can attach up to ${MAX_PICKED_MEDIA} media items`);
                    return current;
                }
                next[item.id] = {
                    url: item.url,
                    type: item.media_type,
                    title: item.name,
                };
            }
            return next;
        });
    };

    const filterButton = (value: string, label: string) => (
        <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${typeFilter === value
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                    {filterButton('', 'All')}
                    {filterButton('image', 'Images')}
                    {filterButton('video', 'Videos')}
                </div>
                <RefreshButton
                    onRefresh={() => refetch()}
                    queryKey={['social-media', typeFilter]}
                    label=""
                    className="h-7 w-7 p-0 rounded-full border-none"
                    successMessage="Library refreshed"
                />
            </div>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={22} /></div>
            ) : !items || items.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                    <ImageIcon className="mx-auto text-gray-300 dark:text-gray-700" size={30} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Library is empty</p>
                    <p className="text-xs text-gray-500">Upload your first image or video from the Upload tab.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-1">
                    {items.map((item) => {
                        const alreadySelected = selectedUrls.includes(item.url);
                        const active = !!selected[item.id] || alreadySelected;
                        return (
                            <div key={item.id} className={`relative group ${alreadySelected ? 'opacity-70' : ''}`}>
                                <button
                                    type="button"
                                    onClick={() => toggleSelected(item)}
                                    className={`w-full aspect-square rounded-xl overflow-hidden border transition-shadow bg-gray-50 dark:bg-gray-950 ${active
                                        ? 'border-gray-900 dark:border-white ring-2 ring-gray-900/30 dark:ring-white/30'
                                        : 'border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-gray-500'
                                        }`}
                                    title={alreadySelected ? `${item.name} already selected` : `Select ${item.name}`}
                                >
                                    {item.media_type === 'video' ? (
                                        <div className="relative w-full h-full">
                                            <video src={item.url} className="w-full h-full object-cover" muted />
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <span className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center">
                                                    <Play size={16} className="text-white ml-0.5" />
                                                </span>
                                            </span>
                                        </div>
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    )}
                                </button>
                                {active && (
                                    <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center">
                                        <Check size={13} />
                                    </span>
                                )}
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold flex items-center gap-1">
                                    {item.media_type === 'video' ? <Film size={9} /> : <ImageIcon size={9} />}
                                    {timeAgo(item.created_at)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(item)}
                                    disabled={deleteMutation.isPending}
                                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 disabled:opacity-50"
                                    title="Delete from library"
                                >
                                    {deletingId === item.id
                                        ? <Loader2 size={12} className="animate-spin" />
                                        : <Trash2 size={12} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedItems.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-900 pt-3">
                    <p className="text-xs text-gray-500">
                        {selectedItems.length} selected
                    </p>
                    <Button
                        size="sm"
                        className="rounded-full px-5 gap-2"
                        onClick={() => {
                            onSelect(selectedItems);
                            setSelected({});
                        }}
                    >
                        <Check size={14} />
                        Use selected
                    </Button>
                </div>
            )}

            <InfoDialog
                open={!!confirmDelete}
                onOpenChange={(open) => !open && setConfirmDelete(null)}
                title="Delete Media"
                infoMessage={`Delete "${confirmDelete?.name}" from the library? Posts that already use it keep working.`}
                variant="error"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                primaryAction={() => {
                    if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
                    setConfirmDelete(null);
                }}
                secondaryAction={() => setConfirmDelete(null)}
            />
        </div>
    );
}

/* ---------------- Picker dialog ---------------- */

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUrls?: string[];
    onSelect: (media: PickedMedia[]) => void;
}

/** Dialog to upload new media or pick from the uploaded library. */
export function MediaPicker({ open, onOpenChange, selectedUrls = [], onSelect }: MediaPickerProps) {
    const [tab, setTab] = useState<'upload' | 'library'>('upload');

    const handleSelect = (media: PickedMedia[]) => {
        onSelect(media);
        onOpenChange(false);
    };

    return (
        <CustomDialog
            title="Add Media"
            description="Upload a new image or video, or pick one from your library"
            open={open}
            onOpenChange={onOpenChange}
            contentWidth="max-w-[560px]"
        >
            <div className="space-y-4">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-full p-1">
                    {(['upload', 'library'] as const).map((value) => (
                        <button
                            key={value}
                            onClick={() => setTab(value)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${tab === value
                                ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                {tab === 'upload'
                    ? <UploadTab remainingSlots={Math.max(0, MAX_PICKED_MEDIA - selectedUrls.length)} onSelect={handleSelect} />
                    : (
                        <LibraryTab
                            selectedUrls={selectedUrls}
                            remainingSlots={Math.max(0, MAX_PICKED_MEDIA - selectedUrls.length)}
                            onSelect={handleSelect}
                        />
                    )}
            </div>
        </CustomDialog>
    );
}
