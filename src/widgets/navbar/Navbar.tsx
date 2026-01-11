"use client"

import { useState } from "react"
import Link from "next/link"
import { Handbag, Heart, LayoutDashboard, LogIn, LogOut, Mail, Menu, Phone, ShoppingCart, User, User2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Cart from "../cart/Cart"
import { useCartStore } from "@/app/lib/store/cart-store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/use-auth"

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartopen, setcartopen] = useState(false)
    const totalItems = useCartStore((state) => state.getTotalItems())
    const { user, logout } = useAuth();


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
                            {user?.id ? (
                                <>
                                    {user?.role !=="customer" && <Button
                                        className="hidden md:block"
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <Link className="py-2" href="/dashboard">Dashboard</Link>
                                    </Button>}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="rounded-full" size="icon">
                                                <User />
                                                <span className="sr-only">My Account</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-[1002] min-w-[200px]"
                                        >


                                            <DropdownMenuItem asChild className="cursor-pointer py-1">
                                                <Link href={"/orders"}>
                                                    <div className="flex w-full justify-between gap-6 items-center py-2">
                                                        <p>Orders</p>
                                                        <Handbag size={16} />
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild className="cursor-pointer py-1">
                                                <Link href={"/wishlist"}>
                                                    <div className="flex w-full justify-between gap-6 items-center py-2">
                                                        <p>WishList</p>
                                                        <Heart size={16} />
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild className="cursor-pointer py-1">
                                                <Link href={"/profile"}>
                                                    <div className="flex w-full justify-between gap-6 items-center py-2">
                                                        <p>Profile</p>
                                                        <User2 size={16} />
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>


                                            <DropdownMenuItem>
                                                <Link href={"/profile"}>
                                                    <div>
                                                        <p>{`${user?.first_name} ${user?.last_name}`}</p>
                                                        <span className="text-xs text-gray-500">{`${user?.role}`}</span>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>


                                            <DropdownMenuItem className="cursor-pointer py-1" onClick={() => logout()}>
                                                <LogOut />
                                                Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" asChild className="hidden lg:flex p-4">
                                        <Link href="/login">
                                            <User className="h-4 w-4 mr-1" />
                                            Login
                                        </Link>
                                    </Button>
                                </>
                            )}

                            {!user?.id && <Button size="sm" variant={"outline"} onClick={() => setMobileMenuOpen(false)} asChild className="p-[1.15rem] lg:hidden bg-transparent">
                                <Link href="/login">
                                    <LogIn className="h-5 w-5 mr-1" />
                                </Link>
                            </Button>}



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
                                className="md:hidden p-2 hover:bg-accent rounded-md"
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
                        <Link onClick={() => setMobileMenuOpen(false)} href="/" className="block text-base  hover:text-blue-600 py-3 ">
                            Home
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/products" className="block text-base  hover:text-blue-600 py-3 ">
                            Products
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/about" className="block text-base  hover:text-blue-600 py-3 ">
                            About
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/contact" className="block text-base  hover:text-blue-600 py-3 ">
                            Contact
                        </Link>
                        <Link onClick={() => setMobileMenuOpen(false)} href="/blog" className="block text-base  hover:text-blue-600 py-3 ">
                            Blog
                        </Link>
                        <div className="pt-4 space-y-2">

                            {user?.role !=="customer" && <Button onClick={() => setMobileMenuOpen(false)} variant="outline" asChild className="w-full justify-start bg-transparent py-6">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                            </Button>}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
