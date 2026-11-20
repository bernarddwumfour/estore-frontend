import { endpoints } from '@/constants/endpoints/endpoints';
import api from '@/axios-instances/SecurityAxios';

export type Slot = { key: string; label: string; type: 'text' | 'image'; default_value: string; required: boolean };
export type Template = { id: string; name: string; description: string; type: 'text' | 'image'; status: 'draft' | 'active' | 'archived'; revision: number; content: { text?: string; width?: number; height?: number; json?: Record<string, unknown> }; slots: Slot[]; category_ids: string[]; updated_at?: string; groups?: { id: string; name: string }[] };
export type Category = { id: string; name: string; description: string; is_active: boolean };
export type Group = { id: string; name: string; description: string; status: string; revision: number; template_ids: string[] };
export type Instance = { id: string; name: string; snapshot: Template; values: Record<string, string>; revision: number; updated_at?: string; batch_id?: string; group_name?: string };
export const base = endpoints.templates.adminBase;
export async function allRecords<T>(kind: string, params: Record<string, string> = {}): Promise<T[]> {
  const result: T[] = [];
  let page = 1;
  while (true) {
    const data = (await api.get(`${base}/${kind}`, { params: { ...params, page, limit: 100 } })).data.data;
    result.push(...data[kind]);
    if (page >= data.pagination.total_pages) return result;
    page++;
  }
}
export async function uploadAsset(file: File | Blob): Promise<string> {
  const form = new FormData(); form.append('image', file, file instanceof File ? file.name : 'image.png');
  return (await api.post(`${base}/assets`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data.asset.url;
}
export async function persistImages(value: unknown): Promise<unknown> {
  if (Array.isArray(value)) return Promise.all(value.map(persistImages));
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = key === 'src' && typeof item === 'string' && /^(data:|blob:)/.test(item)
        ? await uploadAsset(await (await fetch(item)).blob()) : await persistImages(item);
    }
    return result;
  }
  return value;
}
// Upgrade the prototype's name-based slots once. Layer names are independent afterwards.
export function upgradeCanvas(json: Record<string, unknown>): Slot[] {
  const slots = new Map<string, Slot>();
  const visit = (objects: Record<string, unknown>[]) => objects.forEach(object => {
    const name = typeof object.name === 'string' ? object.name : '';
    const image = name.startsWith('image-slot:') || object.templateSlotType === 'image';
    const legacy = image ? name.replace('image-slot:', '') : String(object.type).toLowerCase() === 'textbox' ? name : '';
    const raw = object.templateSlot === undefined ? legacy : String(object.templateSlot || '');
    const key = raw.replace(/[^A-Za-z0-9_]/g, '_').replace(/^[^A-Za-z]+/, '');
    if (key) {
      object.templateSlot = key; object.templateSlotType = image ? 'image' : 'text';
      slots.set(key, { key, label: key.replaceAll('_', ' '), type: image ? 'image' : 'text', default_value: image ? '' : String(object.text ?? ''), required: false });
    }
    if (Array.isArray(object.objects)) visit(object.objects);
  });
  visit((json.objects ?? []) as Record<string, unknown>[]);
  return [...slots.values()];
}
