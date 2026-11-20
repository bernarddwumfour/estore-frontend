'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { allRecords, base, uploadAsset, type Template, type Group, type Instance } from '../api';
import Preview from '../Preview';
type Entry = { template: Template; instance?: Instance };
function UseContent() {
  const params = useSearchParams(); const templateId = params.get('template'), groupId = params.get('group'), instanceId = params.get('instance'), batchId = params.get('batch');
  const query = useQuery({ queryKey: ['template-use', templateId, groupId, instanceId, batchId], queryFn: async () => {
    if (instanceId || batchId) {
      const instances: Instance[] = instanceId ? [(await api.get(`${base}/instances/${instanceId}`)).data.data.instance] : await allRecords<Instance>('instances', { batch_id: batchId! });
      return { entries: instances.map(instance => ({ template: instance.snapshot, instance })), group: null };
    }
    const group: Group | null = groupId ? (await api.get(`${base}/groups/${groupId}`)).data.data.group : null;
    const ids = group ? group.template_ids : templateId ? [templateId] : [];
    return { entries: await Promise.all(ids.map(async id => ({ template: (await api.get(`${base}/templates/${id}`)).data.data.template as Template } as Entry))), group };
  } });
  if (query.isPending) return <p>Loading templates…</p>;
  if (query.isError) return <p role="alert">Could not load this template. <Button onClick={() => query.refetch()}>Retry</Button></p>;
  return <UsageForm key={[templateId, groupId, instanceId, batchId].join(':')} entries={query.data.entries} group={query.data.group}/>;
}
function UsageForm({ entries, group }: { entries: Entry[]; group: Group | null }) {
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(entries.map(({ template, instance }, i) => [i, instance?.values ?? Object.fromEntries(template.slots.map(s => [s.key, s.default_value]))])));
  const [saved, setSaved] = useState<Record<string, Instance>>({}); const [uploading, setUploading] = useState(0);
  const save = useMutation({ mutationFn: async () => {
    const payloads = entries.map(({ template }, i) => ({ template_id: template.id, template_revision: template.revision, name: template.name, values: values[i] }));
    if (group && !Object.keys(saved).length && !entries.some(e => e.instance)) return (await api.post(`${base}/groups/${group.id}/use`, { revision: group.revision, items: payloads })).data.data.instances as Instance[];
    return Promise.all(payloads.map(async (payload, i) => { const previous = saved[i] ?? entries[i].instance; return (previous ? await api.patch(`${base}/instances/${previous.id}`, { ...payload, revision: previous.revision }) : await api.post(`${base}/instances`, payload)).data.data.instance as Instance; }));
  }, onSuccess: results => { setSaved(Object.fromEntries(results.map((r, i) => [i, r]))); toast.success('Result saved'); }, onError: e => toast.error(apiMessage(e, 'Could not save result')) });
  const missing = entries.some(({ template }, i) => template.slots.some(slot => slot.required && !values[i]?.[slot.key]?.trim()));
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><Link className="text-sm underline" href="/dashboard/templates">Templates</Link><h1 className="text-2xl font-bold">{group?.name ?? 'Use template'}</h1></div><Button disabled={save.isPending || uploading > 0 || missing || !entries.length} onClick={() => save.mutate()}>Save result{entries.length > 1 ? 's' : ''}</Button></div>{missing && <p className="text-sm text-muted-foreground">Fill in required slots before saving.</p>}{entries.map(({ template }, i) => <section key={i} className="grid gap-5 rounded-lg border p-4 lg:grid-cols-[20rem_minmax(0,1fr)]"><div className="space-y-4"><h2 className="font-semibold">{template.name}</h2>{template.slots.map(slot => <label key={slot.key} className="block space-y-2 text-sm"><span>{slot.label}{slot.required ? ' *' : ''}</span>{slot.type === 'text' ? <Textarea value={values[i]?.[slot.key] ?? ''} onChange={e => setValues(v => ({ ...v, [i]: { ...v[i], [slot.key]: e.target.value } }))}/> : <><Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUploading(n => n + 1); try { const url = await uploadAsset(file); setValues(v => ({ ...v, [i]: { ...v[i], [slot.key]: url } })); } catch (error) { toast.error(apiMessage(error, 'Could not upload image')); } finally { setUploading(n => n - 1); } }}/>{values[i]?.[slot.key] && <Button size="sm" variant="ghost" onClick={() => setValues(v => ({ ...v, [i]: { ...v[i], [slot.key]: '' } }))}>Clear image</Button>}</>}</label>)}{!template.slots.length && <p className="text-sm text-muted-foreground">This template has no configurable slots.</p>}</div><Preview template={template} values={values[i]}/></section>)}</div>;
}
export default function UseTemplatePage() { return <Suspense fallback={<p>Loading…</p>}><UseContent/></Suspense>; }
