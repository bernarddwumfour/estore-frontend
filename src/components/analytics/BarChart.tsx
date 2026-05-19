// components/analytics/BarChart.tsx
"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartProps {
    title: string;
    description?: string;
    data: any[];
    dataKey: string;
    xAxisKey: string;
    height?: number;
    horizontal?: boolean;
    colors?: string[];
}

export function BarChart({
    title,
    description,
    data,
    dataKey,
    xAxisKey,
    height = 300,
    horizontal = false,
    colors = ["hsl(var(--chart-1))"],
}: BarChartProps) {
    const getBarColor = (_: any, index: number) => {
        return colors[index % colors.length];
    };

    if (horizontal) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={height}>
                        <RechartsBarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey={xAxisKey} width={150} />
                            <Tooltip />
                            <Bar dataKey={dataKey}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry, index)} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsBarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey={dataKey}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry, index)} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}