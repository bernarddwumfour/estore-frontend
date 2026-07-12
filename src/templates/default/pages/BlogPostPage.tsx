"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BlogPostPageProps } from "@/templates/contract";

export default function BlogPostPage({ post }: BlogPostPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Featured Image */}
        {post.cover_image_url && (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-white border border-gray-100 mb-12">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Post Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{post.author}</span>
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
        </div>

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Blog Link */}
        <div className="mt-16 text-center">
          <Button variant="outline" asChild>
            <Link href="/blog">← Back to all posts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
