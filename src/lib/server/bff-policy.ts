const roots = new Set(['users', 'products', 'services', 'promotions', 'orders', 'common', 'marketing', 'templates', 'social', 'blog', 'assistant']);

export function validPath(parts: string[]) {
  return parts.length > 0 && roots.has(parts[0]) && parts.every(part =>
    /^[a-zA-Z0-9_@.+-]+$/.test(part) && part !== '.' && part !== '..'
  ) && !parts.includes('refresh-token');
}

/** Custom header forces a preflight; strict Origin checking disallows other origins. */
export function validMutation(request: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
  if (process.env.NODE_ENV === 'production' && !process.env.BFF_ORIGIN) return false;
  const origin = process.env.BFF_ORIGIN || new URL(request.url).origin;
  return request.headers.get('origin') === origin
    && request.headers.get('x-estore-csrf') === '1'
    && request.headers.get('sec-fetch-site') !== 'cross-site';
}

export function stripCredentials(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCredentials);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
      !['tokens', 'access_token', 'refresh_token', 'session_id'].includes(key)
    ).map(([key, entry]) => [key, stripCredentials(entry)]));
  }
  return value;
}
