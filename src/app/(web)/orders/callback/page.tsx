// app/orders/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UnAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios';
import { endpoints } from '@/constants/endpoints/endpoints';
import { useAuth } from '@/lib/use-auth';
import { storeRecentOrder } from '@/lib/orders/recent-order';

export default function PaymentCallbackPage() {
  const { user, status: authStatus } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;

    useEffect(() => {
    if (authStatus === "loading") return;
        const processCallback = async () => {
            if (!paymentRef) {
                router.push('/orders/cancel?error=No payment reference found');
                return;
            }

            try {
                // Call your payment_callback endpoint
                const response = await UnAuthenticatedAxios.get(
                    `${endpoints.orders.paymentCallback}?reference=${paymentRef}`
                );

                if (response.data.success) {
                    const order = response.data.data.order;
                    const orderId = order.id;
                    storeRecentOrder({
                        order,
                        isAuthenticated: Boolean(user?.id),
                        source: 'payment_callback',
                        createdAt: new Date().toISOString(),
                    });
                    router.push(`/order-placed?order_id=${orderId}`);
                } else {
                    router.push(`/orders/cancel?error=${response.data.message}`);
                }
            } catch (err: unknown) {
                const message =
                    typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
                        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                        : 'Payment processing failed';
                console.error('Callback error:', err);
                router.push(`/orders/cancel?error=${message}`);
            }
        };

        processCallback();
    }, [paymentRef, router, user?.id, authStatus]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Processing your payment...</h2>
                <p className="text-gray-500 mt-2">Please wait while we confirm your order.</p>
            </div>
        </div>
    );
}
