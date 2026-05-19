// app/admin/layout.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  Tag,
  Layers,
  Archive,
  Truck,
  DollarSign,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Gift,
  MessageSquare,
  FileText,
  Store,
  Megaphone,
  Mail,
  Smartphone,
  LucideIcon
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/lib/use-auth';
import Logo from '@/widgets/logo/Logo';


// Navigation structure for e-commerce
const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  {
    icon: Package,
    label: 'Products',
    isCollapsible: true,
    children: [
      { icon: Package, label: 'All Products', href: '/dashboard/products' },
      { icon: Layers, label: 'Categories', href: '/dashboard/products/categories' },
      { icon: Tag, label: 'Discounts', href: '/dashboard/discounts' },
    ]
  },
  {
    icon: ShoppingCart,
    label: 'Orders',
    isCollapsible: true,
    children: [
      { icon: ShoppingCart, label: 'All Orders', href: '/dashboard/orders' },
      { icon: Truck, label: 'Shipments', href: '/dashboard/shipments' },
      { icon: DollarSign, label: 'Refunds', href: '/dashboard/refunds' },
    ]
  },
  {
    icon: Users,
    label: 'Customers',
    isCollapsible: true,
    children: [
      { icon: Users, label: 'All Customers', href: '/dashboard/customers' },
      { icon: MessageSquare, label: 'Reviews', href: '/dashboard/reviews' },
    ]
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    isCollapsible: true,
    children: [
      { icon: TrendingUp, label: 'Sales Analytics', href: '/dashboard/analytics/sales' },
      { icon: Users, label: 'Customer Analytics', href: '/dashboard/analytics/customers' },
      { icon: Package, label: 'Product Analytics', href: '/dashboard/analytics/products' },
    ]
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    isCollapsible: true,
    children: [
      { icon: Gift, label: 'Promotions', href: '/dashboard/promotions' },
      { icon: Mail, label: 'Email Campaigns', href: '/dashboard/email-campaigns' },
      { icon: Smartphone, label: 'Notifications', href: '/dashboard/notifications' },
    ]
  },
  {
    icon: Store,
    label: 'Store Settings',
    isCollapsible: true,
    children: [
      { icon: Settings, label: 'General', href: '/dashboard/settings/general' },
      { icon: CreditCard, label: 'Payment', href: '/dashboard/settings/payment' },
      { icon: Truck, label: 'Shipping', href: '/dashboard/settings/shipping' },
      { icon: FileText, label: 'Pages', href: '/dashboard/settings/pages' },
    ]
  },
  { icon: ShieldCheck, label: 'Staff', href: '/dashboard/staff' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // --- States ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['Products', 'Orders']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Flatten links for search
  const flatLinks = useMemo(() => {
    const links: { label: string; href: string; icon: LucideIcon; parent?: string }[] = [];
    SIDEBAR_LINKS.forEach(link => {
      if (link.children) {
        link.children.forEach(child => {
          links.push({
            label: child.label,
            href: child.href,
            icon: child.icon,
            parent: link.label
          });
        });
      } else {
        links.push({
          label: link.label,
          href: link.href as string,
          icon: link.icon
        });
      }
    });
    return links;
  }, []);

  // Filter search results
  const filteredNavLinks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return flatLinks.filter(link =>
      link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.parent && link.parent.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [searchQuery, flatLinks]);

  // Toggle collapsible menu
  const toggleMenu = (label: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex">
      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-48 bg-white dark:bg-[#111114] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out lg:translate-x-0",
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full items-center justify-center text-zinc-400 hover:text-gray-800 transition-all shadow-sm"
        >
          <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
        </button>

        {/* Logo */}
        <div className={cn("p-6 transition-all duration-500", isCollapsed ? "px-0 flex justify-center" : "px-6")}>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className={cn("font-black text-2xl tracking-tighter transition-all duration-300", isCollapsed ? "scale-75" : "")}>
              <div className="flex gap-3 items-center">
                <Logo />{!isCollapsed && <span>iPlug</span>}

              </div>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn("px-4 space-y-1 mt-4 transition-all duration-500", isCollapsed ? "px-2" : "px-4")}>
          {SIDEBAR_LINKS.map((link) => {
            const hasChildren = link.isCollapsible && link.children;
            const isOpen = openMenus.includes(link.label);
            const isActive = pathname === link.href;

            if (hasChildren) {
              return (
                <div key={link.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(link.label)}
                    className={cn(
                      "w-full flex items-center text-sm font-bold rounded-lg transition-all group py-2.5",
                      isOpen && !isCollapsed ? 'bg-zinc-50 dark:bg-white/5 text-gray-800' : 'text-zinc-500 hover:text-gray-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                      isCollapsed ? "justify-center px-0" : "justify-between px-4"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon size={18} />
                      {!isCollapsed && <span>{link.label}</span>}
                    </div>
                    {!isCollapsed && <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen ? 'rotate-180' : '')} />}
                  </button>

                  {isOpen && !isCollapsed && (
                    <div className="ml-4 pl-4 border-l border-zinc-100 dark:border-zinc-800 space-y-1 mt-1">
                      {link.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                            pathname === child.href ? 'text-gray-800 bg-gray-800/10' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                          )}
                        >
                          <child.icon size={14} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href as string}
                className={cn(
                  "flex items-center text-sm font-bold rounded-lg transition-all group py-2.5",
                  isActive ? 'bg-gray-800/10 text-gray-800' : 'text-zinc-500 hover:text-gray-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                  isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
                )}
              >
                <link.icon size={18} />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-500 ease-in-out",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        {/* HEADER */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-zinc-500 hover:text-gray-800"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 border border-transparent focus-within:border-gray-800/30 transition-all w-80 shadow-sm">
                <Search size={14} className={searchQuery ? "text-gray-800" : ""} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search products, orders, customers..."
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full placeholder:text-zinc-500"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredNavLinks.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    {filteredNavLinks.map((result) => (
                      <Link
                        key={result.href}
                        href={result.href}
                        onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-gray-800">
                          <result.icon size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold">{result.label}</p>
                          {result.parent && <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">In {result.parent}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-gray-800" />}
            </Button>

            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

            {/* User Dropdown - Simplified */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all">
                  <span className="text-sm font-medium">
                    {user?.first_name || 'Admin'}
                  </span>
                  <ChevronDown size={14} className="text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2 border-none shadow-2xl rounded-2xl p-2 dark:bg-[#111114]">
                <DropdownMenuLabel className="text-xs font-medium">
                  {user?.first_name} {user?.last_name}
                  <span className="block text-[10px] text-zinc-500">{user?.role || 'Admin'}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-3 p-3 text-xs font-medium rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-3 p-3 text-xs font-medium text-red-500 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20">
                  <LogOut size={14} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className={`p-8 px-10 mx-auto w-full relative ${isCollapsed ? " max-w-[calc(100vw-100px)]" : " max-w-[calc(100vw-300px)]"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}