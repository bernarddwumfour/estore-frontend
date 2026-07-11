'use client';

import { useQuery } from '@tanstack/react-query';
import securityAxios from '@/axios-instances/SecurityAxios';
import { endpoints } from '@/constants/endpoints/endpoints';

const fetchConfig = async (): Promise<{ mode: 'test' | 'live' }> => {
    const response = await securityAxios.get(endpoints.social.adminConfig);
    return response.data.data;
};

export function TestModeBadge() {
    const { data: config } = useQuery({
        queryKey: ['social-config'],
        queryFn: fetchConfig,
        retry: false,
    });
    if (config?.mode !== 'test') return null;
    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300">
            Test mode
        </span>
    );
}
