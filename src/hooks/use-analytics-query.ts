import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import securityAxios from '@/axios-instances/SecurityAxios';

/**
 * Shared analytics data-fetching hook — collapses the
 * `useQuery({ queryKey, queryFn: () => securityAxios.get(endpoint, { params }).then(res => res.data.data) })`
 * pattern previously duplicated ~26 times across the dashboard analytics pages,
 * with no staleTime and isError never read.
 */
export function useAnalyticsQuery<T = any>(
    queryKey: unknown[],
    endpoint: string,
    params?: Record<string, unknown>,
): UseQueryResult<T> {
    return useQuery<T>({
        queryKey,
        queryFn: () => securityAxios.get(endpoint, { params }).then((res) => res.data.data),
        staleTime: 60_000,
    });
}
