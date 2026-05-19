// components/analytics/PieChart.tsx
"use client";

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PieChartProps {
    title: string;
    description?: string;
    data: any[];
    dataKey: string;
    nameKey: string;
    height?: number;
    innerRadius?: number;
    outerRadius?: number;
}

export function PieChart({
    title,
    description,
    data,
    dataKey,
    nameKey,
    height = 300,
    innerRadius = 0,
    outerRadius = 100,
}: PieChartProps) {
    const isDonut = innerRadius > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || `hsl(var(--chart-${index + 1}))`} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}