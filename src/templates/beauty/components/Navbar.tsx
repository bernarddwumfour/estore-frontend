"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Cart from "@/widgets/cart/Cart";
import { SearchModal } from "@/widgets/search-modal/SearchModal";
import searchPanelStyles from "@/widgets/search-modal/SearchPanel.module.css";
import { useCartStore } from "@/app/lib/store/cart-store";

const links = [
  { label: "Home", href: "/" },
  { label: "Treatments", href: "/#services" },
  { label: "Our story", href: "/about" },
  { label: "Shop skincare", href: "/products" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <>
      <div className="bg-[#30231d] px-4 py-2 text-center text-[10px] tracking-[0.18em] text-[#f5e9dc] sm:text-[11px]">
        A LITTLE TIME FOR YOURSELF · ACCRA, GHANA
      </div>
      <header className="relative z-50 border-b border-[#eee5dd] bg-[#fffdf9] text-[#30231d]">
        <nav className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-10" aria-label="Main navigation">
          <Link href="/" className="font-serif text-[25px] font-semibold tracking-[-0.06em]" aria-label="Reel Spa home">
            <span className="mr-2 inline-block align-middle text-[#9b5c40]">✳</span>Reel Spa
          </Link>
          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) => <Link key={link.label} href={link.href} className="text-[11px] uppercase tracking-[0.14em] text-[#5f5047] transition-colors hover:text-[#9b5c40]">{link.label}</Link>)}
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-full p-2.5 text-[#46362e] hover:bg-[#f4ece5]" aria-label="Search products" onClick={() => setSearchOpen(true)}><Search className="h-[18px] w-[18px]" /></button>
            <Link href="/profile" className="rounded-full p-2.5 text-[#46362e] hover:bg-[#f4ece5]" aria-label="My account"><UserRound className="h-[18px] w-[18px]" /></Link>
            <div className="relative">
              <button className="relative rounded-full p-2.5 text-[#46362e] hover:bg-[#f4ece5]" aria-label="Open cart" onClick={() => setCartOpen((open) => !open)}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9b5c40] px-1 text-[9px] font-semibold text-white">{totalItems}</span>}
              </button>
              <Cart cartopen={cartOpen} setcartopen={setCartOpen} />
            </div>
            <Link href="/contact" className="ml-2 hidden bg-[#92583e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#75432f] sm:inline-flex">Book a visit</Link>
            <button className="ml-1 rounded-full p-2.5 lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </nav>
        {menuOpen && <div className="absolute left-0 right-0 top-full border-t border-[#eee5dd] bg-[#fffdf9] px-5 py-4 shadow-lg lg:hidden">{links.map((link) => <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="block border-b border-[#eee5dd] py-3 text-xs uppercase tracking-[0.14em] last:border-0">{link.label}</Link>)}<Link href="/contact" onClick={() => setMenuOpen(false)} className="mt-4 inline-flex bg-[#92583e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Book a visit</Link></div>}
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} variant="header-panel" panelClassName={searchPanelStyles.beautyPanel} />
    </>
  );
}
