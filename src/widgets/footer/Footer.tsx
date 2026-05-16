import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-white text-slate-900 border-t border-slate-100 mt-auto">
            <div className="container mx-auto px-4 lg:px-8 py-16 ">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-sm tracking-tighter">
                                iP
                            </div>
                            <span className="text-xl font-black text-slate-950 tracking-tight">
                                iPlug
                            </span>
                        </Link>

                        <p className="text-xs sm:text-sm text-slate-500 max-w-sm font-medium leading-relaxed">
                            Your premier destination for verified new and pristine mint-condition Apple devices. Secure fulfillment with institutional pricing parameters.
                        </p>

                        <div className="flex gap-2 pt-1">
                            <a href="#" className="bg-[#f8f9fa] border border-slate-100 p-2 rounded-xl text-slate-500 hover:bg-[#f1f3f5] hover:text-slate-950 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="bg-[#f8f9fa] border border-slate-100 p-2 rounded-xl text-slate-500 hover:bg-[#f1f3f5] hover:text-slate-950 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="bg-[#f8f9fa] border border-slate-100 p-2 rounded-xl text-slate-500 hover:bg-[#f1f3f5] hover:text-slate-950 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="bg-[#f8f9fa] border border-slate-100 p-2 rounded-xl text-slate-500 hover:bg-[#f1f3f5] hover:text-slate-950 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-2 md:col-start-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Shop</h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-medium">
                            <li>
                                <Link href="/collections" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link href="/featured" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link href="/sale" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Sale
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Company</h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-medium">
                            <li>
                                <Link href="/about" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Legal</h4>
                        <ul className="space-y-3 text-xs sm:text-sm font-medium">
                            <li>
                                <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/return-policy" className="text-slate-500 hover:text-slate-950 transition-colors">
                                    Return policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Metadata Panel */}
                <div className="border-t border-slate-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] sm:text-xs text-slate-400 font-medium">
                    <p>&copy; {new Date().getFullYear()} iPlug. All rights reserved.</p>
                    <p className="tracking-tight">Crafted with precision and care</p>
                </div>
            </div>
        </footer>
    )
}