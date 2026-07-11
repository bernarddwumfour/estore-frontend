'use client';

export type RecentOrderState = {
  order: RecentOrder;
  isAuthenticated: boolean;
  source: 'checkout' | 'payment_callback' | 'payment_success';
  createdAt: string;
};

export type RecentOrderItem = {
  id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type RecentOrder = {
  id?: string;
  order_number?: string;
  status?: string;
  status_display?: string;
  payment_status_display?: string;
  discount_code?: string | null;
  customer_email?: string;
  created_at?: string;
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  total?: number;
  items?: RecentOrderItem[];
};

const RECENT_ORDER_STORAGE_KEY = 'latest_order_confirmation';

export function storeRecentOrder(data: RecentOrderState): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(RECENT_ORDER_STORAGE_KEY, JSON.stringify(data));
}

export function getRecentOrder(): RecentOrderState | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.sessionStorage.getItem(RECENT_ORDER_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as RecentOrderState;
  } catch {
    return null;
  }
}

export function clearRecentOrder(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(RECENT_ORDER_STORAGE_KEY);
}
