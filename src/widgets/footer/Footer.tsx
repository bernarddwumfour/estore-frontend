import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-zinc-800 text-zinc-100 border-t border-zinc-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Brand Column */}
                    <div className="md:col-span-4">
                        <Link href="/" className="flex items-center gap-2 py-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                                S
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                ShopHub
                            </span>
                        </Link>

                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            Premium quality products delivered to your doorstep. Excellence in every detail.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="bg-zinc-800 p-2 rounded-md hover:bg-zinc-700 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-zinc-800 p-2 rounded-md hover:bg-zinc-700 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-zinc-800 p-2 rounded-md hover:bg-zinc-700 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-zinc-800 p-2 rounded-md hover:bg-zinc-700 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-zinc-100">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/collections" className="text-zinc-400 hover:text-zinc-100">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link href="/featured" className="text-zinc-400 hover:text-zinc-100">
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link href="/sale" className="text-zinc-400 hover:text-zinc-100">
                                    Sale
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-zinc-100">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-zinc-400 hover:text-zinc-100">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-zinc-400 hover:text-zinc-100">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-zinc-400 hover:text-zinc-100">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-zinc-100">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/help" className="text-zinc-400 hover:text-zinc-100">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-zinc-400 hover:text-zinc-100">
                                    Shipping
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-zinc-400 hover:text-zinc-100">
                                    Returns
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-4 text-zinc-100">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy-policy" className="text-zinc-400 hover:text-zinc-100">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="text-zinc-400 hover:text-zinc-100">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/return-policy" className="text-zinc-400 hover:text-zinc-100">
                                    Return policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
                    <p>&copy; 2025 ELITESTORE. All rights reserved.</p>
                    <p>Crafted with precision and care</p>
                </div>
            </div>
        </footer>
    )
}
