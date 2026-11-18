'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, CheckCircle, Edit, Eye, FileText, Plus, RefreshCw, Star, Tag } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/widgets/custom-dialog/CustomDialog';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { CustomFilter, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomPagination, type PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import ServiceForm from './ServiceForm';
import type { AdminService, ServiceCategory } from './types';

type ServicePage = { services: AdminService[]; total: number; pagination: { page: number; limit: number; total_pages: number } };
type ServiceRow = { id: string; image: string; title: string; category: string; status: string; options: number; featured: boolean; hasActiveOption: boolean };

const filterConfig: FilterConfig = {
  showSearch: true,
  searchPlaceholder: 'Search services by title or slug...',
  urlParamPrefix: 'service',
  fields: [{ name: 'status', type: 'select', placeholder: 'Status', options: [
    { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' },
  ] }],
};

function ServicesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const client = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ServiceRow | null>(null);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 20));
  const search = params.get('search') || '';
  const status = params.get('service_status') || '';
  const services = useQuery({
    queryKey: ['admin-services', page, limit, search, status],
    queryFn: async () => (await securityAxios.get('/services/admin/services', { params: { page, limit, search, status } })).data.data as ServicePage,
  });
  const categories = useQuery({
    queryKey: ['admin-service-categories'],
    queryFn: async () => (await securityAxios.get('/services/admin/categories', { params: { status: 'all' } })).data.data.categories as ServiceCategory[],
  });
  const archive = useMutation({
    mutationFn: (id: string) => securityAxios.delete(`/services/admin/services/${id}`),
    onSuccess: () => { toast.success('Service archived'); client.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError: error => toast.error(apiMessage(error, 'Could not archive service')),
  });
  const updateService = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, string | boolean> }) => securityAxios.patch(`/services/admin/services/${id}`, values),
    onSuccess: (_, variables) => { toast.success(variables.values.status === 'published' ? 'Service published' : variables.values.status === 'draft' ? 'Service moved to draft' : 'Service updated'); client.invalidateQueries({ queryKey: ['admin-services'] }); client.invalidateQueries({ queryKey: ['admin-service', variables.id] }); },
    onError: error => toast.error(apiMessage(error, 'Could not update service')),
  });
  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    router.push(`/dashboard/services?${next.toString()}`);
  };
  const rows: ServiceRow[] = (services.data?.services ?? []).map(item => ({
    id: item.id, image: item.images.find(image => image.image_type === 'main')?.url ?? item.images[0]?.url ?? '',
    title: item.title, category: item.category?.name ?? '—', status: item.status,
    options: item.options.length, featured: item.is_featured, hasActiveOption: item.options.some(option => option.is_active),
  }));
  const data = services.data;
  const pagination: PaginationMeta | null = data ? {
    current_page: data.pagination.page, per_page: data.pagination.limit, total: data.total,
    total_pages: data.pagination.total_pages,
    has_next: data.pagination.page < data.pagination.total_pages,
    has_previous: data.pagination.page > 1,
    next_page: data.pagination.page < data.pagination.total_pages ? data.pagination.page + 1 : null,
    previous_page: data.pagination.page > 1 ? data.pagination.page - 1 : null,
    start_index: data.total ? (data.pagination.page - 1) * data.pagination.limit + 1 : 0,
    end_index: Math.min(data.total, data.pagination.page * data.pagination.limit),
  } : null;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Services</h1><p className="text-sm text-muted-foreground">Manage your service catalog</p></div>
    <div className="flex flex-wrap items-center justify-between gap-2"><Button onClick={() => setCreating(true)} className="gap-2"><Plus size={16} />New Service</Button><Button variant="outline" className="gap-2" onClick={() => services.refetch()}><RefreshCw size={16} />Refresh</Button></div>
    <CustomFilter config={filterConfig} />
    <CustomDialog title="Create New Service" description="Create a draft, then add a booking option before publishing." open={creating} onOpenChange={setCreating} contentWidth="max-w-[800px]">
      {categories.isError ? <p className="text-sm text-destructive">Could not load service categories.</p> : <ServiceForm categories={categories.data ?? []} onSaved={item => { setCreating(false); router.push(`/dashboard/services/${item.id}`); }} onCancel={() => setCreating(false)} />}
    </CustomDialog>
    <InfoDialog open={!!archiveTarget} onOpenChange={open => { if (!open) setArchiveTarget(null); }} title="Archive Service" infoMessage={`Archive ${archiveTarget?.title ?? 'this service'}? It will no longer appear on the storefront.`} variant="info" primaryButtonText="Archive" primaryAction={() => { if (archiveTarget) archive.mutate(archiveTarget.id); setArchiveTarget(null); }} secondaryAction={() => setArchiveTarget(null)} />
    {services.isLoading ? <TableSkeleton /> : services.isError ? <p role="alert" className="rounded-lg border p-8 text-center text-destructive">Could not load services. Try Refresh.</p> : <DataTable<ServiceRow> data={rows} excludeColumns={['id', 'hasActiveOption']} images={{ image: row => row.image }} links={{ title: row => `/dashboard/services/${row.id}` }} dots={{ status: { published: 'emerald', draft: 'amber', archived: 'rose' } }} badges={{ featured: { true: 'amber', false: 'zinc' } }} renderActions={row => <ActionsDropdown actions={[
      { label: 'View Details', icon: <Eye />, onClick: () => router.push(`/dashboard/services/${row.id}`), color: 'emerald' },
      { label: 'Edit Service', icon: <Edit />, onClick: () => router.push(`/dashboard/services/${row.id}?edit=1`), color: 'blue' },
      { label: 'Add Option', icon: <Plus />, onClick: () => router.push(`/dashboard/services/${row.id}?addOption=1`), color: 'violet' },
      { label: 'View Options', icon: <Tag />, onClick: () => router.push(`/dashboard/services/${row.id}#booking-options`), color: 'amber' },
      { label: row.featured ? 'Remove Featured' : 'Mark Featured', icon: <Star />, onClick: () => updateService.mutate({ id: row.id, values: { is_featured: !row.featured } }), color: 'amber', disabled: updateService.isPending || archive.isPending },
      { label: row.status === 'published' ? 'Move to Draft' : row.status === 'draft' ? 'Publish' : 'Restore to Draft', icon: row.status === 'published' ? <FileText /> : <CheckCircle />, onClick: () => updateService.mutate({ id: row.id, values: { status: row.status === 'published' || row.status === 'archived' ? 'draft' : 'published' } }), color: 'emerald', disabled: updateService.isPending || archive.isPending || (row.status === 'draft' && !row.hasActiveOption) },
      ...(row.status !== 'archived' ? [{ label: 'Archive', icon: <Archive />, onClick: () => setArchiveTarget(row), variant: 'destructive' as const, disabled: updateService.isPending || archive.isPending }] : []),
    ]} maxVisible={3} showLabels={false} />} emptyTitle="No Services Found" emptyDescription="Create a service to start building your catalog." />}
    {pagination && pagination.total_pages > 1 && <CustomPagination pagination={pagination} onPageChange={value => updateParams({ page: String(value) })} onLimitChange={value => updateParams({ page: '1', limit: String(value) })} limitOptions={[10, 20, 50, 100]} />}
  </div>;
}

export default function ServicesAdminPage() {
  return <Suspense fallback={<TableSkeleton />}><ServicesContent /></Suspense>;
}
