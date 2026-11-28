import { blogImage } from "../blog-images";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MoveRight, Star } from "lucide-react";
import ProductsGrid from "@/app/(web)/products/ProductsGrid";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { BlogPostType } from "@/types/blogTypes";
import type { TestimonialReview } from "@/templates/furniture/components/TestimonialsCarousel";

const photos = {
  story: "/images/amammre/story.png",
  journal1: "/images/amammre/journal-heritage.png",
  journal2: "/images/amammre/journal-everyday.png",
  journal3: "/images/amammre/journal-celebration.png",
};

const journal = [
  { title: "A guide to Ghanaian traditional wear", category: "The Amammre Wears edit", image: photos.journal1 },
  { title: "How to style African print for everyday wear", category: "How to wear it", image: photos.journal2 },
  { title: "Choosing an outfit for a Ghanaian celebration", category: "In good company", image: photos.journal3 },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#fffdf9] text-[#24211f]">
      <Hero />
      <Collections />
      <FeaturedProducts />
      <Story />
      <Suspense fallback={null}><Reviews /></Suspense>
      <Journal />
      <Newsletter />
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-medium uppercase tracking-[0.23em] text-[#9b7953]">{children}</p>;
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f3f2f0]">
      <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] flex-col items-center px-5 pt-16 text-center sm:min-h-[650px] sm:pt-20 lg:min-h-[680px]">
        <div className="relative z-10 flex w-full max-w-[850px] flex-col items-center">
          <Eyebrow>The Amammre Wears collection</Eyebrow>
          <h1 className="mt-5 max-w-[850px] text-[38px] font-bold uppercase leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">Elevate your everyday style</h1>
          <p className="mt-5 max-w-[500px] text-sm leading-7 text-[#77716b]">Discover Ghanaian-inspired fashion for everyday moments and special occasions.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] text-[#77716b]"><span>◇ Thoughtful style</span><span>◇ For every occasion</span><span>◇ Made to be worn</span></div>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/products" className="rounded-md bg-white px-5 py-3.5 text-xs font-semibold text-[#24211f] shadow-sm hover:bg-[#e9e4dd]">Shop new arrivals <ArrowRight className="ml-2 inline h-4 w-4" /></Link><Link href="/#collections" className="rounded-md bg-[#ad8a60] px-5 py-3.5 text-xs font-semibold text-white hover:bg-[#92704a]">Explore collection <ArrowRight className="ml-2 inline h-4 w-4" /></Link></div>
        </div>
        <Image src="/images/amammre/traditional-hero.png" alt="A man and woman wearing Ghanaian traditional attire" width={1784} height={896} priority sizes="100vw" className="pointer-events-none absolute bottom-0 left-1/2 h-auto max-h-[420px] w-full -translate-x-1/2 object-contain object-bottom lg:max-h-[520px]" />
      </div>
    </section>
  );
}

const categoryImages: Record<string, string> = Object.fromEntries(
  ["men", "ladies", "unisex", "children", "accessories"].map(slug => [slug, `/images/amammre/${slug}.png`])
);

async function Collections() {
  let categories: { id: string; name: string; slug: string; image?: string | null }[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
    const response = await fetch(`${baseUrl}${endpoints.products.listCategories}`, { next: { revalidate: 3600, tags: ["categories"] } });
    if (response.ok) {
      const data = await response.json();
      if (data?.success && Array.isArray(data?.data?.categories)) categories = data.data.categories;
    }
  } catch (error) {
    console.error("Error fetching Amammre Wears categories:", error);
  }
  return <section id="collections" className="scroll-mt-20 bg-[#faf9f7] px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.85fr_2.15fr] lg:items-start"><div><div><Eyebrow>Discover the collection</Eyebrow><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Find your own kind of elegance.</h2><p className="mt-3 text-sm leading-7 text-[#817a72]">Explore our categories and find something for every occasion.</p></div><Link href="/products" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#92704a]">Shop all <ArrowRight className="h-4 w-4" /></Link></div>{categories.length ? <div className="flex h-[230px] items-stretch gap-3 sm:h-[270px] sm:gap-4">{categories.map((category) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className="group relative h-full min-w-0 flex-[1_1_0%] overflow-hidden rounded-xl bg-[#e9e4de] transition-[flex-grow] duration-300 ease-out hover:flex-[1.3_1_0%] focus-visible:flex-[1.3_1_0%]">{(categoryImages[category.slug] || category.image) && <Image src={categoryImages[category.slug] || category.image!} alt="" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}<span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#24211f]">{category.name} <ArrowUpRight className="ml-1 inline h-3 w-3" /></span></Link>)}</div> : <p className="mt-8 rounded-xl bg-[#f0ece6] px-6 py-10 text-center text-sm text-[#817a72]">Categories will appear here when they’re available.</p>}</div></section>;
}

function FeaturedProducts() {
  return <section className="bg-[#f6f3ee] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Eyebrow>Selected for you</Eyebrow><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">The pieces we love.</h2><p className="mt-2 text-sm text-[#77716b]">A considered edit of what’s new and worth keeping.</p></div><Link href="/products" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#71685e] hover:text-[#ad8a60]">Shop the collection <MoveRight className="h-4 w-4" /></Link></div><div className="mt-8"><Suspense fallback={<ProductsGridSkeleton />}><ProductsGrid limit={8} sort_by="random" display="variants" showPagination={false} /></Suspense></div></div></section>;
}

