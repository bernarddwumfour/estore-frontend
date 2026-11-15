'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';

type Hours = { weekday: number; opens_at: string; closes_at: string };
type Settings = { enabled: boolean; timezone: string; slot_interval_minutes: number; hours: Hours[] };
type Exception = { date: string; is_closed: boolean; opens_at: string | null; closes_at: string | null };
type Appointment = { id: string; service: string; option: string; customer_name: string; customer_phone: string; starts_at: string; status: string; pricing_type: string; price: string | null };
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const base = '/services/admin';

export default function AppointmentsPage() {
  const client = useQueryClient();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [closedDate, setClosedDate] = useState('');
  const [special, setSpecial] = useState(false);
  const [opens, setOpens] = useState('09:00');
  const [closes, setCloses] = useState('17:00');
  const settingsQuery = useQuery({ queryKey: ['booking-settings'], queryFn: async () => (await securityAxios.get(`${base}/booking-settings`)).data.data as Settings });
  const exceptionQuery = useQuery({ queryKey: ['booking-exceptions'], queryFn: async () => (await securityAxios.get(`${base}/booking-exceptions`)).data.data.exceptions as Exception[] });
  const appointmentsQuery = useQuery({ queryKey: ['appointments'], queryFn: async () => (await securityAxios.get(`${base}/appointments`)).data.data.appointments as Appointment[] });
  const current = settings ?? settingsQuery.data;
  const mutation = useMutation({ mutationFn: async (action: () => Promise<unknown>) => action(), onSuccess: () => { toast.success('Changes saved'); client.invalidateQueries({queryKey: ['booking-settings']}); client.invalidateQueries({queryKey: ['booking-exceptions']}); client.invalidateQueries({queryKey: ['appointments']}); }, onError: () => toast.error('Could not save changes. Check your input and try again.') });
  const updateHours = (day: number, changes: Partial<Hours> | null) => {
    if (!current) return;
    const other = current.hours.filter(h => h.weekday !== day);
    setSettings({...current, hours: changes ? [...other, {...(current.hours.find(h => h.weekday === day) ?? {weekday: day, opens_at: '09:00', closes_at: '17:00'}), ...changes}] : other});
  };
  if (settingsQuery.isLoading || exceptionQuery.isLoading || appointmentsQuery.isLoading) return <div className="p-6">Loading appointments…</div>;
  if (!current || settingsQuery.isError || exceptionQuery.isError || appointmentsQuery.isError) return <div className="p-6">Unable to load appointment settings. Please refresh and try again.</div>;
  return <div className="space-y-8 p-6 max-w-6xl">
    <div><h1 className="text-2xl font-semibold">Appointments</h1><p className="text-sm text-muted-foreground">Manage availability and customer appointments. One appointment can take place at a time.</p></div>
    <section className="rounded-lg border bg-card p-5 space-y-4"><h2 className="text-lg font-semibold">Booking settings</h2>
      <label className="flex items-center gap-2"><input type="checkbox" checked={current.enabled} onChange={e => setSettings({...current, enabled: e.target.checked})} /> Enable bookings</label>
      <div className="flex flex-wrap gap-4"><label>Timezone <input className="ml-2 rounded border p-2" value={current.timezone} onChange={e => setSettings({...current, timezone: e.target.value})} /></label><label>Slot interval (minutes) <input className="ml-2 w-24 rounded border p-2" type="number" min="5" max="240" value={current.slot_interval_minutes} onChange={e => setSettings({...current, slot_interval_minutes: Number(e.target.value)})} /></label></div>
      <h3 className="font-medium">Weekly hours</h3>{days.map((day, index) => { const hours = current.hours.find(h => h.weekday === index); return <div key={day} className="flex flex-wrap items-center gap-3"><label className="w-32"><input type="checkbox" checked={!!hours} onChange={e => updateHours(index, e.target.checked ? {} : null)} /> {day}</label>{hours && <><input aria-label={`${day} opens`} className="rounded border p-1" type="time" value={hours.opens_at.slice(0,5)} onChange={e => updateHours(index, {opens_at: e.target.value})} /><span>to</span><input aria-label={`${day} closes`} className="rounded border p-1" type="time" value={hours.closes_at.slice(0,5)} onChange={e => updateHours(index, {closes_at: e.target.value})} /></>}</div>; })}
      <Button disabled={mutation.isPending} onClick={() => mutation.mutate(async () => { await securityAxios.put(`${base}/booking-settings`, current); setSettings(null); })}>Save settings</Button>
    </section>
    <section className="rounded-lg border bg-card p-5 space-y-4"><h2 className="text-lg font-semibold">Closed dates and special hours</h2><div className="flex flex-wrap items-center gap-3"><input aria-label="Exception date" type="date" className="rounded border p-2" value={closedDate} onChange={e => setClosedDate(e.target.value)} /><label><input type="checkbox" checked={special} onChange={e => setSpecial(e.target.checked)} /> Special hours</label>{special && <><input aria-label="Opens" type="time" value={opens} onChange={e => setOpens(e.target.value)} /><input aria-label="Closes" type="time" value={closes} onChange={e => setCloses(e.target.value)} /></>}<Button disabled={!closedDate || mutation.isPending} onClick={() => mutation.mutate(() => securityAxios.post(`${base}/booking-exceptions`, {date: closedDate, is_closed: !special, opens_at: opens, closes_at: closes}))}>Save date</Button></div>
      {exceptionQuery.data?.length ? exceptionQuery.data.map(e => <div key={e.date} className="flex items-center justify-between border-t py-2"><span>{e.date}: {e.is_closed ? 'Closed' : `${e.opens_at?.slice(0,5)}–${e.closes_at?.slice(0,5)}`}</span><Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate(() => securityAxios.delete(`${base}/booking-exceptions`, {data: {date: e.date}}))}>Remove</Button></div>) : <p className="text-sm text-muted-foreground">No exceptions configured.</p>}
    </section>
    <section className="rounded-lg border bg-card p-5 space-y-4"><h2 className="text-lg font-semibold">Customer appointments</h2>{appointmentsQuery.data?.length ? appointmentsQuery.data.map(a => <div className="flex flex-wrap items-center justify-between gap-3 border-t py-3" key={a.id}><div><p className="font-medium">{a.service} · {a.option}</p><p className="text-sm">{new Date(a.starts_at).toLocaleString(undefined, {timeZone: current.timezone})} · {a.status}</p><p className="text-sm text-muted-foreground">{a.customer_name} · {a.customer_phone} · {a.pricing_type === 'quote' ? 'Quote required' : `${a.pricing_type === 'from' ? 'From ' : ''}${a.price}`}</p></div><div className="flex gap-2">{a.status === 'pending' && <Button disabled={mutation.isPending} onClick={() => mutation.mutate(() => securityAxios.patch(`${base}/appointments/${a.id}`, {status:'confirmed'}))}>Confirm</Button>}{a.status === 'confirmed' && <Button disabled={mutation.isPending} onClick={() => mutation.mutate(() => securityAxios.patch(`${base}/appointments/${a.id}`, {status:'completed'}))}>Complete</Button>}{['pending','confirmed'].includes(a.status) && <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate(() => securityAxios.patch(`${base}/appointments/${a.id}`, {status:'cancelled'}))}>Cancel</Button>}</div></div>) : <p className="text-sm text-muted-foreground">No appointments yet.</p>}</section>
  </div>;
}
