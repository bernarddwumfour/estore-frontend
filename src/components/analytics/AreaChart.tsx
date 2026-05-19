// components/analytics/AreaChart.tsx
"use client";

import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AreaChartProps {
    title: string;
    description?: string;
    data: any[];
    config: Record<string, { label: string; color?: string }>;
    dataKey: string;
    xAxisKey?: string;
    height?: number;
}

export function AreaChart({
    title,
    description,
    data,
    config,
    dataKey,
    xAxisKey = "month",
    height = 300,
}: AreaChartProps) {
    const chartConfig = {
        [dataKey]: config[dataKey] || { label: title, color: "hsl(var(--chart-1))" },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={`h-[${height}px] w-full`}>
                    <RechartsAreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={chartConfig[dataKey].color}
                            fill={chartConfig[dataKey].color}
                            fillOpacity={0.3}
                        />
                    </RechartsAreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}