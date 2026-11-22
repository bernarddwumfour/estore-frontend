import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api, router } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn() },
  router: { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() },
}));
vi.mock('@/axios-instances/SecurityAxios', () => ({ default: api }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { AuthProvider } from './auth-provider';
import { useAuth } from '@/lib/use-auth';
function Probe() {
  const auth = useAuth();
  return <><span>{auth.status}:{auth.user?.email}</span>
    <button onClick={() => auth.login('new@example.test', 'password')}>Login</button>
    <button onClick={() => auth.logout()}>Logout</button></>;
}
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
  return client;
}
beforeEach(() => { vi.clearAllMocks(); });
describe('BFF authentication state', () => {
  it('restores a user without exposing token state and removes the legacy cookie', async () => {
    document.cookie = 'auth_data=legacy-secret;path=/';
    api.get.mockResolvedValue({ data: { data: { email: 'user@example.test' } } });
    setup();
    expect(await screen.findByText('authenticated:user@example.test')).toBeInTheDocument();
    expect(document.cookie).not.toContain('auth_data=');
  });
  it('distinguishes an unavailable backend from an anonymous session', async () => {
    api.get.mockRejectedValue({ response: { status: 503 } });
    setup();
    expect(await screen.findByText('error:')).toBeInTheDocument();
  });
  it('clears private query data on logout', async () => {
    api.get.mockResolvedValue({ data: { data: { email: 'user@example.test' } } });
    api.post.mockResolvedValue({ data: { success: true } });
    const client = setup();
    await screen.findByText('authenticated:user@example.test');
    client.setQueryData(['private-orders'], [{ id: 'private-order' }]);
    fireEvent.click(screen.getByText('Logout'));
    await screen.findByText('unauthenticated:');
    expect(client.getQueryData(['private-orders'])).toBeUndefined();
  });
  it('does not let a delayed restoration overwrite a successful login', async () => {
    let resolveProfile!: (value: unknown) => void;
    api.get.mockReturnValue(new Promise(resolve => { resolveProfile = resolve; }));
    api.post.mockResolvedValue({ data: { success: true, data: { user: { email: 'new@example.test', email_verified: true } } } });
    setup();
    fireEvent.click(screen.getByText('Login'));
    await screen.findByText('authenticated:new@example.test');
    await act(async () => { resolveProfile({ data: { data: { email: 'old@example.test' } } }); });
    await waitFor(() => expect(screen.queryByText('authenticated:old@example.test')).not.toBeInTheDocument());
  });
});
