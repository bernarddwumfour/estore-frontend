import { describe, expect, it } from 'vitest';
import { stripCredentials, validMutation, validPath } from './bff-policy';

describe('BFF request boundaries', () => {
  it('rejects traversal, arbitrary upstreams and legacy refresh', () => {
    for (const path of [['https:', 'evil.test'], ['users', '..'], ['users', '%2e%2e'], ['users', 'a/b'], ['users', 'refresh-token']]) {
      expect(validPath(path)).toBe(false);
    }
    expect(validPath(['products', 'admin', 'products'])).toBe(true);
  });
  it('requires same-origin and the custom CSRF header for mutations', () => {
    const request = (origin?: string, csrf?: string) => new Request('https://shop.test/api/bff/users/login', {
      method: 'POST', headers: { ...(origin ? { origin } : {}), ...(csrf ? { 'x-estore-csrf': csrf } : {}) },
    });
    expect(validMutation(request('https://shop.test', '1'))).toBe(true);
    expect(validMutation(request('https://evil.test', '1'))).toBe(false);
    expect(validMutation(request('https://shop.test'))).toBe(false);
    expect(validMutation(request(undefined, '1'))).toBe(false);
  });
  it('does not expose credentials nested in API envelopes', () => {
    expect(stripCredentials({ data: { user: { id: '1' }, session_id: 'secret', tokens: { access_token: 'secret' } } }))
      .toEqual({ data: { user: { id: '1' } } });
    expect(stripCredentials({ confirmation_token: 'order-confirmation' })).toEqual({ confirmation_token: 'order-confirmation' });
  });
});
