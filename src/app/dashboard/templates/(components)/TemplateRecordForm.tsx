'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SlotFields from '../SlotFields';
import { base, type Template, type Category, type Group, type Slot } from '../api';

type Kind = 'templates' | 'categories' | 'groups';
type RecordItem = Template | Category | Group;

const schema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(120, 'Name must be 120 characters or fewer'),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer'),
});

const sectionClass = 'space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black';
const inputClass = 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-800 dark:bg-black dark:text-white dark:placeholder:text-gray-600';

export default function TemplateRecordForm({
  kind,
  record,
  categories,
  templates,
  onSaved,
  onCancel,
}: {
  kind: Kind;
  record?: RecordItem;
  categories: Category[];
  templates: Template[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const template = kind === 'templates' ? record as Template | undefined : undefined;
  const group = kind === 'groups' ? record as Group | undefined : undefined;
  const category = kind === 'categories' ? record as Category | undefined : undefined;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: record?.name ?? '', description: record?.description ?? '' },
  });
  const [status, setStatus] = useState(template?.status ?? group?.status ?? 'draft');
  const [active, setActive] = useState(category?.is_active ?? true);
  const [text, setText] = useState(template?.content?.text ?? '');
  const [slots, setSlots] = useState<Slot[]>(template?.slots ?? []);
  const [selected, setSelected] = useState<string[]>(
    kind === 'groups' ? group?.template_ids ?? [] : template?.category_ids ?? [],
  );

  const save = useMutation({
    mutationFn: () => {
      const data = {
        ...form.getValues(),
        ...(kind === 'categories' ? { is_active: active } : { status, revision: template?.revision ?? group?.revision }),
        ...(kind === 'templates' ? { type: 'text', content: { text }, slots, category_ids: selected } : {}),
        ...(kind === 'groups' ? { template_ids: selected } : {}),
      };
      return record
        ? api.patch(`${base}/${kind}/${record.id}`, data)
        : api.post(`${base}/${kind}`, data);
    },
    onSuccess: onSaved,
    onError: error => toast.error(apiMessage(error, 'Could not save changes')),
  });

  const toggleSelected = (id: string) => {
    setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  };
  const previewText = text.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) =>
    slots.find(slot => slot.key === key)?.default_value || match,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => save.mutate())} className="space-y-6">
        <section className={sectionClass}>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a clear name and details for this {kind === 'templates' ? 'template' : kind === 'categories' ? 'category' : 'group'}.</p>
          </div>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Name *</FormLabel>
              <FormControl><Input {...field} placeholder={kind === 'templates' ? 'e.g., New product announcement' : kind === 'categories' ? 'e.g., Promotions' : 'e.g., Social launch pack'} disabled={save.isPending} className={inputClass} /></FormControl>
              <FormDescription className="text-gray-500 dark:text-gray-400">This name helps you find and reuse it later.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
              <FormControl><Textarea {...field} placeholder="Add a short description…" disabled={save.isPending} className={`${inputClass} min-h-[100px]`} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </section>

        {kind !== 'categories' && (
          <section className={sectionClass}>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draft records stay private until you make them active.</p>
            </div>
            <div className="space-y-2">
              <FormLabel className="text-gray-700 dark:text-gray-300">Status</FormLabel>
              <Select value={status} onValueChange={value => setStatus(value as Template['status'])} disabled={save.isPending}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        )}

        {kind === 'categories' && (
          <section className={sectionClass}>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive categories are hidden when organizing templates.</p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-800">
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Active category</p><p className="text-sm text-gray-500 dark:text-gray-400">Allow this category to be assigned to templates.</p></div>
              <Switch checked={active} onCheckedChange={setActive} disabled={save.isPending} aria-label="Active category" />
            </div>
          </section>
        )}

        {kind === 'templates' && (
          <>
            <section className={sectionClass}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Content</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Write the reusable text and add slots for content that changes when the template is used.</p>
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">Text</FormLabel>
                <Textarea rows={7} value={text} onChange={event => setText(event.target.value)} disabled={save.isPending} placeholder="Write the template text…" className={`${inputClass} min-h-[140px] font-mono text-sm`} />
                <FormDescription className="text-gray-500 dark:text-gray-400">Use slots for names, dates, or other values users will fill in later.</FormDescription>
              </div>
              {slots.length > 0 && <div className="flex flex-wrap gap-2">{slots.map(slot => <Button type="button" size="sm" variant="outline" key={slot.key} disabled={save.isPending} onClick={() => setText(current => `${current}{{${slot.key}}}`)}>Insert {slot.label}</Button>)}</div>}
              <SlotFields slots={slots} onChange={setSlots} textOnly disabled={save.isPending} onRename={(oldKey, nextKey) => setText(current => current.replaceAll(`{{${oldKey}}}`, `{{${nextKey}}}`))} onRemove={key => setText(current => current.replaceAll(`{{${key}}}`, slots.find(slot => slot.key === key)?.default_value ?? ''))} />
              <div className="space-y-2">
                <FormLabel className="text-gray-700 dark:text-gray-300">Preview</FormLabel>
                <div className="min-h-24 whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">{previewText || <span className="text-gray-400">Your template preview will appear here.</span>}</div>
              </div>
            </section>

            <section className={sectionClass}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assign one or more categories to make this template easier to find.</p>
              </div>
              {categories.length ? <div className="grid gap-3 sm:grid-cols-2">{categories.map(item => (
                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                  <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelected(item.id)} disabled={save.isPending} />
                  <span>{item.name}</span>
                </label>
              ))}</div> : <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet. You can add categories later.</p>}
              {!!template?.groups?.length && <p className="text-sm text-gray-500 dark:text-gray-400">Used by: {template.groups.map(item => item.name).join(', ')}</p>}
            </section>
          </>
        )}

        {kind === 'groups' && (
          <section className={sectionClass}>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Templates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose templates for this group, then arrange their order. Each template keeps its own slots.</p>
            </div>
            {templates.length ? <div className="grid gap-3 sm:grid-cols-2">{templates.map(item => (
              <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelected(item.id)} disabled={save.isPending} />
                <span className="min-w-0"><span className="block truncate font-medium">{item.name}</span><span className="text-xs text-gray-500 dark:text-gray-400">{item.type} · {item.status}</span></span>
              </label>
            ))}</div> : <p className="text-sm text-gray-500 dark:text-gray-400">Create a template before adding it to a group.</p>}
            {selected.length > 0 && <div className="space-y-2"><FormLabel className="text-gray-700 dark:text-gray-300">Display order</FormLabel>{selected.map((id, index) => (
              <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800" key={id}>
                <span className="text-sm text-gray-700 dark:text-gray-300">{index + 1}. {templates.find(item => item.id === id)?.name ?? 'Template'}</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={index === 0 || save.isPending} onClick={() => setSelected(ids => { const next = [...ids]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>Move up</Button>
                  <Button type="button" size="sm" variant="outline" disabled={index === selected.length - 1 || save.isPending} onClick={() => setSelected(ids => { const next = [...ids]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })}>Move down</Button>
                </div>
              </div>
            ))}</div>}
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={() => { form.reset(); setText(template?.content?.text ?? ''); setSlots(template?.slots ?? []); setSelected(kind === 'groups' ? group?.template_ids ?? [] : template?.category_ids ?? []); setStatus(template?.status ?? group?.status ?? 'draft'); setActive(category?.is_active ?? true); }} disabled={save.isPending} className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800">Reset Form</Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending} className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
          <Button type="submit" disabled={save.isPending} className="min-w-[180px] bg-gray-900 text-white transition-colors hover:bg-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
            {save.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : record ? 'Save Changes' : `Create ${kind === 'templates' ? 'Template' : kind === 'categories' ? 'Category' : 'Group'}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
