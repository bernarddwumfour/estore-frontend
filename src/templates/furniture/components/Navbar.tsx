// Furniture store navbar — matches the furniture mockup (green announcement
// bar + white nav with the "Furniture." logo). Presentation is furniture
// specific; cart, auth, wishlist and search behaviour come from the SAME
// shared pieces the default store uses (cart-store, useAuth, Cart, SearchModal).
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  LayoutDashboard,
  Handbag,
  User2,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cart from "@/widgets/cart/Cart";
import { useCartStore } from "@/app/lib/store/cart-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/widgets/SearchModal/SearchModal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const socials = [
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { Icon: Linkedin, href: "https://linkedin.com", label: "Pinterest" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f4d2c] text-base font-black text-white">
        F
      </span>
      <span
        className={cn(
          "text-2xl font-black tracking-tight",
          light ? "text-white" : "text-[#2b2b22]"
        )}
      >
        Furniture<span className="text-[#f5b21a]">.</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartopen, setcartopen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const iconBtn =
    "p-2 text-[#2b2b22] transition-colors hover:text-[#3f4d2c]";

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#22401f] text-[#f6f3ec]">
        <div className="container mx-auto flex h-11 items-center justify-between gap-4 px-4 text-xs lg:px-8">
          <p className="hidden items-center gap-2 font-medium sm:flex">
            <Phone className="h-3.5 w-3.5" />
            Call Us : +123-456-789
          </p>
          <p className="flex-1 text-center font-medium sm:flex-none">
            Sign up and <span className="font-bold">GET 25% OFF</span> for your
            first order.{" "}
            <Link
              href="/signup"
              className="font-bold text-[#f5b21a] underline underline-offset-2"
            >
              Sign up now
            </Link>
          </p>
          <div className="hidden items-center gap-3 sm:flex">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5b21a] text-[#22401f] transition-transform hover:scale-110"
              >
                <Icon className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e7e1d3] bg-white">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            <Logo />

            {/* Desktop links */}
            <div className="hidden items-center gap-8 text-sm font-semibold text-[#2b2b22] lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-[#3f4d2c]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className={iconBtn}
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search products (Ctrl+K)"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <div className="relative">
                <button
                  className={cn(iconBtn, "relative")}
                  onClick={() => setcartopen((prev) => !prev)}
                  aria-label="Open Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3f4d2c] text-[9px] font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </button>
                <Cart cartopen={cartopen} setcartopen={setcartopen} />
              </div>

              {/* Account */}
              {user?.id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={iconBtn} aria-label="Account">
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-[102] mt-2 min-w-[200px]"
                  >
                    {user?.role !== "customer" && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 py-2"
                        >
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/orders"
                        className="flex items-center justify-between py-2"
                      >
                        <span>Orders</span>
                        <Handbag size={16} />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-1">
                      <Link href="/wishlist">
                        <div className="flex w-full items-center justify-between gap-6 py-2">
                          <p>WishList</p>
                          <Heart size={16} />
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/profile"
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{`${user?.first_name} ${user?.last_name}`}</p>
                          <span className="text-xs capitalize text-slate-400">
                            {user?.role}
                          </span>
                        </div>
                        <User2 size={16} />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer py-2 text-destructive focus:text-destructive"
                      onClick={() => logout()}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button
                    size="sm"
                    className="ml-1 hidden gap-2 rounded-full bg-[#3f4d2c] text-white hover:bg-[#33401f] sm:inline-flex"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(iconBtn, "lg:hidden")}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "overflow-hidden border-t border-[#e7e1d3] bg-white transition-all duration-300 ease-in-out lg:hidden",
            mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="container mx-auto space-y-1 px-6 py-4 text-sm font-semibold text-[#2b2b22]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                onClick={closeMobileMenu}
                href={link.href}
                className="block py-2 transition-colors hover:text-[#3f4d2c]"
              >
                {link.label}
              </Link>
            ))}
            {!user?.id && (
              <Link
                onClick={closeMobileMenu}
                href="/login"
                className="block py-2 text-[#3f4d2c]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
