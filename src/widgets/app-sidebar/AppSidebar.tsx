"use client";

import * as React from "react";
import {
  Award,
  BarChart2,
  ChartBar,
  Frame,
  Map,
  PieChart,
  Settings2,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "../logo/Logo";
import { NavMain } from "../nav-main/NavMain";

const data = {
  user: {
    name: "myScholarsHUB",
    email: "myscholarshub@gmail.com",
  },
  navMain: [
    {
      title: "Products",
      url: "#",
      icon: Award,
      isActive: true,
      items: [
        {
          title: "Product Analytics",
          url: "/dashboard/products/products-analytics",
        },
        {
          title: "Add Products",
          url: "/dashboard/products/add-products",
        },
        {
          title: "Products",
          url: "/dashboard/products",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: Award,
      isActive: true,
      items: [
        {
          title: "Orders Analytics",
          url: "/dashboard/orders/orders-analytics",
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Users Analytics",
          url: "/dashboard/users/users-analytics",
        },
        {
          title: "Add User",
          url: "/dashboard/users/add-user",
        },
        {
          title: "List Users",
          url: "/dashboard/users",
        },
      ],
    },
    {
      title: "Audit logs",
      url: "#",
      icon: ChartBar,
      isActive: true,
      items: [
        {
          title: "Orders logs",
          url: "/dashboard/orders-logs",
        },
        {
          title: "Analytics logs",
          url: "/dashboard/analytics-logs",
        },
        {
          title: "Product logs",
          url: "/dashboard/product-logs",
        },
        {
          title: "User Logs",
          url: "/dashboard/user-logs",
        },       
        {
          title: "Django Admin Logs",
          url: "/dashboard/django-dashboard-logs",
        },
      ],
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Recently Added",
    //       url: "#",
    //     },
    //   ],
    // },
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
      </SidebarContent>
     
    </Sidebar>
  );
}
