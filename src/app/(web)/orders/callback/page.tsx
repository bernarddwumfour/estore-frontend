// app/orders/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;

    useEffect(() => {
        const processCallback = async () => {
            if (!paymentRef) {
                router.push('/orders/cancel?error=No payment reference found');
                return;
            }

            try {
                // Call your payment_callback endpoint
                const response = await securityAxios.get(
                    `${endpoints.orders.paymentCallback}?reference=${paymentRef}`
                );

                if (response.data.success) {
                    const orderId = response.data.data.order.id;
                    router.push(`/orders/success?order_id=${orderId}&reference=${paymentRef}`);
                } else {
                    router.push(`/orders/cancel?error=${response.data.message}`);
                }
            } catch (err: any) {
                console.error('Callback error:', err);
                router.push(`/orders/cancel?error=${err?.response?.data?.message || 'Payment processing failed'}`);
            }
        };

        processCallback();
    }, [paymentRef, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

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