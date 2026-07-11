'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsAnalyticsPage from './products/analytics/page';
import OrdersAnalyticsPage from './orders/analytics/page';
import UsersAnalyticsPage from './users/analytics/page';

export default function DashboardAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Each analytics tab renders its own header with a RefreshButton */}
      {/* Tabs for different analytics views */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-900/50">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 dark:hover:text-gray-300"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 dark:hover:text-gray-300"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-gray-200 dark:hover:text-gray-300"
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