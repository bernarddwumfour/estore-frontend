import Link from "next/link";
import { Instagram, ArrowUpRight } from "lucide-react";

const explore = [
  { label: "Shop all", href: "/products" },
  { label: "New arrivals", href: "/products?sort_by=newest" },
  { label: "Our story", href: "/about" },
  { label: "Journal", href: "/blog" },
];

export default function Footer() {
  return (
    <footer className="bg-[#24211f] text-[#f7f4ef]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:py-16">
        <div>
          <Link href="/" className="text-2xl font-semibold tracking-[0.18em]">VELORA<span className="text-[#c5a47c]">.</span></Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">Considered pieces for the way you move through every day. Designed to wear, made to keep.</p>
          <a href="https://instagram.com" className="mt-5 inline-flex items-center gap-2 text-xs text-[#d8c3a7] hover:text-white"><Instagram className="h-4 w-4" /> Follow along <ArrowUpRight className="h-3 w-3" /></a>
        </div>
        <div><h2 className="text-[9px] uppercase tracking-[0.2em] text-[#c5a47c]">Explore</h2><div className="mt-4 grid gap-3 text-sm text-white/65">{explore.map((item) => <Link key={item.label} href={item.href} className="hover:text-white">{item.label}</Link>)}</div></div>
        <div><h2 className="text-[9px] uppercase tracking-[0.2em] text-[#c5a47c]">Legal</h2><div className="mt-4 grid gap-3 text-sm text-white/65"><Link href="/privacy-policy" className="hover:text-white">Privacy policy</Link><Link href="/terms-and-conditions" className="hover:text-white">Terms and conditions</Link><Link href="/return-policy" className="hover:text-white">Return policy</Link></div></div>
        <div><h2 className="text-[9px] uppercase tracking-[0.2em] text-[#c5a47c]">A note from Velora</h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">New edits, thoughtful styling and first access to each collection, delivered occasionally.</p><div className="mt-4 flex border-b border-white/35"><label htmlFor="velora-email" className="sr-only">Email address</label><input id="velora-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/45" /><button type="button" className="px-2 text-[9px] uppercase tracking-[0.14em] text-[#d8c3a7] hover:text-white">Join</button></div></div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-[9px] tracking-[0.1em] text-white/45">© {new Date().getFullYear()} VELORA · Accra, Ghana</div>
    </footer>
  );
}
