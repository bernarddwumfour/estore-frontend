'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Edit, Eye, RefreshCw, Star, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { ActionsDropdown } from '@/widgets/actions-dropdown/ActionsDropdown';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { CustomFilter, type FilterConfig } from '@/widgets/custom-filter/CustomFilterFromUrl';
import { CustomPagination, type PaginationMeta } from '@/widgets/custom-pagination/CustomPagination';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import type { ServiceOption, ServiceStatus } from '../types';

type ListedOption = ServiceOption & {
  service: { id: string; title: string; status: ServiceStatus };
};
type OptionPage = {
  options: ListedOption[];
  total: number;
  pagination: { page: number; limit: number; total_pages: number };
};
type OptionRow = {
  id: string;
  service: string;
  option: string;
  price: string;
  duration: string;
  status: string;
  default: string;
};

const filterConfig: FilterConfig = {
  showSearch: true,
  searchPlaceholder: 'Search option or service name...',
  urlParamPrefix: 'option',
  fields: [{ name: 'is_active', type: 'select', placeholder: 'Status', options: [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ] }],
};

function ServiceOptionsContent() {
  const router = useRouter();
  const client = useQueryClient();
  const params = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<ListedOption | null>(null);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 20));
  const search = params.get('search') || '';
  const isActive = params.get('option_is_active') || '';
  const options = useQuery({
    queryKey: ['admin-service-options', page, limit, search, isActive],
    queryFn: async () => (await securityAxios.get('/services/admin/options', {
      params: { page, limit, search, is_active: isActive },
    })).data.data as OptionPage,
  });
  const updateOption = useMutation({
    mutationFn: ({ item, values }: { item: ListedOption; values: Record<string, boolean> }) => securityAxios.patch(`/services/admin/services/${item.service.id}/options/${item.id}`, values),
    onSuccess: (_, variables) => { toast.success('Option updated'); client.invalidateQueries({ queryKey: ['admin-service-options'] }); client.invalidateQueries({ queryKey: ['admin-service', variables.item.service.id] }); client.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError: error => toast.error(apiMessage(error, 'Could not update option')),
  });
  const deleteOption = useMutation({
    mutationFn: (item: ListedOption) => securityAxios.delete(`/services/admin/services/${item.service.id}/options/${item.id}`),
    onSuccess: (_, item) => { toast.success('Option deleted'); client.invalidateQueries({ queryKey: ['admin-service-options'] }); client.invalidateQueries({ queryKey: ['admin-service', item.service.id] }); client.invalidateQueries({ queryKey: ['admin-services'] }); },
    onError: error => toast.error(apiMessage(error, 'Could not delete option')),
  });
  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.push(`/dashboard/services/options?${next.toString()}`);
  };
  const items = options.data?.options ?? [];
  const rows: OptionRow[] = items.map(item => ({
    id: item.id,
    service: item.service.title,
    option: item.name,
    price: item.pricing_type === 'quote' ? 'Quote required' : `${item.pricing_type === 'from' ? 'From ' : ''}${formatCurrency(item.price)}`,
    duration: item.duration_minutes ? `${item.duration_minutes} min` : '—',
    status: item.is_active ? 'Active' : 'Inactive',
    default: item.is_default ? 'Yes' : 'No',
  }));
  const data = options.data;
  const pagination: PaginationMeta | null = data ? {
    current_page: data.pagination.page,
    per_page: data.pagination.limit,
    total: data.total,
    total_pages: data.pagination.total_pages,
    has_next: data.pagination.page < data.pagination.total_pages,
    has_previous: data.pagination.page > 1,
    next_page: data.pagination.page < data.pagination.total_pages ? data.pagination.page + 1 : null,
    previous_page: data.pagination.page > 1 ? data.pagination.page - 1 : null,
    start_index: data.total ? (data.pagination.page - 1) * data.pagination.limit + 1 : 0,
    end_index: Math.min(data.total, data.pagination.page * data.pagination.limit),
  } : null;
  const manage = (row: OptionRow) => {
    const item = items.find(option => option.id === row.id);
    if (item) router.push(`/dashboard/services/${item.service.id}?option=${item.id}`);
  };
  const findOption = (row: OptionRow) => items.find(option => option.id === row.id);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Service Options</h1><p className="text-sm text-muted-foreground">Manage the pricing and appointment choices for each service.</p></div>
    <div className="flex justify-end"><Button variant="outline" className="gap-2" onClick={() => options.refetch()}><RefreshCw size={16} />Refresh</Button></div>
    <CustomFilter config={filterConfig} />
    <InfoDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }} title="Delete Service Option" infoMessage={`Delete ${deleteTarget?.name ?? 'this option'}? An option used by an appointment cannot be deleted.`} variant="error" primaryButtonText="Delete" primaryAction={() => { if (deleteTarget) deleteOption.mutate(deleteTarget); setDeleteTarget(null); }} secondaryAction={() => setDeleteTarget(null)} />
    {options.isLoading ? <TableSkeleton /> : options.isError ? <p role="alert" className="rounded-lg border p-8 text-center text-destructive">Could not load service options. Try Refresh.</p> : <DataTable<OptionRow> data={rows} excludeColumns={['id']} links={{ service: row => {
      const item = items.find(option => option.id === row.id);
      return item ? `/dashboard/services/${item.service.id}` : '#';
    } }} dots={{ status: { Active: 'emerald', Inactive: 'rose' } }} badges={{ default: { Yes: 'amber', No: 'zinc' } }} renderActions={row => {
      const item = findOption(row);
      if (!item) return null;
      const busy = updateOption.isPending || deleteOption.isPending;
      return <ActionsDropdown actions={[
        { label: 'View Service', icon: <Eye />, onClick: () => router.push(`/dashboard/services/${item.service.id}#booking-options`), color: 'blue' },
        { label: 'Edit Option', icon: <Edit />, onClick: () => manage(row), color: 'emerald' },
        { label: item.is_active ? 'Deactivate' : 'Activate', icon: item.is_active ? <XCircle /> : <CheckCircle />, onClick: () => updateOption.mutate({ item, values: { is_active: !item.is_active } }), color: item.is_active ? 'rose' : 'emerald', disabled: busy },
        { label: item.is_default ? 'Unset as Default' : 'Set as Default', icon: <Star />, onClick: () => updateOption.mutate({ item, values: { is_default: !item.is_default } }), color: 'amber', disabled: busy },
        { label: 'Delete Option', icon: <Trash2 />, onClick: () => setDeleteTarget(item), variant: 'destructive', disabled: busy },
      ]} maxVisible={3} showLabels={false} />;
    }} emptyTitle="No Service Options Found" emptyDescription="Add an option from a service detail page." />}
    {pagination && pagination.total_pages > 1 && <CustomPagination pagination={pagination} onPageChange={value => updateParams({ page: String(value) })} onLimitChange={value => updateParams({ page: '1', limit: String(value) })} limitOptions={[10, 20, 50, 100]} />}
  </div>;
}

export default function ServiceOptionsPage() {
  return <Suspense fallback={<TableSkeleton />}><ServiceOptionsContent /></Suspense>;
}
