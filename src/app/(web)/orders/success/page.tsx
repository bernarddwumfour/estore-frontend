'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UnAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { getAuthCookie } from '@/lib/providers/auth-provider';
import { storeRecentOrder } from '@/lib/orders/recent-order';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !orderId) {
        setError('No payment reference found');
        return;
      }

      try {
        const response = await UnAuthenticatedAxios.get(
          `${endpoints.orders.verifyPayment}?reference=${reference}&order_id=${orderId}`
        );

        if (response.data.success && response.data.data?.order) {
          storeRecentOrder({
            order: response.data.data.order,
            isAuthenticated: !!getAuthCookie()?.tokens?.access_token,
            source: 'payment_success',
            createdAt: new Date().toISOString(),
          });

          const resolvedOrderId = response.data.data.order.id || orderId;
          router.replace(resolvedOrderId ? `/order-placed?order_id=${resolvedOrderId}` : '/order-placed');
          return;
        }

        setError(response.data.message || 'Payment verification failed');
      } catch (err: unknown) {
        const message =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : 'Failed to verify payment';
        setError(message || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [orderId, reference, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/cart">Return to Cart</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Finalizing your order...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your confirmation page.</p>
      </div>
    </div>
  );
}
