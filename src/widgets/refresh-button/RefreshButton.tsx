'use client';

import { useState } from 'react';
import { useIsFetching, type QueryKey } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface RefreshButtonProps {
    /** Kicks off the refresh — usually react-query's refetch. The button stays
     * disabled (icon spinning) until the returned promise settles, and the
     * toast fires only after the API has actually responded. */
    onRefresh: () => Promise<unknown>;
    successMessage?: string;
    errorMessage?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    /** Scope the background-fetch indicator to specific queries. When omitted,
     * any in-flight query (filter change, invalidation after a mutation, …)
     * puts the button in its loading state — no toast, just the spinner. */
    queryKey?: QueryKey;
}

export default function RefreshButton({
    onRefresh,
    successMessage = 'Data refreshed',
    errorMessage = 'Failed to refresh',
    label = 'Refresh',
    className = 'gap-2',
    disabled = false,
    queryKey,
}: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Also reflect background refetches (filter changes, invalidations after
    // mutations) so the button spins whenever fresh data is on its way.
    const fetchingCount = useIsFetching(queryKey ? { queryKey } : undefined);
    const isBusy = isRefreshing || fetchingCount > 0;

    const handleClick = async () => {
        setIsRefreshing(true);
        try {
            const result = await onRefresh();
            // react-query's refetch resolves (never throws) — surface its error state
            const failed =
                !!result &&
                typeof result === 'object' &&
                'isError' in result &&
                (result as { isError: boolean }).isError;
            if (failed) {
                toast.error(errorMessage);
            } else {
                toast.success(successMessage);
            }
        } catch {
            toast.error(errorMessage);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            disabled={disabled || isBusy}
            className={className}
        >
            <RefreshCw size={16} className={isBusy ? 'animate-spin' : ''} />
            {label}
        </Button>
    );
}
