import Link from "next/link";
import { Instagram, MapPin, Phone, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#251c17] text-[#f7f1eb]">
      <div className="mx-auto grid max-w-[1160px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:px-10 md:py-16">
        <div>
          <Link href="/" className="font-serif text-2xl tracking-[-0.05em]"><span className="mr-2 text-[#c18a6d]">✳</span>Reel Spa</Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#c6b9af]">A thoughtful space to slow down, restore your glow and feel at home in your skin.</p>
          <a className="mt-5 inline-flex items-center gap-2 text-sm text-[#d8ae94]" href="https://instagram.com" aria-label="Reel Spa on Instagram"><Instagram className="h-4 w-4" /> Follow our rituals</a>
        </div>
        <div><h2 className="text-[10px] uppercase tracking-[0.2em] text-[#c18a6d]">Explore</h2><div className="mt-4 grid gap-3 text-sm text-[#c6b9af]"><Link href="/#services" className="hover:text-white">Treatments</Link><Link href="/products" className="hover:text-white">Skincare shop</Link><Link href="/about" className="hover:text-white">Our story</Link><Link href="/blog" className="hover:text-white">Journal</Link></div></div>
        <div><h2 className="text-[10px] uppercase tracking-[0.2em] text-[#c18a6d]">Visit us</h2><div className="mt-4 grid gap-3 text-sm leading-6 text-[#c6b9af]"><p className="flex gap-2"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#c18a6d]" />Accra, Ghana</p><p>Monday – Saturday<br />9:00 am – 7:00 pm</p></div></div>
        <div><h2 className="text-[10px] uppercase tracking-[0.2em] text-[#c18a6d]">Let’s talk</h2><a href="tel:+233000000000" className="mt-4 flex items-center gap-2 text-sm text-[#c6b9af] hover:text-white"><Phone className="h-4 w-4 text-[#c18a6d]" /> +233 (0) 00 000 0000</a><Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm text-[#d8ae94]">Plan your visit <Sparkles className="h-4 w-4" /></Link></div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-[10px] tracking-wide text-[#a9998e]">© {new Date().getFullYear()} Reel Spa · Made for moments of care</div>
    </footer>
  );
}
