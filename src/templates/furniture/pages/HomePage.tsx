import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  CreditCard,
  Headphones,
  Instagram as InstagramIcon,
} from "lucide-react";
import ProductsGrid from "@/app/(web)/products/ProductsGrid";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import Categories from "../components/Categories";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { BlogPostType } from "@/types/blogTypes";
import type { ProductType } from "@/types/productTypes";
import PromotionsCarousel from "@/app/(web)/products/(components)/Promotions/PromotionsCarousel";
import HeroCarousel from "../components/HeroCarousel";
import Faqs from "../components/Faqs";
import TestimonialsCarousel, {
  type TestimonialReview,
} from "../components/TestimonialsCarousel";

export default function HomePage() {
  return (
    <div className="bg-white text-[#2b2b22]">
      <Hero />
      <FeatureStrip />
      <ProductCollection />
      <Packages />
      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={null}>
        <Blogs />
      </Suspense>
      <Instagram />
      <Faqs />
      <Newsletter />
    </div>
  );
}

function SectionHeading({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
        <span className="h-px w-6 bg-[#f5b21a]" />
        {tag}
      </span>
      <h2 className="mt-2 text-3xl font-black text-[#2b2b22] md:text-4xl">{children}</h2>
    </div>
  );
}

async function getHeroProducts(): Promise<ProductType[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || "http://localhost:3000";
    const url = new URL(
      `${baseUrl.replace(/\/$/, "")}/${endpoints.products.listProductsWeb.replace(/^\//, "")}`
    );
    url.search = new URLSearchParams({ limit: "8", featured: "true", display: "variants", sort_by: "random" }).toString();
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data?.success ? data.data.products ?? [] : [];
  } catch (err) {
    console.error("Error fetching hero products:", err);
    return [];
  }
}

async function HeroShowcase() {
  const products = await getHeroProducts();
  if (products.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-3xl bg-white text-sm text-[#a6a08f]">
        No featured items available
      </div>
    );
  }
  return <HeroCarousel products={products} />;
}

function HeroShowcaseSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="w-[300px] shrink-0 rounded-3xl bg-white p-4 sm:w-[340px]"
        >
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[#ece8df]" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#ece8df]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#ece8df]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-[#f6f3ec]">
      <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 pt-24 pb-24 lg:grid-cols-2 lg:px-8 lg:pt-32 lg:pb-32">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#654035] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#f5b21a]" />
            Welcome to oak&loom
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-[#2b2b22] sm:text-5xl lg:text-6xl">
            Explore Our Modern{" "}
            <span className="text-[#654035]">oak&loom Collection</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#6b6b5a]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[#654035] px-7 py-3 text-sm font-bold text-[#f6f3ec] transition-colors hover:bg-[#503027]"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="text-sm font-bold text-[#2b2b22] underline underline-offset-4 transition-colors hover:text-[#654035]"
            >
              View All Products
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex items-center">
              {[
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
              ].map((src, i) => (
                <span
                  key={src}
                  className={`relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#f6f3ec] ${
                    i > 0 ? "-ml-3" : ""
                  }`}
                >
                  <Image src={src} alt="Customer" fill className="object-cover" />
                </span>
              ))}
              <span className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f6f3ec] bg-[#f5b21a] text-lg font-black text-[#2b2b22]">
                +
              </span>
            </div>
            <div className="text-sm font-black text-[#2b2b22]">
              4.9 Ratings+
              <span className="block text-xs font-normal text-[#6b6b5a]">
                Trusted by 50k+ Customers
              </span>
            </div>
          </div>
        </div>

        <div className="lg:-mr-8">
          <Suspense fallback={<HeroShowcaseSkeleton />}>
            <HeroShowcase />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  const items = [
    { icon: Truck, title: "Free Shipping", sub: "Free shipping for order above $180" },
    { icon: CreditCard, title: "Flexible Payment", sub: "Multiple secure payment options" },
    { icon: Headphones, title: "24×7 Support", sub: "We support online all days" },
  ];
  return (
    <section className="container mx-auto px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-4 px-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4f1ea] text-[#654035]">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2b2b22]">{title}</p>
              <p className="text-[11px] text-[#6b6b5a]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCollection() {
  return (
    <section className="container mx-auto px-4 py-12 lg:px-8">
      <SectionHeading tag="Our Products">
        Our <span className="text-[#654035]">Products Collections</span>
      </SectionHeading>
      {/* Furniture-themed category pills (no images) replace the static tabs. */}
      <Suspense fallback={<div className="mt-6 h-12" />}>
        <Categories />
      </Suspense>
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid limit={12} sort_by="random" showPagination={false} />
      </Suspense>
    </section>
  );
}

function Packages() {
  return (
    <section className="container mx-auto px-4 py-12 lg:px-8">
      <SectionHeading tag="Promotions">
        Our <span className="text-[#654035]">Packages</span>
      </SectionHeading>
      <div className="mt-8">
        <Suspense fallback={null}>
          {/* Reuses the shared promotions carousel: images that link to each
              package/promotion, same as the original store. */}
          <PromotionsCarousel limit={10} theme="furniture" />
        </Suspense>
      </div>
    </section>
  );
}

async function getFeaturedReviews(): Promise<TestimonialReview[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

    if (!baseUrl) return [];

    const response = await fetch(`${baseUrl}${endpoints.products.reviews.featuredReviews}?limit=8`, {
      next: { revalidate: 300, tags: ["featured-reviews"] },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data?.success && Array.isArray(data?.data?.reviews)
      ? data.data.reviews
      : [];
  } catch (error) {
    console.error("Error fetching featured reviews:", error);
    return [];
  }
}

async function Testimonials() {
  const reviews = await getFeaturedReviews();

  if (reviews.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <SectionHeading tag="Testimonial">
        What <span className="text-[#654035]">Our Clients Say</span>
      </SectionHeading>
      <TestimonialsCarousel reviews={reviews} />
    </section>
  );
}

async function getLatestPosts(): Promise<BlogPostType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";
    const response = await fetch(`${baseUrl}${endpoints.blog.listPostsWeb}?limit=3`, {
      next: { revalidate: 300, tags: ["blog-posts"] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.success && Array.isArray(data?.data?.posts) ? data.data.posts.slice(0, 3) : [];
  } catch (error) {
    console.error("Error fetching homepage blog posts:", error);
    return [];
  }
}

async function Blogs() {
  const posts = await getLatestPosts();
  if (posts.length === 0) return null;
  return (
    <section className="bg-[#f6f3ec]">
      <div className="container mx-auto px-4 py-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
            <span className="h-px w-6 bg-[#f5b21a]" />
            News &amp; Blogs
          </span>
          <h2 className="mt-2 text-3xl font-black leading-tight text-[#2b2b22] md:text-4xl">
            Our Latest <br />
            <span className="text-[#654035]">News &amp; Blogs</span>
          </h2>
        </div>
        <Link
          href="/blog"
          className="rounded-full bg-[#654035] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#503027]"
        >
          View All Blogs
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} className="group">
            <Link href={`/blog/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-[#e7e1d3]">
              {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}
              {p.published_at && <span className="absolute bottom-3 left-3 rounded-lg bg-[#f5b21a] px-3 py-1.5 text-xs font-bold text-[#2b2b22]">
                {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
              </span>}
            </Link>
            <h3 className="mt-4 text-lg font-bold leading-snug text-[#2b2b22] group-hover:text-[#654035]">
              {p.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#6b6b5a]">
              {p.excerpt}
            </p>
            <Link href={`/blog/${p.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#654035]">
              Read More <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}

function Instagram() {
  const imgs = [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=600&auto=format&fit=crop",
  ];
  return (
    <section className="container mx-auto px-4 py-10 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
          <span className="h-px w-6 bg-[#f5b21a]" />
          Follow Us
        </span>
        <h2 className="mt-2 text-3xl font-black text-[#2b2b22] md:text-4xl">
          Follow Us On <span className="text-[#654035]">Instagram</span>
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {imgs.map((src, i) => (
          <Link
            key={i}
            href="#"
            className="group relative aspect-square overflow-hidden rounded-2xl"
          >
            <Image src={src} alt="Instagram post" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute inset-0 flex items-center justify-center bg-[#654035]/0 text-white opacity-0 transition-all duration-300 group-hover:bg-[#654035]/40 group-hover:opacity-100">
              <InstagramIcon className="h-7 w-7" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-[#f6f3ec]">
      <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="rounded-3xl bg-[#654035] px-6 py-14 text-center text-[#f6f3ec]">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#d6d6c5]">
          <span className="h-px w-6 bg-[#f5b21a]" />
          Our Newsletter
        </span>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black md:text-3xl">
          Subscribe to Our Newsletter to Get Updates to Our Latest Collection
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#d6d6c5]">
          Get 20% off on your first order just by subscribing to our newsletter
        </p>
        <form className="mx-auto mt-7 flex max-w-md gap-2">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="h-12 w-full rounded-full bg-white px-5 text-sm text-[#2b2b22] outline-none"
          />
          <button
            type="button"
            className="h-12 shrink-0 rounded-full bg-[#f5b21a] px-7 text-sm font-bold text-[#654035] transition-colors hover:bg-[#e6a40f]"
          >
            Subscribe
          </button>
        </form>
      </div>
      </div>
    </section>
  );
}
