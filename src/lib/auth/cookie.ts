// Cookies are scoped by host, not port; distinguish local storefront previews.
export function sessionCookieName() {
  const store = (process.env.NEXT_PUBLIC_STORE || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  const prefix = process.env.NODE_ENV === 'production' ? '__Host-' : '';
  return `${prefix}estore_${store}_session`;
}
