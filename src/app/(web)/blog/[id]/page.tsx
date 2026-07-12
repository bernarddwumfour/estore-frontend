// Server component: fetches a single blog post by slug and renders it
// via the active store template's BlogPostPage slot.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { T } from "@/templates/registry";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { BlogPostType } from "@/types/blogTypes";

interface PostApiResponse {
  success: boolean;
  data: BlogPostType;
}

async function getPost(slug: string): Promise<BlogPostType | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
      "http://localhost:8000/api";

    const apiPath = endpoints.blog.postDetailsWeb.replace(":slug", slug);
    const url = `${baseUrl}${apiPath}`;

    const res = await fetch(url, {
      next: { revalidate: 300, tags: [`blog-${slug}`] },
    });
    if (!res.ok) return null;

    const json: PostApiResponse = await res.json();
    if (!json.success) return null;

    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: "article",
      publishedTime: post.published_at || undefined,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) {
    notFound();
  }

  return <T.BlogPostPage post={post} />;
}
