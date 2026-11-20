'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Edit, Copy, Archive, Eye, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { CustomPagination, type PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { CustomFilter, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomSortFromUrl } from '@/widgets/custom-sort/CustomSortFromUrl';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import TemplateRecordForm from './(components)/TemplateRecordForm';
import { allRecords, base, persistImages, upgradeCanvas, type Template, type Category, type Group } from './api';

type RecordItem = Template | Category | Group;
function LibraryContent({ kind = 'templates' }: { kind?: 'templates' | 'categories' | 'groups' }) {
  const client = useQueryClient(); const router = useRouter();
  const [editing, setEditing] = useState<RecordItem | 'new' | null>(null);
  const params = useSearchParams(); const pathname = usePathname();
  const page = Math.max(1, Number(params.get('page')) || 1), limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 20));
  const search = params.get('search') || '', type = params.get('template_type') || '', category = params.get('template_category') || '', status = params.get('template_status') || '';
  const defaultSortBy = kind === 'categories' ? 'name' : 'updated_at';
  const defaultSortOrder = kind === 'categories' ? 'asc' : 'desc';
  const sortBy = params.get('template_sort_by') || defaultSortBy, sortOrder = params.get('template_sort_order') || defaultSortOrder;
  const [archiveTarget, setArchiveTarget] = useState<RecordItem | null>(null);
  const updateParams = (updates: Record<string, string>) => { const next = new URLSearchParams(params.toString()); Object.entries(updates).forEach(([key, value]) => next.set(key, value)); router.push(`${pathname}?${next}`); };
  const query = useQuery({ queryKey: ['templates', kind, search, type, category, status, page, limit, sortBy, sortOrder], queryFn: async () => (await api.get(`${base}/${kind}`, { params: { search, type: kind === 'templates' ? type : undefined, category: category || undefined, status, page, limit, sort_by: sortBy, sort_order: sortOrder } })).data.data });
  const categories = useQuery({ queryKey: ['template-categories'], queryFn: () => allRecords<Category>('categories') });
  const templates = useQuery({ queryKey: ['template-options'], queryFn: () => allRecords<Template>('templates'), enabled: kind === 'groups' });
  const refresh = () => { client.invalidateQueries({ queryKey: ['templates'] }); client.invalidateQueries({ queryKey: ['template-categories'] }); client.invalidateQueries({ queryKey: ['template-options'] }); };
  const action = useMutation({ mutationFn: async ({ item, duplicate }: { item: RecordItem; duplicate?: boolean }) => {
    if (duplicate) return api.post(`${base}/${kind}/${item.id}/duplicate`);
    return api.patch(`${base}/${kind}/${item.id}`, { ...item, ...(kind === 'categories' ? { is_active: !(item as Category).is_active } : { status: (item as Template).status === 'archived' ? 'draft' : 'archived' }) });
  }, onSuccess: () => { refresh(); toast.success('Saved'); }, onError: e => toast.error(apiMessage(e, 'Could not update record')) });
  const importLegacy = useMutation({ mutationFn: async () => {
    const records = JSON.parse(localStorage.getItem('estore-promotion-templates-v1') || '[]');
    if (!Array.isArray(records) || !records.length) throw new Error('No browser-saved templates to import');
    const imported: string[] = JSON.parse(localStorage.getItem('estore-template-imports') || '[]');
    for (const record of records) {
      if (imported.includes(record.id)) continue;
      const json = await persistImages(record.json) as Record<string, unknown>;
      const slots = upgradeCanvas(json);
      await api.post(`${base}/templates`, { name: record.name, type: 'image', status: 'draft', content: { json, width: record.width, height: record.height }, slots, category_ids: [] });
      imported.push(record.id); localStorage.setItem('estore-template-imports', JSON.stringify(imported));
    }
  }, onSuccess: () => { refresh(); toast.success('Browser templates imported'); }, onError: e => toast.error(apiMessage(e, e instanceof Error ? e.message : 'Could not import templates')) });
  const items: RecordItem[] = query.data?.[kind] ?? [];
  const filterConfig: FilterConfig = { showSearch: true, searchPlaceholder: 'Search templates…', urlParamPrefix: 'template', fields: [
    { name: 'status', type: 'select', placeholder: 'Status', options: [{ value: 'active', label: 'Active' }, ...(kind !== 'categories' ? [{ value: 'draft', label: 'Draft' }] : []), { value: 'archived', label: 'Archived' }] },
    ...(kind === 'templates' ? [{ name: 'type', type: 'select' as const, placeholder: 'Type', options: [{ value: 'text', label: 'Text' }, { value: 'image', label: 'Image' }] }, { name: 'category', type: 'select' as const, placeholder: 'Category', options: (categories.data ?? []).map(c => ({ value: c.id, label: c.name })) }] : []),
  ] };
  const pagination = query.data?.pagination as PaginationMeta | undefined;
  const rows = items.map(item => ({ id: item.id, name: item.name, ...(kind === 'templates' ? { type: (item as Template).type, slots: (item as Template).slots.length, categories: (categories.data ?? []).filter(c => (item as Template).category_ids.includes(c.id)).map(c => c.name).join(', ') } : {}), status: kind === 'categories' ? (item as Category).is_active ? 'active' : 'archived' : (item as Template).status }));
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{kind === 'templates' ? 'Templates' : kind === 'categories' ? 'Template Categories' : 'Template Groups'}</h1><p className="text-sm text-gray-500 dark:text-gray-400">{kind === 'templates' ? 'Manage reusable text and image templates' : kind === 'categories' ? 'Organize templates with reusable categories' : 'Bundle templates for a coordinated content set'}</p></div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {kind === 'templates' && <><Button variant="outline" disabled={importLegacy.isPending} onClick={() => importLegacy.mutate()}>Import saved templates</Button><Button asChild variant="outline"><Link href="/dashboard/templates/editor">New image template</Link></Button></>}
        <Button onClick={() => setEditing('new')} className="gap-2"><Plus size={16}/>{kind === 'templates' ? 'New Text Template' : kind === 'categories' ? 'New Category' : 'New Group'}</Button>
      </div>
      <Button variant="outline" onClick={() => query.refetch()}><RefreshCw size={16} className="mr-2"/>Refresh</Button>
    </div>
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><CustomFilter config={filterConfig}/></div><CustomSortFromUrl config={{ options: [{ value: 'name', label: 'Name' }, ...(kind !== 'categories' ? [{ value: 'updated_at', label: 'Last updated' }] : [])], defaultSortBy, defaultSortOrder, urlParamPrefix: 'template' }}/></div>
  {query.isPending ? <TableSkeleton/> : query.isError ? <div role="alert" className="flex items-center justify-between rounded-md border border-red-200 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:text-red-300"><span>{apiMessage(query.error, 'Could not load records.')}</span><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : <DataTable data={rows} excludeColumns={['id']} renderActions={row => { const item = items.find(i => i.id === row.id)!; return <ActionsDropdown maxVisible={3} actions={[
    { label: 'Edit', icon: <Edit/>, onClick: () => kind === 'templates' && (item as Template).type === 'image' ? router.push(`/dashboard/templates/editor?id=${item.id}`) : setEditing(item) },
    ...(kind !== 'categories' ? [{ label: 'Use', icon: <Eye/>, onClick: () => router.push(`/dashboard/templates/use?${kind === 'groups' ? 'group' : 'template'}=${item.id}`), disabled: row.status === 'archived' }, { label: 'Duplicate', icon: <Copy/>, onClick: () => action.mutate({ item, duplicate: true }) }] : []),
    { label: row.status === 'archived' ? 'Restore' : 'Archive', icon: <Archive/>, onClick: () => setArchiveTarget(item), disabled: action.isPending },
  ]}/>; }}/>}{pagination && pagination.total_pages > 1 && <CustomPagination pagination={pagination} onPageChange={value => updateParams({ page: String(value) })} onLimitChange={value => updateParams({ page: '1', limit: String(value) })} limitOptions={[10, 20, 50, 100]}/>}
  <InfoDialog open={!!archiveTarget} onOpenChange={open => { if (!open) setArchiveTarget(null); }} title="Update availability" infoMessage={`Change the availability of ${archiveTarget?.name ?? 'this record'}? Existing saved results are preserved.`} variant="info" primaryButtonText="Confirm" primaryAction={() => { if (archiveTarget) action.mutate({ item: archiveTarget }); setArchiveTarget(null); }} secondaryAction={() => setArchiveTarget(null)}/>
  <CustomDialog title={`${editing === 'new' ? 'Create' : 'Edit'} ${kind === 'templates' ? 'text template' : kind === 'categories' ? 'category' : 'group'}`} description="Configure reusable content and its settings." open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }} contentWidth="max-w-[800px]">{editing && <TemplateRecordForm key={editing === 'new' ? 'new' : editing.id} kind={kind} record={editing === 'new' ? undefined : editing} categories={categories.data ?? []} templates={templates.data ?? []} onSaved={() => { refresh(); setEditing(null); }} onCancel={() => setEditing(null)}/>}</CustomDialog></div>;

}

export default function Library(props: { kind?: 'templates' | 'categories' | 'groups' }) { return <Suspense fallback={<TableSkeleton/>}><LibraryContent {...props}/></Suspense>; }
