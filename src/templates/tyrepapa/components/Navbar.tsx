"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Cart from "@/widgets/cart/Cart";
import { SearchModal } from "@/widgets/search-modal/SearchModal";
import { useCartStore } from "@/app/lib/store/cart-store";
import { useAuth } from "@/lib/use-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BrandLogo from "./BrandLogo";
import styles from "../tyrepapa.module.css";

const links = [
  { label: "Home", href: "/" },
  { label: "Tyres", href: "/products" },
  { label: "Our story", href: "/about" },
  { label: "Promotions", href: "/promotions" },
  { label: "Blogs", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartopen, setcartopen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const count = useCartStore(s => s.hasHydrated ? s.getTotalItems() : 0);
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <span className={styles.brandNote}>THE RIGHT TYRES FOR THE ROAD AHEAD.</span>
        <BrandLogo />
        <span className={styles.brandNote}>EVERY JOURNEY STARTS HERE.</span>
      </div>
      <nav aria-label="Main navigation" className={styles.nav}>
        <Link href="/products" className={styles.navCaption}>TYRES, MADE SIMPLE.</Link>
        <div className={styles.desktopLinks}>
          {links.map(link => <Link key={link.label} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
        </div>
        <div className={styles.navActions}>
          <button aria-label="Search products" onClick={() => setSearchOpen(true)}><Search size={17} strokeWidth={1.4} /></button>
          <Link href="/wishlist" aria-label="Wishlist" aria-current={pathname === "/wishlist" ? "page" : undefined}><Heart size={17} strokeWidth={1.4} /></Link>
          {user?.id ? <DropdownMenu>
            <DropdownMenuTrigger asChild><button aria-label="Your account"><UserRound size={17} strokeWidth={1.4} /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className={`${styles.accountMenu} z-[102] rounded-none`}>
              <div className={styles.accountMenuHeading}><span>YOUR ACCOUNT</span><strong>{[user.first_name, user.last_name].filter(Boolean).join(" ") || "Welcome back"}</strong></div>
              {user.role !== "customer" && <DropdownMenuItem asChild className={styles.accountMenuItem}><Link href="/dashboard"><LayoutDashboard size={16} /> Dashboard</Link></DropdownMenuItem>}
              <DropdownMenuItem asChild className={styles.accountMenuItem}><Link href="/orders"><Package size={16} /> Orders</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className={styles.accountMenuItem}><Link href="/wishlist"><Heart size={16} /> Wishlist</Link></DropdownMenuItem>
              {user.is_affiliate && <DropdownMenuItem asChild className={styles.accountMenuItem}><Link href="/affiliate"><BadgePercent size={16} /> Affiliate earnings</Link></DropdownMenuItem>}
              <DropdownMenuItem asChild className={styles.accountMenuItem}><Link href="/profile"><UserRound size={16} /> Profile</Link></DropdownMenuItem>
              <DropdownMenuItem className={`${styles.accountMenuItem} ${styles.accountMenuLogout}`} onSelect={() => logout()}><LogOut size={16} /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> : <Link href="/login" aria-label="Log in to your account"><UserRound size={17} strokeWidth={1.4} /></Link>}
          <button aria-label={`Open cart, ${count} items`} onClick={() => setcartopen(true)}><ShoppingBag size={17} strokeWidth={1.4} />{count > 0 && <span className={styles.cartCount}>{count}</span>}</button>
          <button className={styles.menuToggle} aria-expanded={menuOpen} aria-controls="tyrepapa-mobile-nav" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </nav>
      {menuOpen && <nav id="tyrepapa-mobile-nav" aria-label="Mobile navigation" className={styles.mobileLinks}>{links.map(link => <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav>}
      <div className={styles.cartPanel}><Cart cartopen={cartopen} setcartopen={setcartopen} /></div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} variant="header-panel" panelClassName={styles.searchPanel} />
    </header>
  );
}
