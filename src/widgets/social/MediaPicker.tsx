'use client';

import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Film, ImageIcon, Loader2, Play, Trash2, Upload, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { apiMessage } from '@/lib/api-message';
import { timeAgo } from '@/lib/format-time';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import RefreshButton from '@/widgets/RefreshButton/RefreshButton';

export interface PickedMedia {
    url: string;
    mediaType: 'image' | 'video';
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

function UploadTab({ onSelect }: { onSelect: (media: PickedMedia) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const pickFile = (candidate: File) => {
        const kind = fileKind(candidate.name);
        if (!kind) {
            toast.error(`Unsupported file type. Allowed: ${[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join(', ')}`);
            return;
        }
        const maxMb = kind === 'image' ? MAX_IMAGE_MB : MAX_VIDEO_MB;
        if (candidate.size > maxMb * 1024 * 1024) {
            toast.error(`File too large. Max ${maxMb}MB for ${kind}s.`);
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(candidate);
        setPreviewUrl(URL.createObjectURL(candidate));
    };

    const uploadMutation = useMutation({
        mutationFn: async (upload: File) => {
            const form = new FormData();
            form.append('file', upload);
            const response = await securityAxios.post(endpoints.social.adminMediaUpload, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: (response) => {
            const media = response?.data;
            toast.success('Media uploaded');
            queryClient.invalidateQueries({ queryKey: ['social-media'] });
            if (media?.url) {
                onSelect({ url: media.url, mediaType: media.media_type });
            }
        },
        onError: (error: unknown) => toast.error(apiMessage(error, 'Upload failed')),
    });

    const kind = file ? fileKind(file.name) : null;

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept={[...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS].join(',')}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
            />

            {!file ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]);
                    }}
                    className={`w-full rounded-xl border-2 border-dashed py-12 flex flex-col items-center gap-2 transition-colors ${dragOver
                        ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-900'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <UploadCloud size={32} className="text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Click to choose a file or drag it here
                    </p>
                    <p className="text-xs text-gray-500">
                        Images up to {MAX_IMAGE_MB}MB · Videos up to {MAX_VIDEO_MB}MB
                    </p>
                </button>
            ) : (
                <div className="space-y-3">
                    {kind === 'video' ? (
                        <video src={previewUrl} controls className="w-full max-h-64 rounded-xl border border-gray-200 dark:border-gray-800" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Upload preview" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-800" />
                    )}
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500 truncate">{file.name}</p>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant="ghost" size="sm"
                                disabled={uploadMutation.isPending}
                                onClick={() => { setFile(null); setPreviewUrl(''); }}
                            >
                                Change
                            </Button>
                            <Button
                                size="sm" className="gap-2 rounded-full px-5"
                                disabled={uploadMutation.isPending}
                                onClick={() => uploadMutation.mutate(file)}
                            >
                                {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                Upload & use
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------------- Library tab ---------------- */

function LibraryTab({ onSelect }: { onSelect: (media: PickedMedia) => void }) {
    const [typeFilter, setTypeFilter] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

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
                    {items.map((item) => (
                        <div key={item.id} className="relative group">
                            <button
                                type="button"
                                onClick={() => onSelect({ url: item.url, mediaType: item.media_type })}
                                className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:ring-2 hover:ring-gray-500 transition-shadow bg-gray-50 dark:bg-gray-950"
                                title={`Use ${item.name}`}
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
                    ))}
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
    onSelect: (media: PickedMedia) => void;
}

/** Dialog to upload new media or pick from the uploaded library. */
export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
    const [tab, setTab] = useState<'upload' | 'library'>('upload');

    const handleSelect = (media: PickedMedia) => {
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
                    ? <UploadTab onSelect={handleSelect} />
                    : <LibraryTab onSelect={handleSelect} />}
            </div>
        </CustomDialog>
    );
}
