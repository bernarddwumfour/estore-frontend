"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/PageHeader";
import type { BlogPageProps } from "@/templates/contract";

export default function BlogPage({ posts, pagination }: BlogPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        subtitle="Our Blog"
        title="Tips, reviews, and buying guides for your tech"
      />
      <div className="container mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts found.</p>
          </div>
        ) : (
          <>
            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group relative block overflow-hidden rounded-lg bg-white border border-gray-100">
                    {/* Image */}
                    {post.cover_image_url && (
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{post.author}</span>
                        <span>•</span>
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

                      {/* Title */}
                      <h2 className="text-xl font-medium text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-700 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>

                      {/* Read More Button */}
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-gray-900 hover:text-gray-600"
                      >
                        Read more →
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination.has_previous}
                    asChild={pagination.has_previous}
                  >
                    {pagination.has_previous ? (
                      <Link href={`/blog?page=${pagination.previous_page}`}>Previous</Link>
                    ) : (
                      <span>Previous</span>
                    )}
                  </Button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant="outline"
                        className={
                          pageNum === pagination.current_page
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : ""
                        }
                        asChild={pageNum !== pagination.current_page}
                      >
                        {pageNum !== pagination.current_page ? (
                          <Link href={`/blog?page=${pageNum}`}>{pageNum}</Link>
                        ) : (
                          <span>{pageNum}</span>
                        )}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    disabled={!pagination.has_next}
                    asChild={pagination.has_next}
                  >
                    {pagination.has_next ? (
                      <Link href={`/blog?page=${pagination.next_page}`}>Next</Link>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
