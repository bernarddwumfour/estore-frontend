// types/analytics.ts

export interface AnalyticsCard {
    id: string;
    name: string;
    value: number | string;
    unit: string;
    critical: boolean;
}

export interface ChartDataPoint {
    [key: string]: string | number | null;
}

export interface ChartConfig {
    title: string;
    description: string;
    type: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'radar';
    data: ChartDataPoint[];
    config: Record<string, {
        label: string;
        color?: string;
    }>;
}

export interface AnalyticsData {
    cards: AnalyticsCard[];
    charts: Record<string, ChartConfig>;
    summary?: {
        total_products: number;
        total_variants: number;
        total_stock: number;
        inventory_value: number;
        completion_rate: number;
    };
}

export interface AnalyticsResponse {
    success: boolean;
    data: AnalyticsData;
    message: string;
}