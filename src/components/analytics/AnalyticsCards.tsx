// components/analytics/AnalyticsCards.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package,
    CheckCircle,
    FileText,
    Archive,
    Layers,
    Warehouse,
    AlertTriangle,
    XCircle,
    Star,
    Trophy,
    Sparkles,
    DollarSign,
    ShoppingBag,
    Users,
    TrendingUp,
} from "lucide-react";
import { AnalyticsCard } from "./types";

const iconMap: Record<string, any> = {
    total_products: Package,
    published_products: CheckCircle,
    draft_products: FileText,
    archived_products: Archive,
    total_variants: Layers,
    total_stock: Warehouse,
    low_stock_variants: AlertTriangle,
    out_of_stock: XCircle,
    featured_products: Star,
    bestseller_products: Trophy,
    new_products: Sparkles,
    inventory_value: DollarSign,
    total_orders: ShoppingBag,
    total_users: Users,
    avg_rating: Star,
    active_categories: Layers,
    products_without_variants: AlertTriangle,
    completion_rate: TrendingUp,
};

interface AnalyticsCardsProps {
    cards: AnalyticsCard[];
    isLoading?: boolean;
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function AnalyticsCards({ cards, isLoading, columns = 4 }: AnalyticsCardsProps) {
    if (isLoading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
                {Array.from({ length: columns * 2 }).map((_, i) => (
                    <Card key={i} className="relative">
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
        6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {cards.map((card) => {
                const Icon = iconMap[card.id] || Package;
                return (
                    <Card key={card.id} className="relative overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm font-medium">
                                    {card.name}
                                </CardDescription>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle
                                className={`text-2xl font-bold ${card.critical ? "text-destructive" : "text-foreground"
                                    }`}
                            >
                                {typeof card.value === 'number' && card.unit === '$'
                                    ? `$${card.value.toLocaleString()}`
                                    : card.value.toLocaleString()}
                                {card.unit && card.unit !== '$' && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        {card.unit}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {card.critical ? "⚠️ Needs attention" : "✓ Normal"}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}