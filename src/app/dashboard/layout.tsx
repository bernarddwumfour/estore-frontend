import { redirect } from 'next/navigation';
import { authenticatedFetch } from '@/lib/server/backend';
import { endpoints } from '@/constants/endpoints/endpoints';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const response = await authenticatedFetch(endpoints.auth.getProfile);
  if (response.status === 401) redirect('/admin/login');
  if (!response.ok) throw new Error('Unable to verify your session. Please retry.');
  const profile = await response.json();
  if (!['admin', 'staff'].includes(profile.data?.role)) redirect('/');
  return <DashboardShell>{children}</DashboardShell>;
}
