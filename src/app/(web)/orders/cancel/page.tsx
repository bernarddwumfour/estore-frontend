// app/orders/cancel/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCancelPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
                <p className="text-gray-600 mb-6">
                    {error || "Your payment was cancelled or didn't complete successfully."}
                </p>
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