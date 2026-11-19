'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PricingType, ServiceOption } from './types';

export type ServiceChoice = { id: string; title: string };
export type ListedServiceOption = ServiceOption & { service: ServiceChoice & { status?: string } };

type Props = {
  services?: ServiceChoice[];
  serviceId?: string;
  option?: ListedServiceOption;
  onCancel: () => void;
  onSaved: () => void;
};

export function ServiceOptionForm({ services = [], serviceId: initialServiceId, option, onCancel, onSaved }: Props) {
  const client = useQueryClient();
  const [serviceId, setServiceId] = useState(option?.service.id ?? initialServiceId ?? '');
  const [name, setName] = useState(option?.name ?? '');
  const [description, setDescription] = useState(option?.description ?? '');
  const [pricingType, setPricingType] = useState<PricingType>(option?.pricing_type ?? 'quote');
  const [price, setPrice] = useState(option?.price ?? '');
  const [duration, setDuration] = useState(option?.duration_minutes?.toString() ?? '');
  const [sortOrder, setSortOrder] = useState(String(option?.sort_order ?? 0));
  const [isDefault, setIsDefault] = useState(option?.is_default ?? false);
  const [isActive, setIsActive] = useState(option?.is_active ?? true);
  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(), description: description.trim(), pricing_type: pricingType,
        price: pricingType === 'quote' ? null : price,
        duration_minutes: duration ? Number(duration) : null,
        sort_order: Number(sortOrder), is_default: isDefault, is_active: isActive,
      };
      const url = `/services/admin/services/${serviceId}/options`;
      return option ? securityAxios.patch(`${url}/${option.id}`, payload) : securityAxios.post(url, payload);
    },
    onSuccess: () => {
      toast.success(option ? 'Option updated' : 'Option added');
      client.invalidateQueries({ queryKey: ['admin-service-options'] });
      client.invalidateQueries({ queryKey: ['admin-service', serviceId] });
      client.invalidateQueries({ queryKey: ['admin-services'] });
      onSaved();
    },
    onError: error => toast.error(apiMessage(error, option ? 'Could not update option' : 'Could not create option')),
  });

  return <form onSubmit={event => { event.preventDefault(); save.mutate(); }} className="space-y-4">
    {!option && !initialServiceId && <div className="space-y-1 text-sm font-medium"><span>Service *</span><Select value={serviceId} onValueChange={setServiceId}><SelectTrigger aria-label="Service" className="w-full"><SelectValue placeholder="Choose a service" /></SelectTrigger><SelectContent>{services.map(service => <SelectItem key={service.id} value={service.id}>{service.title}</SelectItem>)}</SelectContent></Select></div>}
    <label className="block space-y-1 text-sm font-medium">Option name *<Input required maxLength={120} value={name} onChange={event => setName(event.target.value)} /></label>
    <label className="block space-y-1 text-sm font-medium">Description<Input maxLength={300} value={description} onChange={event => setDescription(event.target.value)} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1 text-sm font-medium"><span>Pricing</span><Select value={pricingType} onValueChange={value => setPricingType(value as PricingType)}><SelectTrigger aria-label="Pricing" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quote">Quote required</SelectItem><SelectItem value="fixed">Fixed price</SelectItem><SelectItem value="from">Starting from</SelectItem></SelectContent></Select></div>{pricingType !== 'quote' && <label className="space-y-1 text-sm font-medium">Price *<Input required type="number" min={0} step="0.01" value={price} onChange={event => setPrice(event.target.value)} /></label>}</div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-medium">Duration (minutes)<Input type="number" min={1} value={duration} onChange={event => setDuration(event.target.value)} /></label><label className="space-y-1 text-sm font-medium">Display order<Input type="number" min={0} value={sortOrder} onChange={event => setSortOrder(event.target.value)} /></label></div>
    <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={isDefault} onChange={event => setIsDefault(event.target.checked)} />Default option</label><label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} />Active</label></div>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={!serviceId || !name.trim() || save.isPending}>{save.isPending ? 'Saving…' : option ? 'Save changes' : 'Create Option'}</Button></div>
  </form>;
}
