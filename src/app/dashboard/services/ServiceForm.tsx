'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminService, ServiceCategory, ServiceStatus } from './types';

type Props = { service?: AdminService; categories: ServiceCategory[]; onSaved: (service: AdminService) => void; onCancel?: () => void };

export default function ServiceForm({ service, categories, onSaved, onCancel }: Props) {
  const client = useQueryClient();
  const [title, setTitle] = useState(service?.title ?? '');
  const [slug, setSlug] = useState(service?.slug ?? '');
  const [shortDescription, setShortDescription] = useState(service?.short_description ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [categoryId, setCategoryId] = useState(service?.category?.id ?? '');
  const [features, setFeatures] = useState(service?.features.join('\n') ?? '');
  const [status, setStatus] = useState<ServiceStatus>(service?.status ?? 'draft');
  const [featured, setFeatured] = useState(service?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState(service?.sort_order ?? 0);
  const [metaTitle, setMetaTitle] = useState(service?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(service?.meta_description ?? '');
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(), slug: slug.trim() || undefined,
        short_description: shortDescription.trim(), description: description.trim(),
        category_id: categoryId || null,
        features: features.split('\n').map(item => item.trim()).filter(Boolean),
        status, is_featured: featured, sort_order: sortOrder,
        meta_title: metaTitle.trim(), meta_description: metaDescription.trim(),
      };
      const response = service
        ? await securityAxios.patch(`/services/admin/services/${service.id}`, payload)
        : await securityAxios.post('/services/admin/services', payload);
      return response.data.data.service as AdminService;
    },
    onSuccess: saved => {
      toast.success(service ? 'Service updated' : 'Service created');
      client.invalidateQueries({ queryKey: ['admin-services'] });
      client.invalidateQueries({ queryKey: ['admin-service', saved.id] });
      onSaved(saved);
    },
    onError: error => toast.error(apiMessage(error, 'Could not save service')),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); save.mutate(); };

  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1 text-sm font-medium">Title *<Input required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} /></label>
      <label className="space-y-1 text-sm font-medium">Slug<Input value={slug} onChange={event => setSlug(event.target.value)} placeholder="Generated from title when blank" /></label>
    </div>
    <label className="block space-y-1 text-sm font-medium">Short description<Input maxLength={300} value={shortDescription} onChange={event => setShortDescription(event.target.value)} /></label>
    <label className="block space-y-1 text-sm font-medium">Description<Textarea rows={4} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 text-sm font-medium"><span>Category</span><Select value={categoryId || 'none'} onValueChange={value => setCategoryId(value === 'none' ? '' : value)}><SelectTrigger aria-label="Category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No category</SelectItem>{categories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div>
      <label className="space-y-1 text-sm font-medium">Display order<Input type="number" min={0} value={sortOrder} onChange={event => setSortOrder(Number(event.target.value))} /></label>
    </div>
    <label className="block space-y-1 text-sm font-medium">Features <span className="font-normal text-muted-foreground">(one per line)</span><Textarea rows={3} value={features} onChange={event => setFeatures(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 text-sm font-medium"><span>Status</span><Select value={status} onValueChange={value => setStatus(value as ServiceStatus)}><SelectTrigger aria-label="Status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published" disabled={!service?.options.some(option => option.is_active)}>Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
      <label className="flex items-end gap-2 pb-2 text-sm font-medium"><Switch checked={featured} onCheckedChange={setFeatured} /> Featured service</label>
    </div>
    {!service && <p className="text-sm text-muted-foreground">New services start as drafts. Add a booking option on the service page before publishing.</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1 text-sm font-medium">SEO title<Input maxLength={200} value={metaTitle} onChange={event => setMetaTitle(event.target.value)} /></label>
      <label className="space-y-1 text-sm font-medium">SEO description<Input value={metaDescription} onChange={event => setMetaDescription(event.target.value)} /></label>
    </div>
    <div className="flex justify-end gap-2">{onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}<Button type="submit" disabled={save.isPending || !title.trim()}>{save.isPending ? 'Saving…' : service ? 'Save changes' : 'Create service'}</Button></div>
  </form>;
}
