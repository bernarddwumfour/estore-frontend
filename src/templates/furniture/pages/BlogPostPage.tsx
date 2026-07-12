import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { BlogPostPageProps } from "@/templates/contract";
import PageHeader from "../components/PageHeader";

export default function BlogPostPage({ post }: BlogPostPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle={post.category?.name || "Blog"}
        title={post.title}
      />

      <section className="container mx-auto px-4 py-32 lg:px-8 max-w-4xl">
        {/* Featured Image */}
        {post.cover_image_url && (
          <div className="relative aspect-video overflow-hidden rounded-3xl mb-10">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-[#a6a08f] mb-8">
          <span className="font-medium text-[#2b2b22]">{post.author}</span>
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

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:text-[#2b2b22] prose-a:text-[#3f4d2c]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Blog Link */}
        <div className="mt-16 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d3] px-6 py-3 text-sm font-bold text-[#2b2b22] hover:border-[#3f4d2c] hover:text-[#3f4d2c] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </section>
    </div>
  );
}
