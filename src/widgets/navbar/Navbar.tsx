"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Instagram, User, Menu, X, Laptop, ShoppingBag, LayoutDashboard, LogOut, Handbag, User2, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import Cart from "../cart/Cart"
import { useCartStore } from "@/app/lib/store/cart-store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/use-auth"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartopen, setcartopen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    const totalItems = useCartStore((state) => state.getTotalItems())
    const { user, logout } = useAuth()

    // Handle background switch on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Close mobile menu when window resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Close mobile menu function
    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <header
            className={cn(
                "fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out",
                isScrolled
                    ? "bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm"
                    : "bg-transparent border-b border-transparent"
            )}
        >
            <nav className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - iPlug Branding */}
                    <Link href="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                            <Laptop className="h-4 w-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-950">
                            iPlug
                        </span>
                    </Link>

                    {/* Centered Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link href="/products" className="hover:text-slate-950 transition-colors">
                            Products
                        </Link>
                        <Link href="/about" className="hover:text-slate-950 transition-colors">
                            About Us
                        </Link>
                        <Link href="/services" className="hover:text-slate-950 transition-colors">
                            Our Services
                        </Link>
                        <Link href="/contact" className="hover:text-slate-950 transition-colors">
                            Contact Us
                        </Link>
                        <Link href="/blog" className="hover:text-slate-950 transition-colors">
                            Our Blog
                        </Link>
                    </div>

                    {/* Right Actions / Utilities Tray - Order: Search, Cart, Login, Menu */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search Icon - 1st */}
                        <button className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 transition-colors" aria-label="Search">
                            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                        {/* Cart Trigger - 2nd */}
                        <div className="relative">
                            <button
                                className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 transition-colors relative"
                                onClick={() => setcartopen((prev) => !prev)}
                                aria-label="Open Cart"
                            >
                                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[9px] font-bold text-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                            <Cart cartopen={cartopen} setcartopen={setcartopen} />
                        </div>

                        {/* Login/User Button - 3rd */}
                        {user?.id ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 transition-colors" aria-label="Account">
                                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-[102] min-w-[200px] mt-2">
                                    {user?.role !== "customer" && (
                                        <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href="/dashboard" className="flex items-center gap-2 py-2">
                                                <LayoutDashboard size={16} />
                                                <span>Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/orders" className="flex items-center justify-between py-2">
                                            <span>Orders</span>
                                            <Handbag size={16} />
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile" className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="font-medium text-sm">{`${user?.first_name} ${user?.last_name}`}</p>
                                                <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
                                            </div>
                                            <User2 size={16} />
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive py-2" onClick={() => logout()}>
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" onClick={closeMobileMenu}>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span className="hidden sm:inline">Login</span>
                                    <span className="sm:hidden">Login</span>
                                </Button>
                            </Link>
                        )}

                        {/* Instagram Icon - Hidden on mobile, shown on desktop */}
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hidden md:block p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 transition-colors">
                            <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                        </a>

                        {/* Mobile Menu Toggle - 4th (last on mobile, hidden on desktop) */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <div
                className={cn(
                    "md:hidden bg-white border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out",
                    mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
                )}
            >
                <div className="container mx-auto px-6 py-4 space-y-3 font-medium text-slate-600">
                    {/* Main navigation links - closes menu when clicked */}
                    <Link
                        onClick={closeMobileMenu}
                        href="/products"
                        className="block py-2 hover:text-slate-950 transition-colors"
                    >
                        Products
                    </Link>
                    <Link
                        onClick={closeMobileMenu}
                        href="/about"
                        className="block py-2 hover:text-slate-950 transition-colors"
                    >
                        About Us
                    </Link>
                    <Link
                        onClick={closeMobileMenu}
                        href="/services"
                        className="block py-2 hover:text-slate-950 transition-colors"
                    >
                        Our Services
                    </Link>
                    <Link
                        onClick={closeMobileMenu}
                        href="/contact"
                        className="block py-2 hover:text-slate-950 transition-colors"
                    >
                        Contact Us
                    </Link>
                    <Link
                        onClick={closeMobileMenu}
                        href="/blog"
                        className="block py-2 hover:text-slate-950 transition-colors"
                    >
                        Our Blog
                    </Link>

                    {/* Instagram link for mobile */}
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 py-2 hover:text-slate-950 transition-colors"
                        onClick={closeMobileMenu}
                    >
                        <Instagram className="h-5 w-5" />
                        Instagram
                    </a>

                    {/* Dashboard link for admin/staff users */}
                    {user?.role !== "customer" && user?.id && (
                        <div className="pt-2 border-t border-slate-100">
                            <Link
                                onClick={closeMobileMenu}
                                href="/dashboard"
                                className="flex items-center gap-2 py-2 text-slate-950 hover:text-slate-700 transition-colors"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}