"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Cart from "@/widgets/cart/Cart";
import { SearchModal } from "@/widgets/search-modal/SearchModal";
import { useCartStore } from "@/app/lib/store/cart-store";
import styles from "../beauty.module.css";

const links = [
  { label: "Home", href: "/" },
  { label: "Our story", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Offers", href: "/promotions" },
  { label: "Journal", href: "/blog" },
  { label: "The ritual", href: "/#the-ritual" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartopen, setcartopen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const count = useCartStore(s => s.hasHydrated ? s.getTotalItems() : 0);

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <span className={styles.brandNote}>EVERYDAY CARE. EXTRAORDINARY YOU.</span>
        <Link href="/" aria-label="Velux home" className={styles.logo}>velux<span>®</span></Link>
        <Link href="/#the-ritual" className={styles.brandNote}>A LITTLE RITUAL, JUST FOR YOU ↗</Link>
      </div>
      <nav aria-label="Main navigation" className={styles.nav}>
        <Link href="/products" className={styles.navCaption}>SKINCARE, CONSIDERED.</Link>
        <div className={styles.desktopLinks}>
          {links.map(link => <Link key={link.label} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
        </div>
        <div className={styles.navActions}>
          <button aria-label="Search products" onClick={() => setSearchOpen(true)}><Search size={17} strokeWidth={1.4} /></button>
          <Link href="/profile" aria-label="Your account"><UserRound size={17} strokeWidth={1.4} /></Link>
          <button aria-label={`Open shopping bag, ${count} items`} onClick={() => setcartopen(true)}><ShoppingBag size={17} strokeWidth={1.4} />{count > 0 && <span className={styles.cartCount}>{count}</span>}</button>
          <button className={styles.menuToggle} aria-expanded={menuOpen} aria-controls="beauty-mobile-nav" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </nav>
      {menuOpen && <nav id="beauty-mobile-nav" aria-label="Mobile navigation" className={styles.mobileLinks}>{links.map(link => <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav>}
      <div className={styles.cartPanel}><Cart cartopen={cartopen} setcartopen={setcartopen} /></div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
