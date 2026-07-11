// Furniture store footer — matches the furniture mockup (deep-green body with
// four link columns + a gold copyright bar). Static presentation only.
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  ChevronDown,
} from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
      { label: "Career", href: "/career" },
    ],
  },
  {
    title: "Customer Services",
    links: [
      { label: "My Account", href: "/profile" },
      { label: "Track Your Order", href: "/orders" },
      { label: "Return", href: "/return-policy" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Our Information",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "User Terms & Condition", href: "/terms-and-conditions" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
];

const socials = [
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { Icon: Linkedin, href: "https://linkedin.com", label: "Pinterest" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#22401f] text-[#f6f3ec]">
      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5b21a] text-lg font-black text-[#22401f]">
              F
            </span>
            <span className="text-2xl font-black tracking-tight">
              Furniture<span className="text-[#f5b21a]">.</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#cdd6c4]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#f5b21a] hover:text-[#22401f]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-lg font-bold text-white">{col.title}</h4>
            <ul className="mt-5 space-y-3 text-sm text-[#cdd6c4]">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-[#f5b21a]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <h4 className="text-lg font-bold text-white">Contact Info</h4>
          <ul className="mt-5 space-y-4 text-sm text-[#cdd6c4]">
            <li>
              <a href="tel:+0123456789" className="hover:text-[#f5b21a]">
                +0123-456-789
              </a>
            </li>
            <li>
              <a
                href="mailto:example@gmail.com"
                className="hover:text-[#f5b21a]"
              >
                example@gmail.com
              </a>
            </li>
            <li className="leading-relaxed">
              8502 Preston Rd. Inglewood, Maine 98380
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#f5b21a] text-[#22401f]">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 text-sm font-medium sm:flex-row lg:px-8">
          <p>
            Copyright &copy; {new Date().getFullYear()} Furniture. All Rights
            Reserved.
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 font-semibold">
              English <ChevronDown className="h-4 w-4" />
            </button>
            <span className="opacity-50">|</span>
            <button className="flex items-center gap-1 font-semibold">
              GHS <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
