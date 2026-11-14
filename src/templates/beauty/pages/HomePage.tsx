import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Clock3, Flower2, Leaf, Sparkles } from "lucide-react";
import ProductsGrid from "@/app/(web)/products/ProductsGrid";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";

const services = [
  { number: "01", title: "Organic Radiance Facial", text: "A gentle reset with botanical care, a deep cleanse and a glow that feels like you.", duration: "60 min", price: "From GH₵ 350", image: "/beauty/facial.webp", alt: "Botanical facial treatment at Reel Spa" },
  { number: "02", title: "Signature Body Massage", text: "Slow, considered massage work to help you release tension and settle back into yourself.", duration: "75 min", price: "From GH₵ 420", image: "/beauty/massage.webp", alt: "Hot stone massage treatment" },
  { number: "03", title: "The Skin Ritual", text: "A personalised treatment pairing gentle exfoliation with nourishing, skin-loving ingredients.", duration: "50 min", price: "From GH₵ 300", image: "/beauty/skincare.webp", alt: "Natural skincare products for an at-home ritual" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-medium uppercase tracking-[0.23em] text-[#9b5c40]">{children}</p>;
}

function SectionTitle({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl text-center"><Eyebrow>{kicker}</Eyebrow><h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] text-[#30231d] sm:text-4xl">{children}</h2></div>;
}

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#fffdf9] text-[#30231d]">
      <section className="relative isolate min-h-[620px] bg-[#49382e] sm:min-h-[690px]">
          <Image src="/beauty/hero.webp" alt="A calming massage at Reel Spa" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#211913]/75 via-[#211913]/35 to-[#211913]/5" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1280px] items-center px-6 pb-14 pt-12 sm:min-h-[690px] sm:px-12 lg:px-20">
          <div className="max-w-[650px] text-white">
            <Eyebrow>Massage · Skin · Stillness</Eyebrow>
            <h1 className="mt-5 max-w-[640px] font-serif text-[48px] leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">Keep a space for beauty in your life.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/85 sm:text-base">Thoughtful treatments, gentle ingredients and room to breathe. Come as you are; leave feeling a little more like yourself.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/#services" className="inline-flex items-center gap-3 bg-[#a46547] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#874d35]">Explore treatments <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/products" className="border border-white/65 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-[#30231d]">Shop skincare</Link>
            </div>
          </div>
          <a href="#services" className="absolute bottom-8 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.18em] text-white/80 lg:flex">Scroll to unwind <ArrowDown className="h-4 w-4" /></a>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 bg-[#f8f3ed] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <SectionTitle kicker="Spa & beauty studio">Knowledgeable care. <br className="sm:hidden" />Beautifully considered.</SectionTitle>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-7 text-[#75665b]">Make a little room for yourself with restorative treatments tailored to how you feel today.</p>
          <div className="mt-11 grid gap-5 md:grid-cols-3">
          {services.map((service) => <article key={service.number} className="group bg-white">
              <div className="relative aspect-[1.22] overflow-hidden"><Image src={service.image} alt={service.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
              <div className="px-5 pb-6 pt-5 sm:px-6">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#9b5c40]"><span>Treatment {service.number}</span><span className="flex items-center gap-1.5 text-[#81746b]"><Clock3 className="h-3 w-3" />{service.duration}</span></div>
                <h3 className="mt-3 font-serif text-[22px] leading-tight">{service.title}</h3>
                <p className="mt-2 min-h-[66px] text-xs leading-6 text-[#75665b]">{service.text}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[#eee5dd] pt-4"><span className="text-xs font-medium">{service.price}</span><Link href="/contact" className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#92583e]">Ask about it <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </div>
            </article>)}
          </div>
          <div className="mt-9 text-center"><Link href="/contact" className="inline-flex border border-[#c8b4a6] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#60483a] hover:border-[#92583e] hover:text-[#92583e]">Plan your visit</Link></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative min-h-[430px] sm:min-h-[500px]">
          <div className="absolute bottom-0 left-0 top-12 w-[72%] overflow-hidden"><Image src="/beauty/interior.webp" alt="The calm, sunlit Reel Spa treatment room" fill sizes="(max-width: 1024px) 70vw, 36vw" className="object-cover" /></div>
          <div className="absolute right-0 top-0 h-[72%] w-[47%] overflow-hidden border-[8px] border-[#fffdf9]"><Image src="/beauty/skincare.webp" alt="Natural skincare selected for a soothing self-care ritual" fill sizes="(max-width: 1024px) 50vw, 24vw" className="object-cover" /></div>
          <div className="absolute bottom-5 right-[10%] flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#92583e] text-center text-white"><Sparkles className="h-5 w-5" /><span className="mt-1 text-[8px] uppercase leading-4 tracking-[0.12em]">A softer<br />kind of care</span></div>
        </div>
        <div className="max-w-lg py-4">
          <Eyebrow>Come back to yourself</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-[1.06] tracking-[-0.04em] sm:text-5xl">A little pause can change the whole day.</h2>
          <p className="mt-5 text-sm leading-7 text-[#75665b]">At Reel Spa, every detail is an invitation to slow down. Our therapists take time to listen, then shape each visit around your skin, your body and the kind of rest you need.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3"><Leaf className="mt-1 h-5 w-5 shrink-0 text-[#9b5c40]" /><div><h3 className="font-serif text-lg">Gentle ingredients</h3><p className="mt-1 text-xs leading-5 text-[#75665b]">Thoughtfully chosen products and unhurried care.</p></div></div>
            <div className="flex gap-3"><Flower2 className="mt-1 h-5 w-5 shrink-0 text-[#9b5c40]" /><div><h3 className="font-serif text-lg">Care that’s personal</h3><p className="mt-1 text-xs leading-5 text-[#75665b]">Treatments shaped around what feels right for you.</p></div></div>
          </div>
          <Link href="/about" className="mt-8 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#92583e]">More about Reel Spa <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="relative isolate min-h-[360px] bg-[#594435]">
        <Image src="/beauty/interior.webp" alt="Soft sunlight fills the spa" fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[#241a14]/45" />
        <div className="relative mx-auto flex min-h-[360px] max-w-[1120px] flex-col items-start justify-center px-6 py-14 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div><Eyebrow>Make time for you</Eyebrow><h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">Your next favourite hour is waiting.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/80">Tell us what you’re looking for and we’ll help you find a treatment that feels just right.</p></div>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-3 bg-white px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#382820] transition-colors hover:bg-[#f4e8dd] lg:mt-0">Plan your visit <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-end">
            <div><Eyebrow>Small rituals, lovely results</Eyebrow><h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] sm:text-4xl">Shop skin & body care</h2><p className="mt-2 text-sm text-[#75665b]">Explore the products available in our store.</p></div>
            <Link href="/products" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#92583e]">Shop all products <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8"><Suspense fallback={<ProductsGridSkeleton />}><ProductsGrid limit={4} sort_by="random" display="variants" showPagination={false} /></Suspense></div>
        </div>
      </section>

      <section className="bg-[#f7f1eb] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1120px] overflow-hidden bg-[#e9ddd2] md:grid-cols-2">
          <div className="relative min-h-[290px] md:min-h-[330px]"><Image src="/beauty/skincare.webp" alt="A calm, natural skincare ritual" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14"><Eyebrow>At home, in your own time</Eyebrow><h2 className="mt-4 max-w-sm font-serif text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">Bring a little spa calm home.</h2><p className="mt-4 max-w-md text-sm leading-7 text-[#75665b]">Discover the products in our store and find a new favourite for your everyday routine.</p><Link href="/products" className="mt-7 inline-flex w-fit items-center gap-3 bg-[#92583e] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-white hover:bg-[#75432f]">Explore the collection <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-end">
            <div><Eyebrow>More to love</Eyebrow><h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] sm:text-4xl">Discover the collection</h2></div>
            <Link href="/products" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#92583e]">Browse all products <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8"><Suspense fallback={<ProductsGridSkeleton />}><ProductsGrid limit={8} sort_by="random" display="variants" showPagination={false} /></Suspense></div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1120px]">
          <SectionTitle kicker="Your ritual, your way">Beauty that feels like you.</SectionTitle>
          <div className="mt-7 grid gap-3 text-center sm:grid-cols-3"><div className="bg-[#f8f3ed] px-5 py-6"><p className="font-serif text-xl">Listen</p><p className="mt-2 text-xs leading-5 text-[#75665b]">We begin with what your skin and body need.</p></div><div className="bg-[#f8f3ed] px-5 py-6"><p className="font-serif text-xl">Unwind</p><p className="mt-2 text-xs leading-5 text-[#75665b]">Settle in while we take care of the details.</p></div><div className="bg-[#f8f3ed] px-5 py-6"><p className="font-serif text-xl">Glow</p><p className="mt-2 text-xs leading-5 text-[#75665b]">Leave with a little more ease in your day.</p></div></div>
        </div>
      </section>
    </div>
  );
}
