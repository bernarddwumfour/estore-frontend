// app/(dashboard)/analytics/page.tsx
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { AlertMessage } from "@/widgets/alert-message/AlertMessage";
import AnalyticsLoader from "@/widgets/loaders/AnalyticsLoader";
import { AnalyticsCards } from "@/components/analytics/AnalyticsCards";
import { AreaChart } from "@/components/analytics/AreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "../../../services/analytics/service";

export default function AnalyticsDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["product-analytics", activeTab],
    queryFn: () => {
      const chartType = activeTab === "overview" ? undefined : activeTab;
      return analyticsService.getProductAnalytics(chartType);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      analyticsService.clearCache();
      await refetch();
      toast.success("Analytics refreshed");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      data: data?.data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported");
  };

  if (isLoading) return <AnalyticsLoader />;

  if (isError) {
    return (
      <AlertMessage
        variant="error"
        message={error?.message || "Failed to load analytics"}
      />
    );
  }

  const analytics = data?.data;
  const charts = analytics?.charts || {};
  const cards = analytics?.cards || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your store performance and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || isRefreshing}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsCards cards={cards.slice(0, 8)} isLoading={isLoading} columns={4} />

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly_trend">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="stock">Inventory</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* More Cards */}
          <AnalyticsCards cards={cards.slice(8, 16)} isLoading={isLoading} columns={4} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.monthly_trend && (
              <AreaChart
                title={charts.monthly_trend.title}
                description={charts.monthly_trend.description}
                data={charts.monthly_trend.data}
                config={charts.monthly_trend.config}
                dataKey="products"
              />
            )}

            {charts.categories && (
              <BarChart
                title={charts.categories.title}
                description={charts.categories.description}
                data={charts.categories.data}
                dataKey="products"
                xAxisKey="category"
                horizontal={true}
                colors={["hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.status_distribution && (
              <PieChart
                title={charts.status_distribution.title}
                description={charts.status_distribution.description}
                data={charts.status_distribution.data}
                dataKey="count"
                nameKey="status"
              />
            )}

            {charts.stock_distribution && (
              <PieChart
                title={charts.stock_distribution.title}
                description={charts.stock_distribution.description}
                data={charts.stock_distribution.data}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={100}
              />
            )}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="monthly_trend" className="space-y-6">
          {charts.monthly_trend && (
            <AreaChart
              title={charts.monthly_trend.title}
              description={charts.monthly_trend.description}
              data={charts.monthly_trend.data}
              config={charts.monthly_trend.config}
              dataKey="products"
              height={400}
            />
          )}

          {charts.weekly_activity && (
            <BarChart
              title={charts.weekly_activity.title}
              description={charts.weekly_activity.description}
              data={charts.weekly_activity.data}
              dataKey="created"
              xAxisKey="day"
            />
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {charts.categories && (
            <BarChart
              title={charts.categories.title}
              description={charts.categories.description}
              data={charts.categories.data}
              dataKey="products"
              xAxisKey="category"
              horizontal={true}
              height={500}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.product_flags && (
              <BarChart
                title={charts.product_flags.title}
                description={charts.product_flags.description}
                data={charts.product_flags.data}
                dataKey="count"
                xAxisKey="flag"
              />
            )}

            {charts.category_visibility && (
              <PieChart
                title={charts.category_visibility.title}
                description={charts.category_visibility.description}
                data={charts.category_visibility.data}
                dataKey="count"
                nameKey="status"
              />
            )}
          </div>
        </TabsContent>

        {/* Stock/Inventory Tab */}
        <TabsContent value="stock" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.stock_distribution && (
              <PieChart
                title={charts.stock_distribution.title}
                description={charts.stock_distribution.description}
                data={charts.stock_distribution.data}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={120}
              />
            )}

            {charts.top_products && (
              <BarChart
                title={charts.top_products.title}
                description={charts.top_products.description}
                data={charts.top_products.data}
                dataKey="value"
                xAxisKey="product"
                horizontal={true}
                height={400}
              />
            )}
          </div>

          {charts.rating_distribution && (
            <BarChart
              title={charts.rating_distribution.title}
              description={charts.rating_distribution.description}
              data={charts.rating_distribution.data}
              dataKey="count"
              xAxisKey="rating"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      {analytics?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{analytics.summary.total_products}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Variants</p>
                <p className="text-2xl font-bold">{analytics.summary.total_variants}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{analytics.summary.total_stock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${analytics.summary.inventory_value.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}