// Furniture store blog listing — matches the furniture theme (cream header
// band, gold date badges, green accents). Static content for now.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";

const posts = [
  {
    id: 1,
    title: "Furniture Trends 2024: What's Hot and What's Not",
    excerpt:
      "From warm minimalism to sculptural sofas, here are the looks shaping living spaces this year — and the ones on their way out.",
    author: "Leslie Alexander",
    date: "15 April 2024",
    readTime: "6 min read",
    src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1160&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Choosing the Perfect Sofa",
    excerpt:
      "Size, fabric, fill and frame — everything you need to weigh up before investing in the centrepiece of your living room.",
    author: "Jenny Wilson",
    date: "14 April 2024",
    readTime: "8 min read",
    src: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1160&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Choosing the Right Dining Table for Your Lifestyle",
    excerpt:
      "Round or rectangular, wood or stone — find the dining table that fits the way you actually live and entertain.",
    author: "Guy Hawkins",
    date: "12 April 2024",
    readTime: "5 min read",
    src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1160&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Small Space, Big Style: Furnishing Compact Homes",
    excerpt:
      "Multi-functional pieces and clever proportions that make even the smallest apartment feel open and intentional.",
    author: "Cameron Williamson",
    date: "8 April 2024",
    readTime: "7 min read",
    src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1160&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "How to Layer Lighting for a Cosy Home",
    excerpt:
      "Ambient, task and accent lighting — the three-layer approach designers use to make any room feel warm and inviting.",
    author: "Casey Kim",
    date: "2 April 2024",
    readTime: "4 min read",
    src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1160&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Caring for Solid Wood Furniture That Lasts",
    excerpt:
      "Simple habits to keep your timber pieces looking beautiful for decades, from oiling to avoiding the sun.",
    author: "Riley Scott",
    date: "28 March 2024",
    readTime: "6 min read",
    src: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1160&auto=format&fit=crop",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="News & Blogs"
        title="Our Latest News & Blogs"
        description="Tips, trends and inspiration to help you furnish a home you love — straight from our design team."
      />

      {/* Posts grid */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col">
              <Link
                href={`/blog/${post.id}`}
                className="relative block aspect-[4/3] overflow-hidden rounded-3xl"
              >
                <Image
                  src={post.src}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 rounded-lg bg-[#f5b21a] px-3 py-1.5 text-xs font-bold text-[#2b2b22]">
                  {post.date}
                </span>
              </Link>

              <div className="mt-4 flex items-center gap-3 text-xs text-[#a6a08f]">
                <span>{post.author}</span>
                <span className="h-1 w-1 rounded-full bg-[#d6d2c6]" />
                <span>{post.readTime}</span>
              </div>

              <Link href={`/blog/${post.id}`}>
                <h2 className="mt-2 text-lg font-bold leading-snug transition-colors group-hover:text-[#3f4d2c]">
                  {post.title}
                </h2>
              </Link>

              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6b6b5a]">
                {post.excerpt}
              </p>

              <Link
                href={`/blog/${post.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#3f4d2c]"
              >
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        {/* Pagination (static) */}
        <div className="mt-14 flex justify-center gap-2">
          <button
            disabled
            className="rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold text-[#a6a08f]"
          >
            Previous
          </button>
          <button className="rounded-full bg-[#3f4d2c] px-5 py-2.5 text-sm font-bold text-[#f6f3ec]">
            1
          </button>
          <button className="rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold hover:border-[#3f4d2c] hover:text-[#3f4d2c]">
            2
          </button>
          <button className="rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold hover:border-[#3f4d2c] hover:text-[#3f4d2c]">
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
