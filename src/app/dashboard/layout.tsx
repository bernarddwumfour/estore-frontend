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
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  {
    icon: Package,
    label: 'Products',
    isCollapsible: true,
    children: [
      { icon: Layers, label: 'Categories', href: '/dashboard/products/categories' },
      { icon: Package, label: 'All Products', href: '/dashboard/products' },
      { icon: Tag, label: 'Poduct Variants', href: '/dashboard/products/variants' },
    ]
  },
  {
    icon: ShoppingCart,
    label: 'Orders',
    isCollapsible: true,
    children: [
      { icon: ShoppingCart, label: 'All Orders', href: '/dashboard/orders' },
      { icon: Truck, label: 'Shipments', href: '/dashboard/orders/shipments' },
      { icon: DollarSign, label: 'transactions', href: '/dashboard/orders/transactions' },
    ]
  },
  {
    icon: Users,
    label: 'Users',
    isCollapsible: true,
    children: [
      { icon: ShieldCheck, label: 'Staff', href: '/dashboard/users/staff' },
      { icon: Users, label: 'Customers', href: '/dashboard/users' },
      { icon: ShieldCheck, label: 'Guests', href: '/dashboard/users/guests' },
      { icon: Users, label: 'Affiliates', href: '/dashboard/users/affiliates' },

    ]
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    isCollapsible: true,
    children: [
      { icon: Gift, label: 'Promotions', href: '/dashboard/marketing/promotions' },
      { icon: Mail, label: 'Email Campaigns', href: '/dashboard/marketing//email-campaigns' },
    ]
  },
  {
    icon: Store,
    label: 'Store Settings',
    isCollapsible: true,
    children: [
      { icon: Settings, label: 'General', href: '/dashboard/settings/general' },
      // { icon: CreditCard, label: 'Payment', href: '/dashboard/settings/payment' },
      // { icon: Truck, label: 'Shipping', href: '/dashboard/settings/shipping' },
      // { icon: FileText, label: 'Pages', href: '/dashboard/settings/pages' },
    ]
  },

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
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-48 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all duration-500 ease-in-out lg:translate-x-0",
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full items-center justify-center text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm"
        >
          <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={12} />
        </button>

        {/* Logo */}
        <div className={cn("p-6 transition-all duration-500", isCollapsed ? "px-0 flex justify-center" : "px-6")}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className={cn("font-black text-2xl tracking-tighter transition-all duration-300 text-black dark:text-white", isCollapsed ? "scale-75" : "")}>
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
                      isOpen && !isCollapsed
                        ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50',
                      isCollapsed ? "justify-center px-0" : "justify-between px-4"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon size={18} className={cn(
                        isOpen ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'
                      )} />
                      {!isCollapsed && <span>{link.label}</span>}
                    </div>
                    {!isCollapsed && <ChevronDown size={14} className={cn(
                      "transition-transform duration-200",
                      isOpen ? 'rotate-180 text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'
                    )} />}
                  </button>

                  {isOpen && !isCollapsed && (
                    <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-800 space-y-1 mt-1">
                      {link.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                            pathname === child.href
                              ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-900'
                              : 'text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                          )}
                        >
                          <child.icon size={14} className={cn(
                            pathname === child.href ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'
                          )} />
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
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50',
                  isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4"
                )}
              >
                <link.icon size={18} className={cn(
                  isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'
                )} />
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
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-500 border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-all w-80 shadow-sm">
                <Search size={14} className={searchQuery ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-600"} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search products, orders, customers..."
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full placeholder:text-gray-400 dark:placeholder:text-gray-600 text-black dark:text-white"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredNavLinks.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    {filteredNavLinks.map((result) => (
                      <Link
                        key={result.href}
                        href={result.href}
                        onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white">
                          <result.icon size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-black dark:text-white">{result.label}</p>
                          {result.parent && <p className="text-[9px] text-gray-400 dark:text-gray-600 uppercase tracking-tighter">In {result.parent}</p>}
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
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 relative text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-500" />
              ) : (
                <Moon size={18} className="text-gray-800 dark:text-gray-200" />
              )}
            </Button>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-all">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.first_name || 'Admin'}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 dark:text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-2 bg-white dark:bg-black">
                <DropdownMenuLabel className="text-xs font-medium text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                  <span className="block text-[10px] text-gray-500 dark:text-gray-500">{user?.role || 'Admin'}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-3 p-3 text-xs font-medium rounded-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-3 p-3 text-xs font-medium text-red-600 dark:text-red-400 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20">
                  <LogOut size={14} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className={cn(
          "p-8 px-10 mx-auto w-full relative",
          isCollapsed ? "max-w-[calc(100vw-100px)]" : "max-w-[calc(100vw-300px)]"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}