"use client";
// import Logo from "@/components/logo/Logo";
// import { ThemeToggle } from "@/components/theme-toggle";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
// import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/products",
      label: "products",
      active: pathname === "/products",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/blog",
      label: "Blog",
      active: pathname === "/blog",
    },
    {
      href: "/admin/scholarships/scholarships-analytics",
      label: "Dashboard",
      active: pathname === "/admin" || pathname.startsWith("/admin/"),
    },
  ];
//   const { user, logout } = useAuth();
  const { user, logout } = {user :{firstname:"Bernard",lastname:"Kusi",role:"Admin"},logout:()=>{}};

  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="">
          <nav className="flex  items-center justify-end space-x-2 p-2 z-[1000]">
            {/* <Logo size="medium" /> */}
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "transition-colors hover:text-foreground/80",
                      route.active ? "text-foreground" : "text-foreground/60"
                    )}
                    // onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
              {/* <ThemeToggle /> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User />
                    <span className="sr-only">My Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[1002] min-w-[200px]"
                >
                  <DropdownMenuItem>
                    <div>
                      <p>{`${user?.firstname} ${user?.lastname}`}</p>
                      <span className="text-xs text-gray-500">{`${user?.role}`}</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
          <div className="absolute left-4 top-4 z-[1001]">
            <SidebarTrigger className="-ml-1" />

            {/* <Navbar /> */}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-1 flex-col px-6">
              <div className="py-4 pb-6 flex flex-col gap-4 w-full top-0 left-0">
                <div className="px-0">
                  <h1 className="text-xl font-semibold  pb-3 text-primary">
                    {usePathname()
                      .split("/")
                      [usePathname().split("/").length - 1].charAt(0)
                      .toUpperCase() +
                      usePathname()
                        .split("/")
                        [usePathname().split("/").length - 1].slice(1)}
                  </h1>

                  <Breadcrumb className="">
                    <BreadcrumbList>
                      {usePathname()
                        .split("/")
                        .map((segment, index) => {
                          if (segment === "") return null;
                          if (index === usePathname().split("/").length - 1) {
                            return (
                              <BreadcrumbPage key={index}>
                                {segment.charAt(0).toUpperCase() +
                                  segment.slice(1)}
                              </BreadcrumbPage>
                            );
                            // return <BreadcrumbEllipsis key={index} />;
                          }
                          return (
                            <BreadcrumbItem key={index}>
                              <BreadcrumbLink asChild>
                                <Link href={`/admin/${segment}`}>
                                  {segment.charAt(0).toUpperCase() +
                                    segment.slice(1)}
                                </Link>
                              </BreadcrumbLink>
                              <BreadcrumbSeparator />
                            </BreadcrumbItem>
                          );
                        })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
