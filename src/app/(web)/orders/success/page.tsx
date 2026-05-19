// app/orders/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const reference = searchParams.get('reference');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference && !orderId) {
                setError("No payment reference found");
                setIsVerifying(false);
                return;
            }

            try {
                const response = await securityAxios.get(
                    `${endpoints.orders.verifyPayment}?reference=${reference}&order_id=${orderId}`
                );

                if (response.data.success) {
                    setOrder(response.data.data?.order);
                } else {
                    setError(response.data.message || "Payment verification failed");
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to verify payment");
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [reference, orderId]);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we confirm your order.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/orders">View My Orders</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/cart">Return to Cart</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                    Thank you for your order. Your payment has been confirmed.
                </p>
                {order && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm font-medium">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-500">Total: ${order.total?.toFixed(2)}</p>
                    </div>
                )}
                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href={`/orders/${orderId || order?.id}`}>View Order Details</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { XCircle } from 'lucide-react';