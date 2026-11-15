'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';

type Review = { action: 'book' | 'cancel'; details: { service: string; option: string; starts_at: string; duration_minutes?: number; pricing_type: string; price: string | null; customer_name: string; customer_phone: string } };

export default function AppointmentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const url = `/assistant/appointments/${id}/review/`;
  const review = useQuery({ queryKey: ['appointment-review', id], queryFn: async () => (await securityAxios.get(url)).data.data as Review, retry: false });
  const confirmation = useMutation({ mutationFn: async () => (await securityAxios.post(url)).data.data });
  if (confirmation.isSuccess) return <main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-2xl font-semibold">{review.data?.action === 'cancel' ? 'Appointment cancelled' : 'Appointment requested'}</h1><p className="mt-4">{review.data?.action === 'book' ? 'Your request is pending confirmation by the store.' : 'Your appointment has been cancelled.'}</p></main>;
  if (review.isLoading) return <main className="mx-auto max-w-xl px-6 py-16">Loading review…</main>;
  if (!review.data) return <main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-xl font-semibold">Review unavailable</h1><p className="mt-3">Sign in with the account that prepared this review. If it has expired, ask the assistant to prepare another.</p></main>;
  const {action, details} = review.data;
  return <main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-2xl font-semibold">{action === 'book' ? 'Review appointment' : 'Review cancellation'}</h1><div className="mt-6 space-y-3 rounded-lg border p-5"><p><strong>Service:</strong> {details.service} · {details.option}</p><p><strong>Time:</strong> {new Date(details.starts_at).toLocaleString()}</p>{details.duration_minutes && <p><strong>Duration:</strong> {details.duration_minutes} minutes</p>}<p><strong>Price:</strong> {details.pricing_type === 'quote' ? 'Quote required' : `${details.pricing_type === 'from' ? 'From ' : ''}${details.price}`}</p><p><strong>Contact:</strong> {details.customer_name} · {details.customer_phone}</p></div><p className="my-4 text-sm text-muted-foreground">{action === 'book' ? 'The store will review your request. The time is checked again when you confirm.' : 'Confirm to cancel this appointment.'}</p>{confirmation.isError && <p role="alert" className="mb-4 text-red-600">Could not confirm. The review may have expired or the time may no longer be available.</p>}<Button disabled={confirmation.isPending} onClick={() => confirmation.mutate()}>{confirmation.isPending ? 'Please wait…' : action === 'book' ? 'Request appointment' : 'Confirm cancellation'}</Button></main>;
}
