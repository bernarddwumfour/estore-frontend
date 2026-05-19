// services/analytics.service.ts
import securityAxios from "@/axios-instances/SecurityAxios";
import { AnalyticsData, AnalyticsResponse } from "@/components/analytics/types";
import { endpoints } from "@/constants/endpoints/endpoints";

class AnalyticsService {
    private cache: Map<string, { data: AnalyticsData; timestamp: number }> = new Map();
    private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getProductAnalytics(
        chartType?: string,
        refresh: boolean = false
    ): Promise<AnalyticsResponse> {
        const cacheKey = `product_analytics_${chartType || 'all'}`;

        // Check cache
        if (!refresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return { success: true, data: cached.data, message: "Cached data" };
            }
        }

        try {
            const params = new URLSearchParams();
            if (chartType) params.append('chart_type', chartType);
            if (refresh) params.append('refresh', 'true');

            const url = `${endpoints.products.analytics}${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await securityAxios.get(url);

            // Cache the response
            this.cache.set(cacheKey, {
                data: response.data.data,
                timestamp: Date.now()
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching product analytics:", error);
            throw error;
        }
    }

    // Clear cache for specific or all analytics
    clearCache(chartType?: string) {
        if (chartType) {
            this.cache.delete(`product_analytics_${chartType}`);
        } else {
            // Clear all product analytics cache
            for (const key of this.cache.keys()) {
                if (key.startsWith('product_analytics_')) {
                    this.cache.delete(key);
                }
            }
        }
    }
}

export const analyticsService = new AnalyticsService();