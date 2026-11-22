import 'server-only';
import { cookies } from 'next/headers';
import { sessionCookieName } from '@/lib/auth/cookie';

export const sessionCookie = sessionCookieName();

export function backendUrl(path: string) {
  const base = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error('DJANGO_API_URL is required');
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function bffHeaders(session?: string) {
  const secret = process.env.BFF_SHARED_SECRET;
  if (!secret) throw new Error('BFF_SHARED_SECRET is required');
  const headers = new Headers({ 'X-BFF-Key': secret });
  if (session) headers.set('X-BFF-Session', session);
  return headers;
}

/** Private SSR requests share session authentication with browser route handlers. */
export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const session = (await cookies()).get(sessionCookie)?.value;
  if (!session) return new Response(null, { status: 401 });
  const headers = bffHeaders(session);
  new Headers(init.headers).forEach((value, key) => {
    if (!['authorization', 'cookie', 'x-bff-key', 'x-bff-session'].includes(key)) headers.set(key, value);
  });
  return fetch(backendUrl(path), { ...init, headers, cache: 'no-store', redirect: 'error' });
}
