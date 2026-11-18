'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Edit, Eye, EyeOff, FolderTree, Plus, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomFilter, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import type { ServiceCategory } from '../types';

type CategoryFormProps = { category?: ServiceCategory; categories: ServiceCategory[]; onSaved: () => void; onCancel: () => void };

function CategoryForm({ category, categories, onSaved, onCancel }: CategoryFormProps) {
  const client = useQueryClient();
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentId, setParentId] = useState(category?.parent_id ?? '');
  const [active, setActive] = useState(category?.is_active ?? true);
  const [hidden, setHidden] = useState(category?.is_hidden ?? false);
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0);
  const [metaTitle, setMetaTitle] = useState(category?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(category?.meta_description ?? '');
  const [image, setImage] = useState<File | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append('name', name.trim());
      if (slug.trim()) data.append('slug', slug.trim());
      data.append('description', description.trim());
      data.append('parent_id', parentId);
      data.append('is_active', String(active));
      data.append('is_hidden', String(hidden));
      data.append('sort_order', String(sortOrder));
      data.append('meta_title', metaTitle.trim());
      data.append('meta_description', metaDescription.trim());
      if (image) data.append('image', image);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (category) await securityAxios.patch(`/services/admin/categories/${category.id}`, data, config);
      else await securityAxios.post('/services/admin/categories', data, config);
    },
    onSuccess: () => { toast.success(category ? 'Category updated' : 'Category created'); client.invalidateQueries({ queryKey: ['admin-service-categories'] }); client.invalidateQueries({ queryKey: ['admin-services'] }); onSaved(); },
    onError: error => toast.error(apiMessage(error, 'Could not save category')),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); save.mutate(); };
  return <form onSubmit={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium">Name *<Input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label><label className="space-y-1 text-sm font-medium">Slug<Input value={slug} onChange={event => setSlug(event.target.value)} placeholder="Generated from name when blank" /></label></div>
    <label className="block space-y-1 text-sm font-medium">Description<Textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1 text-sm font-medium"><span>Parent category</span><Select value={parentId || 'none'} onValueChange={value => setParentId(value === 'none' ? '' : value)}><SelectTrigger aria-label="Parent category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{categories.filter(item => item.id !== category?.id).map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div><label className="space-y-1 text-sm font-medium">Display order<Input type="number" min={0} value={sortOrder} onChange={event => setSortOrder(Number(event.target.value))} /></label></div>
    <div className="flex gap-5 text-sm"><label className="flex items-center gap-2"><Switch checked={active} onCheckedChange={setActive} /> Active</label><label className="flex items-center gap-2"><Switch checked={hidden} onCheckedChange={setHidden} /> Hidden from storefront</label></div>
    <label className="block space-y-1 text-sm font-medium">Category image<Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => setImage(event.target.files?.[0] ?? null)} /></label>
    {category?.image && <a href={category.image} target="_blank" rel="noreferrer" className="text-sm underline">View current image</a>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium">SEO title<Input maxLength={200} value={metaTitle} onChange={event => setMetaTitle(event.target.value)} /></label><label className="space-y-1 text-sm font-medium">SEO description<Input value={metaDescription} onChange={event => setMetaDescription(event.target.value)} /></label></div>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={!name.trim() || save.isPending}>{save.isPending ? 'Saving…' : category ? 'Save changes' : 'Create category'}</Button></div>
  </form>;
}

type CategoryRow = { id: string; image: string; name: string; parent: string; status: string; visibility: string; order: number };

const filterConfig: FilterConfig = {
  showSearch: true, searchPlaceholder: 'Search service categories...', urlParamPrefix: 'service_category',
  fields: [
    { name: 'status', type: 'select', placeholder: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
    { name: 'visibility', type: 'select', placeholder: 'Visibility', options: [{ value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }] },
  ],
};

function ServiceCategoriesContent() {
  const client = useQueryClient();
  const params = useSearchParams();
  const [editor, setEditor] = useState<ServiceCategory | 'new' | null>(null);
  const [viewingCategory, setViewingCategory] = useState<ServiceCategory | null>(null);
  const [viewingPath, setViewingPath] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);
  const categories = useQuery({ queryKey: ['admin-service-categories'], queryFn: async () => (await securityAxios.get('/services/admin/categories', { params: { status: 'all' } })).data.data.categories as ServiceCategory[] });
  const remove = useMutation({
    mutationFn: (id: string) => securityAxios.delete(`/services/admin/categories/${id}`),
    onSuccess: () => { toast.success('Category removed'); client.invalidateQueries({ queryKey: ['admin-service-categories'] }); },
    onError: error => toast.error(apiMessage(error, 'Could not remove category. Move its services and child categories first.')),
  });
  const updateCategory = useMutation({
    mutationFn: ({ item, values }: { item: ServiceCategory; values: Record<string, boolean> }) => securityAxios.patch(`/services/admin/categories/${item.id}`, values),
    onSuccess: () => { toast.success('Category updated'); client.invalidateQueries({ queryKey: ['admin-service-categories'] }); client.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError: error => toast.error(apiMessage(error, 'Could not update category')),
  });
  const all = categories.data ?? [];
  const fullPath = (category: ServiceCategory) => {
    const names: string[] = [];
    const seen = new Set<string>();
    let current: ServiceCategory | undefined = category;
    while (current && !seen.has(current.id)) {
      names.unshift(current.name);
      seen.add(current.id);
      current = all.find(item => item.id === current?.parent_id);
    }
    return names.join(' / ');
  };
  const search = (params.get('search') ?? '').toLowerCase();
  const status = params.get('service_category_status') ?? '';
  const visibility = params.get('service_category_visibility') ?? '';
  const filtered = all.filter(item =>
    (!search || `${item.name} ${item.slug} ${item.description}`.toLowerCase().includes(search)) &&
    (!status || status === 'all' || (status === 'active' ? item.is_active : !item.is_active)) &&
    (!visibility || visibility === 'all' || (visibility === 'hidden' ? item.is_hidden : !item.is_hidden))
  );
  const rows: CategoryRow[] = filtered.map(item => ({ id: item.id, image: item.image ?? '', name: item.name,
    parent: all.find(parent => parent.id === item.parent_id)?.name ?? '—',
    status: item.is_active ? 'Active' : 'Inactive', visibility: item.is_hidden ? 'Hidden' : 'Visible', order: item.sort_order }));
  return <div className="space-y-6"><Link href="/dashboard/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All services</Link><div><h1 className="text-2xl font-bold tracking-tight">Categories</h1><p className="text-sm text-muted-foreground">Organise your service catalog</p></div><div className="flex items-center justify-between"><Button onClick={() => setEditor('new')} className="gap-2"><Plus size={16} />New Category</Button><Button variant="outline" onClick={() => categories.refetch()}>Refresh</Button></div>
    <CustomFilter config={filterConfig} />
    {categories.isLoading ? <TableSkeleton /> : categories.isError ? <p role="alert" className="rounded-lg border p-8 text-center text-destructive">Could not load service categories.</p> : <DataTable<CategoryRow> data={rows} excludeColumns={['id']} images={{ image: row => row.image }} dots={{ status: { Active: 'emerald', Inactive: 'rose' }, visibility: { Visible: 'emerald', Hidden: 'amber' } }} renderActions={row => {
      const item = all.find(category => category.id === row.id);
      if (!item) return null;
      const busy = updateCategory.isPending || remove.isPending;
      return <ActionsDropdown actions={[
        { label: 'View Details', icon: <Eye />, onClick: () => setViewingCategory(item), color: 'blue' },
        { label: 'View Full Path', icon: <FolderTree />, onClick: () => setViewingPath(item), color: 'violet' },
        { label: 'Edit Category', icon: <Edit />, onClick: () => setEditor(item), color: 'emerald', disabled: busy },
        { label: item.is_active ? 'Deactivate' : 'Activate', icon: item.is_active ? <XCircle /> : <CheckCircle />, onClick: () => updateCategory.mutate({ item, values: { is_active: !item.is_active } }), color: item.is_active ? 'rose' : 'emerald', disabled: busy },
        { label: item.is_hidden ? 'Make Visible' : 'Hide', icon: item.is_hidden ? <Eye /> : <EyeOff />, onClick: () => updateCategory.mutate({ item, values: { is_hidden: !item.is_hidden } }), color: item.is_hidden ? 'emerald' : 'amber', disabled: busy },
        { label: 'Delete Category', icon: <Trash2 />, onClick: () => setDeleteTarget(item), variant: 'destructive', disabled: busy },
      ]} maxVisible={3} showLabels={false} />;
    }} emptyTitle="No Categories Found" emptyDescription="Create a category to organise services." />}
    <CustomDialog title="Category Details" open={!!viewingCategory} onOpenChange={open => { if (!open) setViewingCategory(null); }}>
      {viewingCategory && <div className="space-y-3 text-sm"><p><span className="font-medium">Name:</span> {viewingCategory.name}</p><p><span className="font-medium">Slug:</span> {viewingCategory.slug}</p><p><span className="font-medium">Path:</span> {fullPath(viewingCategory)}</p><p><span className="font-medium">Status:</span> {viewingCategory.is_active ? 'Active' : 'Inactive'}</p><p><span className="font-medium">Visibility:</span> {viewingCategory.is_hidden ? 'Hidden' : 'Visible'}</p><p><span className="font-medium">Display order:</span> {viewingCategory.sort_order}</p>{viewingCategory.description && <p><span className="font-medium">Description:</span> {viewingCategory.description}</p>}{viewingCategory.image && <a className="underline" href={viewingCategory.image} target="_blank" rel="noreferrer">View image</a>}</div>}
    </CustomDialog>
    <CustomDialog title="Category Path" open={!!viewingPath} onOpenChange={open => { if (!open) setViewingPath(null); }}>
      {viewingPath && <p className="text-sm">{fullPath(viewingPath)}</p>}
    </CustomDialog>
    <CustomDialog title={editor === 'new' ? 'Create Service Category' : 'Edit Service Category'} description="Set the category details and storefront visibility." open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }} contentWidth="max-w-[800px]">{editor && <CategoryForm key={editor === 'new' ? 'new' : editor.id} category={editor === 'new' ? undefined : editor} categories={all} onSaved={() => setEditor(null)} onCancel={() => setEditor(null)} />}</CustomDialog>
    <InfoDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }} title="Delete Category" infoMessage={`Delete ${deleteTarget?.name ?? 'this category'}? Categories with services or child categories must be emptied first.`} variant="error" primaryButtonText="Delete" primaryAction={() => { if (deleteTarget) remove.mutate(deleteTarget.id); setDeleteTarget(null); }} secondaryAction={() => setDeleteTarget(null)} />
  </div>;
}

export default function ServiceCategoriesPage() {
  return <Suspense fallback={<TableSkeleton />}><ServiceCategoriesContent /></Suspense>;
}
