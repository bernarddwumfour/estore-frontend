"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Cart from "@/widgets/cart/Cart";
import { SearchModal } from "@/widgets/search-modal/SearchModal";
import searchPanelStyles from "@/widgets/search-modal/SearchPanel.module.css";
import { useCartStore } from "@/app/lib/store/cart-store";

const links = [
  { label: "Collections", href: "/products" },
  { label: "Our story", href: "/about" },
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
      <div className="bg-[#24211f] px-4 py-2 text-center text-[9px] uppercase tracking-[0.18em] text-white sm:text-[10px]">
        Complimentary delivery on orders over GH₵ 1,000 · Accra, Ghana
      </div>
      <header className="relative z-50 border-b border-[#eee9e2] bg-[#fffdf9] text-[#24211f]">
        <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 lg:px-12" aria-label="Main navigation">
          <div className="hidden flex-1 items-center gap-7 lg:flex">
            {links.slice(0, 2).map((link) => <Link key={link.label} href={link.href} className="text-[10px] uppercase tracking-[0.13em] text-[#5f5953] transition-colors hover:text-[#ad8a60]">{link.label}</Link>)}
          </div>
          <Link href="/" className="whitespace-nowrap text-center text-[13px] font-semibold tracking-[0.1em] sm:text-[20px] sm:tracking-[0.14em] text-[#24211f]" aria-label="Amammre Wears home">AMAMMRE WEARS<span className="text-[#ad8a60]">.</span></Link>
          <div className="flex flex-1 items-center justify-end gap-1">
            <div className="mr-3 hidden items-center gap-7 lg:flex">{links.slice(2).map((link) => <Link key={link.label} href={link.href} className="text-[10px] uppercase tracking-[0.13em] text-[#5f5953] transition-colors hover:text-[#ad8a60]">{link.label}</Link>)}</div>
            <button className="rounded-full p-2.5 hover:bg-[#f3efe9]" aria-label="Search products" onClick={() => setSearchOpen(true)}><Search className="h-[18px] w-[18px]" /></button>
            <Link href="/profile" className="hidden rounded-full p-2.5 hover:bg-[#f3efe9] sm:inline-flex" aria-label="My account"><UserRound className="h-[18px] w-[18px]" /></Link>
            <div className="relative">
              <button className="relative rounded-full p-2.5 hover:bg-[#f3efe9]" aria-label="Open cart" onClick={() => setCartOpen((open) => !open)}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ad8a60] px-1 text-[9px] font-semibold text-white">{totalItems}</span>}
              </button>
              <Cart cartopen={cartOpen} setcartopen={setCartOpen} />
            </div>
            <button className="rounded-full p-2 lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {menuOpen && <div className="absolute left-0 right-0 top-full border-t border-[#eee9e2] bg-[#fffdf9] px-5 py-3 shadow-lg lg:hidden">{links.map((link) => <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="block border-b border-[#eee9e2] py-3 text-[10px] uppercase tracking-[0.14em] last:border-0">{link.label}</Link>)}</div>}
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} variant="header-panel" panelClassName={searchPanelStyles.fashionPanel} />
    </>
  );
}
