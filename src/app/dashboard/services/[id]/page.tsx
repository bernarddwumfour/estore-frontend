'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import MultiImagePreviewModal from '@/widgets/image-preview-modal/ImagePreviewModal';
import ServiceForm from '../ServiceForm';
import type { AdminService, PricingType, ServiceCategory, ServiceOption } from '../types';

type OptionEditorProps = { serviceId: string; option?: ServiceOption; onSaved: () => void; onCancel: () => void };

function OptionEditor({ serviceId, option, onSaved, onCancel }: OptionEditorProps) {
  const client = useQueryClient();
  const [name, setName] = useState(option?.name ?? '');
  const [description, setDescription] = useState(option?.description ?? '');
  const [pricingType, setPricingType] = useState<PricingType>(option?.pricing_type ?? 'quote');
  const [price, setPrice] = useState(option?.price ?? '');
  const [duration, setDuration] = useState(option?.duration_minutes?.toString() ?? '');
  const [isDefault, setIsDefault] = useState(option?.is_default ?? false);
  const [isActive, setIsActive] = useState(option?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(option?.sort_order ?? 0);
  const mutation = useMutation({
    mutationFn: () => {
      const payload = { name: name.trim(), description: description.trim(), pricing_type: pricingType,
        price: pricingType === 'quote' ? null : price, duration_minutes: duration ? Number(duration) : null,
        is_default: isDefault, is_active: isActive, sort_order: sortOrder };
      const base = `/services/admin/services/${serviceId}/options`;
      return option ? securityAxios.patch(`${base}/${option.id}`, payload) : securityAxios.post(base, payload);
    },
    onSuccess: () => { toast.success(option ? 'Option updated' : 'Option added'); client.invalidateQueries({ queryKey: ['admin-service', serviceId] }); client.invalidateQueries({ queryKey: ['admin-services'] }); onSaved(); },
    onError: error => toast.error(apiMessage(error, 'Could not save option')),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); mutation.mutate(); };
  return <form onSubmit={submit} className="space-y-4">
    <label className="block space-y-1 text-sm font-medium">Name *<Input required maxLength={120} value={name} onChange={event => setName(event.target.value)} /></label>
    <label className="block space-y-1 text-sm font-medium">Description<Input maxLength={300} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1 text-sm font-medium"><span>Pricing</span><Select value={pricingType} onValueChange={value => setPricingType(value as PricingType)}><SelectTrigger aria-label="Pricing" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quote">Quote required</SelectItem><SelectItem value="fixed">Fixed price</SelectItem><SelectItem value="from">Starting from</SelectItem></SelectContent></Select></div>{pricingType !== 'quote' && <label className="space-y-1 text-sm font-medium">Price *<Input required type="number" min={0} step="0.01" value={price} onChange={event => setPrice(event.target.value)} /></label>}</div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium">Duration (minutes)<Input type="number" min={1} value={duration} onChange={event => setDuration(event.target.value)} /></label><label className="space-y-1 text-sm font-medium">Display order<Input type="number" min={0} value={sortOrder} onChange={event => setSortOrder(Number(event.target.value))} /></label></div>
    <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><Switch checked={isDefault} onCheckedChange={setIsDefault} /> Default option</label><label className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /> Active</label></div>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save option'}</Button></div>
  </form>;
}

export default function ServiceDetailPage() {
  const id = useParams().id as string;
  const searchParams = useSearchParams();
  const selectedOptionId = searchParams.get('option');
  const addOptionRequested = searchParams.get('addOption') === '1';
  const editRequested = searchParams.get('edit') === '1';
  const client = useQueryClient();
  const [editingService, setEditingService] = useState(false);
  const [dismissedServiceEdit, setDismissedServiceEdit] = useState(false);
  const [optionEditor, setOptionEditor] = useState<ServiceOption | 'new' | null>(null);
  const [dismissedOptionId, setDismissedOptionId] = useState<string | null>(null);
  const [dismissedAddOption, setDismissedAddOption] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<'main' | 'gallery' | 'thumbnail'>('main');
  const [imageAlt, setImageAlt] = useState('');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const serviceQuery = useQuery({ queryKey: ['admin-service', id], queryFn: async () => (await securityAxios.get(`/services/admin/services/${id}`)).data.data.service as AdminService, enabled: !!id });
  const categories = useQuery({ queryKey: ['admin-service-categories'], queryFn: async () => (await securityAxios.get('/services/admin/categories', { params: { status: 'all' } })).data.data.categories as ServiceCategory[] });
  const removeOption = useMutation({
    mutationFn: (optionId: string) => securityAxios.delete(`/services/admin/services/${id}/options/${optionId}`),
    onSuccess: () => { toast.success('Option removed'); client.invalidateQueries({ queryKey: ['admin-service', id] }); },
    onError: error => toast.error(apiMessage(error, 'Could not remove option')),
  });
  const uploadImage = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error('Choose an image');
      const data = new FormData();
      data.append('image', imageFile); data.append('image_type', imageType); data.append('alt_text', imageAlt);
      await securityAxios.post(`/services/admin/services/${id}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { toast.success('Image uploaded'); setImageFile(null); setImageAlt(''); client.invalidateQueries({ queryKey: ['admin-service', id] }); },
    onError: error => toast.error(apiMessage(error, 'Could not upload image')),
  });
  const removeImage = useMutation({
    mutationFn: (imageId: string) => securityAxios.delete(`/services/admin/services/${id}/images/${imageId}`),
    onSuccess: () => { toast.success('Image removed'); client.invalidateQueries({ queryKey: ['admin-service', id] }); },
    onError: error => toast.error(apiMessage(error, 'Could not remove image')),
  });
  const service = serviceQuery.data;
  const selectedOption = selectedOptionId && dismissedOptionId !== selectedOptionId
    ? service?.options.find(item => item.id === selectedOptionId) ?? null
    : null;
  const activeOptionEditor = optionEditor ?? selectedOption ?? (addOptionRequested && !dismissedAddOption ? 'new' : null);
  const closeOptionEditor = () => {
    setOptionEditor(null);
    setDismissedOptionId(selectedOptionId);
    setDismissedAddOption(true);
  };

  return <div className="space-y-6"><Link href="/dashboard/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All services</Link>
    {serviceQuery.isLoading ? <p>Loading service…</p> : serviceQuery.isError || !service ? <p role="alert" className="text-destructive">Could not load service.</p> : <>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">{service.title}</h1><Badge variant={service.status === 'published' ? 'default' : 'secondary'}>{service.status}</Badge></div><p className="text-sm text-muted-foreground">/{service.slug} · {service.category?.name ?? 'Uncategorised'}</p></div><Button onClick={() => setEditingService(true)}>Edit service</Button></div>
      <section id="booking-options" className="rounded-lg border bg-card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Booking options</h2><p className="text-sm text-muted-foreground">Add an active option before publishing. Duration is needed for appointment availability.</p></div><Button size="sm" onClick={() => setOptionEditor('new')}><Plus className="mr-2 size-4" />Add option</Button></div>{service.options.length ? <div className="divide-y">{service.options.map(option => <div key={option.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{option.name} {option.is_default && <span className="text-xs text-muted-foreground">(default)</span>}</p><p className="text-sm text-muted-foreground">{option.pricing_type === 'quote' ? 'Quote required' : `${option.pricing_type === 'from' ? 'From ' : ''}${formatCurrency(option.price)}`} · {option.duration_minutes ? `${option.duration_minutes} min` : 'No duration'} · {option.is_active ? 'Active' : 'Inactive'}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setOptionEditor(option)}>Edit</Button><Button size="sm" variant="outline" disabled={removeOption.isPending} onClick={() => { if (window.confirm(`Remove ${option.name}?`)) removeOption.mutate(option.id); }}>Remove</Button></div></div>)}</div> : <p className="text-sm text-muted-foreground">No options yet.</p>}</section>
      <section className="rounded-lg border bg-card p-5 space-y-4"><div><h2 className="text-lg font-semibold">Images</h2><p className="text-sm text-muted-foreground">Add a main image or gallery images for the storefront.</p></div><div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]"><Input aria-label="Choose image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => setImageFile(event.target.files?.[0] ?? null)} /><Select value={imageType} onValueChange={value => setImageType(value as typeof imageType)}><SelectTrigger aria-label="Image type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="main">Main</SelectItem><SelectItem value="gallery">Gallery</SelectItem><SelectItem value="thumbnail">Thumbnail</SelectItem></SelectContent></Select><Button disabled={!imageFile || uploadImage.isPending} onClick={() => uploadImage.mutate()}>{uploadImage.isPending ? 'Uploading…' : 'Upload'}</Button></div><Input aria-label="Image description" maxLength={250} placeholder="Image description" value={imageAlt} onChange={event => setImageAlt(event.target.value)} />{service.images.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{service.images.map((image, index) => <div key={image.id} className="rounded-md border p-3"><button type="button" onClick={() => setPreviewIndex(index)} className="text-sm font-medium underline">Preview {image.image_type} image</button><p className="truncate text-xs text-muted-foreground">{image.alt_text || 'No description'}</p><Button className="mt-2" size="sm" variant="outline" disabled={removeImage.isPending} onClick={() => { if (window.confirm('Remove this image?')) removeImage.mutate(image.id); }}>Remove</Button></div>)}</div> : <p className="text-sm text-muted-foreground">No images yet.</p>}</section>
      {previewIndex !== null && <MultiImagePreviewModal key={previewIndex} images={service.images.map(image => image.url)} alt={service.title} initialIndex={previewIndex} open onClose={() => setPreviewIndex(null)} />}
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-2 text-lg font-semibold">Description</h2><p className="whitespace-pre-wrap text-sm">{service.description || service.short_description || 'No description yet.'}</p>{service.features.length > 0 && <ul className="mt-3 list-inside list-disc text-sm">{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul>}</section>
      <CustomDialog title="Edit Service" description="Update the service details and storefront status." open={editingService || (editRequested && !dismissedServiceEdit)} onOpenChange={open => { setEditingService(open); if (!open) setDismissedServiceEdit(true); }} contentWidth="max-w-[800px]">{categories.isError ? <p className="text-destructive">Could not load categories.</p> : <ServiceForm key={service.id} service={service} categories={categories.data ?? []} onSaved={() => { setEditingService(false); setDismissedServiceEdit(true); }} onCancel={() => { setEditingService(false); setDismissedServiceEdit(true); }} />}</CustomDialog>
      <CustomDialog title={activeOptionEditor === 'new' ? 'Add Booking Option' : 'Edit Booking Option'} open={activeOptionEditor !== null} onOpenChange={open => { if (!open) closeOptionEditor(); }} contentWidth="max-w-[600px]">{activeOptionEditor && <OptionEditor key={activeOptionEditor === 'new' ? 'new' : activeOptionEditor.id} serviceId={id} option={activeOptionEditor === 'new' ? undefined : activeOptionEditor} onSaved={closeOptionEditor} onCancel={closeOptionEditor} />}</CustomDialog>
    </>}
  </div>;
}
