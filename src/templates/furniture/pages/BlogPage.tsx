// Furniture store blog listing — real data via props.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import type { BlogPageProps } from "@/templates/contract";

export default function BlogPage({ posts, pagination }: BlogPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="Our Blog"
        title="Latest Articles"
      />

      <section className="container mx-auto px-4 py-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#a6a08f] text-lg">No blog posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group flex flex-col">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden rounded-3xl"
                  >
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#e7e1d3]" />
                    )}
                    {post.published_at && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-[#f5b21a] px-3 py-1.5 text-xs font-bold text-[#2b2b22]">
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </Link>

                  <div className="mt-4 flex items-center gap-3 text-xs text-[#a6a08f]">
                    <span>{post.author}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d6d2c6]" />
                    <span>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="mt-2 text-lg font-bold leading-snug transition-colors group-hover:text-[#3f4d2c]">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6b6b5a]">
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#3f4d2c]"
                  >
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-14 flex justify-center gap-2">
                <Link
                  href={
                    pagination.has_previous
                      ? `/blog?page=${pagination.previous_page}`
                      : "#"
                  }
                  className={`rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold transition-colors ${
                    pagination.has_previous
                      ? "hover:border-[#3f4d2c] hover:text-[#3f4d2c]"
                      : "text-[#a6a08f] pointer-events-none"
                  }`}
                  aria-disabled={!pagination.has_previous}
                >
                  Previous
                </Link>
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
                  (pageNum) =>
                    pageNum === pagination.current_page ? (
                      <span
                        key={pageNum}
                        className="rounded-full bg-[#3f4d2c] px-5 py-2.5 text-sm font-bold text-[#f6f3ec]"
                      >
                        {pageNum}
                      </span>
                    ) : (
                      <Link
                        key={pageNum}
                        href={`/blog?page=${pageNum}`}
                        className="rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold hover:border-[#3f4d2c] hover:text-[#3f4d2c] transition-colors"
                      >
                        {pageNum}
                      </Link>
                    )
                )}
                <Link
                  href={
                    pagination.has_next
                      ? `/blog?page=${pagination.next_page}`
                      : "#"
                  }
                  className={`rounded-full border border-[#e7e1d3] px-5 py-2.5 text-sm font-bold transition-colors ${
                    pagination.has_next
                      ? "hover:border-[#3f4d2c] hover:text-[#3f4d2c]"
                      : "text-[#a6a08f] pointer-events-none"
                  }`}
                  aria-disabled={!pagination.has_next}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
