// Furniture store about page — furniture theme (cream header band, gold icon
// chips, green accents and CTA). Static content.
import Image from "next/image";
import Link from "next/link";
import { Award, Truck, RotateCcw, ArrowRight, Leaf, Headphones } from "lucide-react";
import PageHeader from "../components/PageHeader";

const values = [
  {
    icon: Award,
    title: "Crafted to Last",
    body: "Every piece is built from solid hardwoods and premium upholstery, quality-checked by hand before it ever reaches your home.",
  },
  {
    icon: Truck,
    title: "Free & Insured Delivery",
    body: "We package with care and ship fully tracked and insured, with free delivery on every order above $180 — straight to your door.",
  },
  {
    icon: RotateCcw,
    title: "Easy 30-Day Returns",
    body: "Not the perfect fit? Return any unused item within 30 days. Every order is backed by our straightforward returns promise.",
  },
];

const stats = [
  { value: "50k+", label: "Happy Customers" },
  { value: "4.9", label: "Average Rating" },
  { value: "2,500+", label: "Products" },
  { value: "12", label: "Years of Craft" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="About Us"
        title="Crafting Homes You'll Love"
        description="Welcome to Furniture — your destination for modern, thoughtfully made pieces. We bring designer-quality furniture to your home without the traditional retail markups."
      />

      {/* Values */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
            <span className="h-px w-6 bg-[#f5b21a]" />
            Why Shop With Us
          </span>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            The Smarter Way to <span className="text-[#3f4d2c]">Furnish</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl bg-[#f1eee7] p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5b21a] text-[#22401f]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6b5a]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Origin story */}
      <section className="bg-[#f6f3ec]">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200&auto=format&fit=crop"
              alt="Our furniture workshop"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
              <span className="h-px w-6 bg-[#f5b21a]" />
              Our Story
            </span>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Designed for real, <span className="text-[#3f4d2c]">lived-in homes</span>
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#6b6b5a]">
              <p>
                We started Furniture because we were tired of choosing between
                beautiful design and a fair price. So we built a direct-to-home
                catalogue that cuts out the middlemen.
              </p>
              <p>
                Working closely with skilled makers, we obsess over the details —
                the joinery, the grain, the way a cushion holds its shape after
                years of use — so every piece feels as good as it looks.
              </p>
              <p>
                Today we help tens of thousands of customers furnish living rooms,
                bedrooms and workspaces with pieces designed to last a lifetime.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#3f4d2c] px-7 py-3 text-sm font-bold text-[#f6f3ec] transition-colors hover:bg-[#33401f]"
            >
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-[#3f4d2c] px-6 py-12 text-center text-[#f6f3ec] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black md:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-[#cdd6c4] sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Promises strip */}
      <section className="container mx-auto px-4 pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-3xl bg-[#f1eee7] p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5b21a] text-[#22401f]">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-bold">Responsibly Sourced</h3>
              <p className="mt-1 text-sm text-[#6b6b5a]">
                Sustainable materials and ethical makers behind every collection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-[#f1eee7] p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5b21a] text-[#22401f]">
              <Headphones className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-bold">24×7 Support</h3>
              <p className="mt-1 text-sm text-[#6b6b5a]">
                Our team is here to help, every day of the week.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
