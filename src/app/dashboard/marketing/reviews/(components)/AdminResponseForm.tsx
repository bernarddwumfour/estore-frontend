'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminResponseFormProps {
    initialResponse: string;
    onSubmit: (response: string) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export default function AdminResponseForm({
    initialResponse,
    onSubmit,
    isSubmitting,
    onCancel
}: AdminResponseFormProps) {
    const [response, setResponse] = useState(initialResponse);

    const handleSubmit = () => {
        if (!response.trim()) {
            toast.error('Please enter a response');
            return;
        }
        onSubmit(response);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Your Response
                </label>
                <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Thank you for your feedback... We appreciate your input and will work to improve."
                    rows={6}
                    className="border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This response will be visible to the customer and other users viewing this review.
                </p>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !response.trim()}
                    className="flex-1"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                        </>
                    ) : (
                        'Submit Response'
                    )}
                </Button>
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </div>
    );
}