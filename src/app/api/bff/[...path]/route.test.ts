import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn() }));
import { GET, POST } from './route';
import { sessionCookie } from '@/lib/server/backend';

const fetchMock = vi.fn();
const ctx = (path: string) => ({ params: Promise.resolve({ path: path.split('/') }) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
function request(path: string, method = 'GET', cookie = '', body?: BodyInit) {
  return new NextRequest(`https://shop.test/api/bff/${path}`, { method, body,
    headers: { origin: 'https://shop.test', 'x-estore-csrf': '1',
      ...(cookie ? { cookie: `${sessionCookie}=${cookie}` } : {}),
      'authorization': 'Bearer browser-controlled', 'x-bff-key': 'browser-controlled' },
  });
}
beforeEach(() => {
  vi.stubEnv('DJANGO_API_URL', 'https://api.test/api');
  vi.stubEnv('BFF_SHARED_SECRET', 'server-only-secret');
  vi.stubEnv('BFF_ORIGIN', 'https://shop.test');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('BFF route', () => {
  it('sets an HttpOnly session cookie and strips credentials at login', async () => {
    fetchMock.mockResolvedValue(json({ success: true, data: { session_id: 'random-session', user: { id: '1' }, tokens: { refresh_token: 'secret' } } }));
    const response = await POST(request('users/login', 'POST', '', '{}'), ctx('users/login'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { user: { id: '1' } } });
    const cookie = response.cookies.get(sessionCookie);
    expect(cookie?.value).toBe('random-session');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('x-bff-key')).toBe('server-only-secret');
    expect(headers.has('authorization')).toBe(false);
    expect(headers.has('cookie')).toBe(false);
  });
  it('forwards session credentials only to the configured backend', async () => {
    fetchMock.mockResolvedValue(json({ success: true, data: { id: '1' } }));
    await GET(request('users/profile', 'GET', 'opaque'), ctx('users/profile'));
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/users/profile');
    expect(fetchMock.mock.calls[0][1].headers.get('x-bff-session')).toBe('opaque');
    expect(fetchMock.mock.calls[0][1].cache).toBe('no-store');
  });
  it('blocks CSRF before contacting Django', async () => {
    const req = request('users/logout', 'POST', 'opaque', '{}');
    req.headers.set('origin', 'https://evil.test');
    expect((await POST(req, ctx('users/logout'))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('preserves multipart bytes and boundaries', async () => {
    fetchMock.mockResolvedValue(json({ success: true }));
    const req = request('products/admin/products', 'POST', 'opaque', '--boundary\r\nfile bytes');
    req.headers.set('content-type', 'multipart/form-data; boundary=boundary');
    await POST(req, ctx('products/admin/products'));
    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.get('content-type')).toBe('multipart/form-data; boundary=boundary');
    expect(new TextDecoder().decode(options.body)).toBe('--boundary\r\nfile bytes');
  });
  it('streams SSE without JSON buffering', async () => {
    fetchMock.mockResolvedValue(new Response('event: inbox.changed\n\n', { headers: { 'content-type': 'text/event-stream' } }));
    const response = await GET(request('social/admin/inbox/events', 'GET', 'opaque'), ctx('social/admin/inbox/events'));
    expect(response.headers.get('content-type')).toBe('text/event-stream');
    expect(await response.text()).toBe('event: inbox.changed\n\n');
  });
  it('clears the cookie even when logout finds an already-expired session', async () => {
    fetchMock.mockResolvedValue(json({ success: false }, 401));
    const response = await POST(request('users/logout', 'POST', 'expired', '{}'), ctx('users/logout'));
    expect(response.status).toBe(200);
    expect(response.cookies.get(sessionCookie)?.maxAge).toBe(0);
  });
  it('does not clear sessions on network failures or unrelated 401 responses', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const response = await GET(request('users/profile', 'GET', 'opaque'), ctx('users/profile'));
    expect(response.status).toBe(503);
    expect(response.cookies.has(sessionCookie)).toBe(false);
    fetchMock.mockResolvedValueOnce(json({ success: false }, 401));
    const expired = await GET(request('users/profile', 'GET', 'opaque'), ctx('users/profile'));
    expect(expired.cookies.has(sessionCookie)).toBe(false);
  });
  it('does not attach expired sessions to public password recovery requests', async () => {
    fetchMock.mockResolvedValue(json({ success: true }));
    await POST(request('users/password-reset/request', 'POST', 'expired', '{}'), ctx('users/password-reset/request'));
    expect(fetchMock.mock.calls[0][1].headers.has('x-bff-session')).toBe(false);
  });
  it('fails closed if a successful legacy login does not create a BFF session', async () => {
    fetchMock.mockResolvedValue(json({ success: true, data: { tokens: { access_token: 'secret' } } }));
    const response = await POST(request('users/login', 'POST', '', '{}'), ctx('users/login'));
    expect(response.status).toBe(502);
    expect(response.cookies.has(sessionCookie)).toBe(false);
  });
  it('normalizes assistant routes after Next.js removes the trailing slash', async () => {
    fetchMock.mockResolvedValue(json({ success: true }));
    await POST(request('assistant/chat', 'POST', 'opaque', '{}'), ctx('assistant/chat'));
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/assistant/chat/');
  });
  it('does not expose Django debug HTML or embedded request credentials', async () => {
    fetchMock.mockResolvedValue(new Response('debug SECRET headers', { status: 500, headers: { 'content-type': 'text/html' } }));
    const response = await GET(request('users/profile', 'GET', 'opaque'), ctx('users/profile'));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('SECRET');
  });
  it('never forwards upstream cookies or redirects', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://evil.test', 'set-cookie': 'secret=token' } }));
    const response = await GET(request('users/profile', 'GET', 'opaque'), ctx('users/profile'));
    expect(response.status).toBe(502);
    expect(response.headers.has('location')).toBe(false);
    expect(response.headers.has('set-cookie')).toBe(false);
  });
});
