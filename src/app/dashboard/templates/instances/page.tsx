'use client';
import { useState } from 'react';
import { InfoDialog } from '@/widgets/custom-dialog/InfoDialog';
import { TableSkeleton } from '@/widgets/custom-table/TableSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { Button } from '@/components/ui/button';
import { allRecords, base, type Instance } from '../api';
export default function SavedResults() {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter(); const query = useQuery({ queryKey: ['template-instances'], queryFn: () => allRecords<Instance>('instances') });
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Saved template results</h1>{query.isError ? <Button onClick={() => query.refetch()}>Retry loading results</Button> : query.isPending ? <TableSkeleton/> : <DataTable data={(query.data ?? []).map(i => ({ id: i.id, name: i.name, type: i.snapshot.type, group: i.group_name || '—', updated: new Date(i.updated_at ?? '').toLocaleString() }))} excludeColumns={['id']} actions={[
    { label: 'Open', icon: <Eye/>, onClick: row => { const item = query.data?.find(i => i.id === row.id); router.push(`/dashboard/templates/use?${item?.batch_id ? `batch=${item.batch_id}` : `instance=${row.id}`}`); } },
    { label: 'Delete', icon: <Trash2/>, variant: 'destructive', onClick: row => setDeleting(row.id) },
  ]}/>}<InfoDialog title="Delete saved result" infoMessage="Delete this result? The reusable template will be preserved." variant="info" open={!!deleting} onOpenChange={open => { if (!open) setDeleting(null); }} primaryButtonText="Delete" secondaryAction={() => setDeleting(null)} primaryAction={async () => { if (!deleting) return; try { await api.delete(`${base}/instances/${deleting}`); await query.refetch(); setDeleting(null); } catch (error) { toast.error(apiMessage(error, 'Could not delete result')); } }}/></div>;
}