function Story() {
  return <section className="px-5 py-16 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-2xl bg-[#171717] text-white md:grid-cols-2"><div className="flex flex-col justify-center px-8 py-12 sm:px-14 sm:py-16"><Eyebrow>The Amammre Wears point of view</Eyebrow><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Style every journey.</h2><p className="mt-5 max-w-md text-sm leading-7 text-white/65">From everyday African prints to traditional looks for special occasions, find pieces that feel like you.</p><Link href="/about" className="mt-7 inline-flex w-fit items-center gap-3 rounded-md bg-[#ad8a60] px-5 py-3 text-xs font-semibold hover:bg-[#92704a]">Our story <ArrowRight className="h-4 w-4" /></Link></div><div className="relative min-h-[320px] md:min-h-[420px]"><Image src={photos.story} alt="A woman wearing a Ghanaian-inspired print dress" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div></div></section>;
}

async function Reviews() {
  let reviews: TestimonialReview[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (baseUrl) {
      const response = await fetch(`${baseUrl}${endpoints.products.reviews.featuredReviews}?limit=6`, { next: { revalidate: 300, tags: ["featured-reviews"] } });
      if (response.ok) {
        const data = await response.json();
        if (data?.success && Array.isArray(data?.data?.reviews)) reviews = data.data.reviews.slice(0, 6);
      }
    }
  } catch (error) {
    console.error("Error fetching Amammre Wears reviews:", error);
  }
  if (!reviews.length) return null;
  return <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="text-center"><Eyebrow>Kind words</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Why our customers love us.</h2><p className="mt-3 text-sm text-[#817a72]">A little inspiration from the people who wear Amammre Wears.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{reviews.map(review => <article key={review.id} className="flex flex-col rounded-xl border border-[#eee9e2] bg-[#faf9f7] p-6"><div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-3.5 w-3.5 ${index < Math.round(review.rating) ? "fill-[#ad8a60] text-[#ad8a60]" : "text-[#ddd5ca]"}`} />)}</div>{review.title && <h3 className="mt-4 text-sm font-semibold">{review.title}</h3>}<p className="mt-3 flex-1 text-sm leading-7 text-[#77716b]">{review.comment}</p><div className="mt-6 flex items-center gap-3 border-t border-[#eee9e2] pt-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee6dc] text-sm font-semibold text-[#92704a]">{review.user?.initials || (review.user?.name || "C").slice(0, 1)}</span><div><p className="text-xs font-semibold">{review.user?.name || "Customer"}</p></div></div></article>)}</div></div></section>;
}

async function getJournalPosts(): Promise<BlogPostType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) return [];
    const response = await fetch(`${baseUrl}${endpoints.blog.listPostsWeb}?limit=3`, { next: { revalidate: 300, tags: ["blog-posts"] } });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.success && Array.isArray(data?.data?.posts) ? data.data.posts.slice(0, 3) : [];
  } catch (error) {
    console.error("Error fetching Amammre Wears journal posts:", error);
    return [];
  }
}

async function Journal() {
  const posts = await getJournalPosts();
  return <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1440px]"><div className="flex items-end justify-between gap-4"><div><Eyebrow>Notes on getting dressed</Eyebrow><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">The fashion journal.</h2></div><Link href="/blog" className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#71685e] hover:text-[#ad8a60] sm:inline-flex">Read the journal <ArrowUpRight className="h-4 w-4" /></Link></div>
    {posts.length > 0 ? <div className="mt-8 grid gap-6 md:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/blog/${post.slug}`} className="group"><div className="relative aspect-[1.34] overflow-hidden bg-[#f2eee8]">{blogImage(post.slug, post.cover_image_url) && <Image src={blogImage(post.slug, post.cover_image_url)!} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}</div><p className="mt-4 text-[9px] uppercase tracking-[0.15em] text-[#9b7953]">Style notes</p><h3 className="mt-2 text-lg font-medium leading-snug group-hover:text-[#ad8a60]">{post.title}</h3><span className="mt-3 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-[#766e66]">Read story <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}</div> : <div className="mt-8 grid gap-6 md:grid-cols-3">{journal.map((post) => <Link key={post.title} href="/blog" className="group"><div className="relative aspect-[1.34] overflow-hidden bg-[#f2eee8]"><Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div><p className="mt-4 text-[9px] uppercase tracking-[0.15em] text-[#9b7953]">{post.category}</p><h3 className="mt-2 text-lg font-medium leading-snug group-hover:text-[#ad8a60]">{post.title}</h3><span className="mt-3 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-[#766e66]">Read story <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}</div>}
  </div></section>;
}

function Newsletter() {
  return <section className="bg-[#eee8df] px-6 py-14 text-center sm:py-16"><div className="mx-auto max-w-xl"><Eyebrow>A little note from us</Eyebrow><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Good things, occasionally.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#726b63]">New collections, styling notes and first access to the pieces we love.</p><div className="mx-auto mt-6 flex max-w-md border-b border-[#8e8478]"><label htmlFor="amammre-newsletter" className="sr-only">Email address</label><input id="amammre-newsletter" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[#8b8176]" /><button type="button" className="px-2 text-[9px] font-semibold uppercase tracking-[0.14em] hover:text-[#ad8a60]">Sign me up <ArrowRight className="ml-2 inline h-4 w-4" /></button></div></div></section>;
}
