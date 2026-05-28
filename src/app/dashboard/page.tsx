'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DateRangePicker } from '@/widgets/DatePicker/DateRangePicker';
import { addDays } from 'date-fns';
import ProductsAnalyticsPage from './products/analytics/page';
import OrdersAnalyticsPage from './orders/analytics/page';
import UsersAnalyticsPage from './users/analytics/page';

export default function DashboardAnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Analytics data refreshed');
  };

  // Note: Since the child components have their own date pickers,
  // we're not passing dateRange down. If you want a global date picker,
  // you'd need to modify the child components to accept dateRange as a prop.

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive insights into products, orders, and users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw size={16} />
            Refresh All
          </Button>
        </div>
      </div> */}

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-900/50">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200"
          >
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductsAnalyticsPage />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrdersAnalyticsPage />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersAnalyticsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}