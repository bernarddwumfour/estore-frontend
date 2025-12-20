// app/old-page/page.tsx
import { redirect } from 'next/navigation';

export default function OldPage() {
  redirect('/dashboard/users');
}