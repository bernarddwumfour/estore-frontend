import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, bffHeaders, sessionCookie } from '@/lib/server/backend';
import { stripCredentials, validMutation, validPath } from '@/lib/server/bff-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const loginPaths = new Set(['users/login', 'users/staff-login']);
const publicAuthPaths = new Set(['users/register/customer', 'users/resend-verification', 'users/validate-verification-token']);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!validPath(path)) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  if (!validMutation(request)) return NextResponse.json({ success: false, message: 'Invalid request origin' }, { status: 403 });
  const route = path.join('/');
  const login = loginPaths.has(route);
  const logout = route === 'users/logout';
  const guest = request.headers.get("x-estore-guest") === "1"
    || publicAuthPaths.has(route) || route.startsWith('users/password-reset/')
    || route.startsWith('users/verify-email/');
  const session = guest ? undefined : request.cookies.get(sessionCookie)?.value;
  try {
    const headers = bffHeaders(login ? undefined : session);
    for (const name of ['content-type', 'accept']) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    // Configure only a header overwritten by your deployment's trusted ingress.
    const ipHeader = process.env.BFF_CLIENT_IP_HEADER || (process.env.VERCEL ? 'x-vercel-forwarded-for' : undefined);
    const clientIp = ipHeader ? request.headers.get(ipHeader)?.split(',')[0].trim() : undefined;
    if (clientIp) headers.set('X-BFF-Client-IP', clientIp);
    // Django's assistant routes require a slash; other app routes omit it.
    const trailing = path[0] === 'assistant' ? '/' : '';
    const upstream = await fetch(backendUrl(route + trailing) + request.nextUrl.search, {
      method: request.method, headers, cache: 'no-store', redirect: 'manual',
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      signal: request.signal,
    });
    // Never forward upstream redirects, cookies, or authentication headers.
    if (upstream.status >= 300 && upstream.status < 400) {
      return NextResponse.json({ success: false, message: 'Unexpected API redirect' }, { status: 502 });
    }
    if (upstream.headers.get('content-type')?.includes('text/html') ||
        (!upstream.ok && !upstream.headers.get('content-type')?.includes('application/json'))) {
      return NextResponse.json({ success: false, message: 'API request failed' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
    const responseHeaders = new Headers({ 'Cache-Control': 'no-store', 'Vary': 'Cookie' });
    for (const name of ['content-type', 'content-disposition', 'retry-after', 'x-accel-buffering']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    let response: NextResponse;
    if (upstream.headers.get('content-type')?.includes('application/json')) {
      const data = await upstream.json();
      if (login && upstream.ok && typeof data.data?.session_id !== 'string') {
        return NextResponse.json({ success: false, message: 'Session service unavailable' }, { status: 502 });
      }
      response = logout && upstream.status === 401
        ? NextResponse.json({ success: true, message: 'Logged out successfully' }, { headers: responseHeaders })
        : NextResponse.json(stripCredentials(data), { status: upstream.status, headers: responseHeaders });
      if (login && upstream.ok && typeof data.data?.session_id === 'string') {
        // End the previous browser session when switching accounts.
        if (session) {
          const oldHeaders = bffHeaders(session);
          oldHeaders.set('content-type', 'application/json');
          await fetch(backendUrl('users/logout'), { method: 'POST', headers: oldHeaders, body: '{}', cache: 'no-store', redirect: 'error' });
        }
        response.cookies.set(sessionCookie, data.data.session_id, {
          httpOnly: true, secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
        });
      }
    } else {
      response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
    }
    if ((logout && (upstream.ok || upstream.status === 401))) {
      response.cookies.set(sessionCookie, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    }
    response.cookies.set('auth_data', '', { path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Service temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as HEAD };
