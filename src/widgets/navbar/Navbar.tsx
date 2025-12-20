"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, LayoutDashboard, Mail, Menu, Phone, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Cart from "../cart/Cart"
import { useCartStore } from "@/app/lib/store/cart-store"

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartopen, setcartopen] = useState(false)
    const totalItems = useCartStore((state) => state.getTotalItems())

    return (
        <header className="fixed top-0 lef-0 z-100 w-full">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <div className="flex items-center gap-4">
                            <a href="tel:+1234567890" className="flex items-center gap-1.5 hover:opacity-90">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">+1-234-567-890</span>
                            </a>
                            <a href="mailto:hello@shop.com" className="flex items-center gap-1.5 hover:opacity-90">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">hello@shop.com</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            <span>Special Offer: 20% Off Sitewide!</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="bg-background  shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                                S
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                ShopHub
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/" className="text-sm  hover:text-blue-600 transition-colors">
                                Home
                            </Link>
                            <Link href="/about" className="text-sm  hover:text-blue-600 transition-colors">
                                About
                            </Link>
                            <Link href="/products" className="text-sm  hover:text-blue-600 transition-colors">
                                Products
                            </Link>
                            <Link href="/contact" className="text-sm  hover:text-blue-600 transition-colors">
                                Contact
                            </Link>
                            <Link href="/blog" className="text-sm  hover:text-blue-600 transition-colors">
                                Blog
                            </Link>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <Button size="sm" asChild className="hidden lg:flex p-4">
                                <Link href="/login">
                                    <User className="h-4 w-4 mr-1" />
                                    Login
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="hidden px-8 lg:flex">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4 mr-1" />
                                    Dashboard
                                </Link>
                            </Button>

                            <div className="relative">
                                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white relative" onClick={() => setcartopen((prev) => !prev)}>
                                    <ShoppingCart className="h-4 w-4 mr-1" />

                                </Button>

                                <Cart cartopen={cartopen} setcartopen={setcartopen} />
                                {totalItems > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {totalItems}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-accent rounded-md ml-2"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={cn(
                        "md:hidden border-t bg-card overflow-hidden transition-all",
                        mobileMenuOpen ? "max-h-[500px]" : "max-h-0",
                    )}
                >
                    <div className="container mx-auto px-4 py-6 space-y-1">
                        <Link href="/" className="block text-base  hover:text-blue-600 py-3 ">
                            Home
                        </Link>
                        <Link href="/about" className="block text-base  hover:text-blue-600 py-3 ">
                            About
                        </Link>
                        <Link href="/contact" className="block text-base  hover:text-blue-600 py-3 ">
                            Contact
                        </Link>
                        <Link href="/blog" className="block text-base  hover:text-blue-600 py-3 ">
                            Blog
                        </Link>
                        <div className="pt-4 space-y-2">
                            <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                                <Link href="/login">
                                    <User className="h-4 w-4 mr-2" />
                                    Login
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
