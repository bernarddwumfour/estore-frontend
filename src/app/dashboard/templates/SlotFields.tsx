'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { Slot } from './api';

const inputClass = 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-800 dark:bg-black dark:text-white dark:placeholder:text-gray-600';

export default function SlotFields({
  slots,
  onChange,
  textOnly = false,
  onRename,
  onRemove,
  disabled = false,
}: {
  slots: Slot[];
  onChange: (slots: Slot[]) => void;
  textOnly?: boolean;
  onRename?: (old: string, next: string) => void;
  onRemove?: (key: string) => void;
  disabled?: boolean;
}) {
  const update = (index: number, values: Partial<Slot>) =>
    onChange(slots.map((slot, currentIndex) => currentIndex === index ? { ...slot, ...values } : slot));

  const addSlot = () => {
    let nextNumber = slots.length + 1;
    while (slots.some(slot => slot.key === `slot_${nextNumber}`)) nextNumber++;
    onChange([...slots, { key: `slot_${nextNumber}`, label: `Slot ${nextNumber}`, type: 'text', default_value: '', required: false }]);
  };

  const moveSlot = (index: number, direction: -1 | 1) => {
    const next = [...slots];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Slots</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Slots mark the content that can be changed when someone uses this template.</p>
        </div>
        <Button type="button" variant="outline" onClick={addSlot} disabled={disabled} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Add slot
        </Button>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No slots yet. Add a slot for content users should be able to change.
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={`${slot.key}-${index}`} className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Slot {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => { onRemove?.(slot.key); onChange(slots.filter((_, currentIndex) => currentIndex !== index)); }} className="gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slot key
                  <Input aria-label={`Slot ${index + 1} key`} value={slot.key} disabled={disabled} onChange={event => { onRename?.(slot.key, event.target.value); update(index, { key: event.target.value }); }} placeholder="headline" className={inputClass} />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Label
                  <Input value={slot.label} disabled={disabled} onChange={event => update(index, { label: event.target.value })} placeholder="Headline" className={inputClass} />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content type
                  <Select value={slot.type} disabled={disabled} onValueChange={type => update(index, { type: type as Slot['type'] })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
                      <SelectItem value="text">Text</SelectItem>
                      {!textOnly && <SelectItem value="image">Image</SelectItem>}
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default value
                  <Input value={slot.default_value} disabled={disabled} onChange={event => update(index, { default_value: event.target.value })} placeholder="Optional starting value" className={inputClass} />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3 dark:border-gray-800">
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Switch checked={slot.required} disabled={disabled} onCheckedChange={required => update(index, { required })} />
                  Required when using this template
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={index === 0 || disabled} onClick={() => moveSlot(index, -1)}>Move up</Button>
                  <Button type="button" variant="outline" size="sm" disabled={index === slots.length - 1 || disabled} onClick={() => moveSlot(index, 1)}>Move down</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
