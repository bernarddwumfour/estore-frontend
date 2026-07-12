// Thin route shell: fetches blog posts server-side and passes them to the
// active store template for rendering.
import { T } from "@/templates/registry";
import { endpoints } from "@/constants/endpoints/endpoints";
import type { BlogPostType } from "@/types/blogTypes";

interface BlogListApiResponse {
  success: boolean;
  data: {
    posts: BlogPostType[];
    total: number;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
      next_page: number | null;
      previous_page: number | null;
    };
  };
}

async function getPosts(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<{ posts: BlogPostType[]; pagination: BlogListApiResponse["data"]["pagination"] | null }> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
      "http://localhost:8000/api";

    const params = new URLSearchParams();
    const page = searchParams.page;
    const search = searchParams.search;
    const category = searchParams.category;

    if (page && typeof page === "string") params.set("page", page);
    if (search && typeof search === "string") params.set("search", search);
    if (category && typeof category === "string") params.set("category", category);

    const qs = params.toString();
    const url = `${baseUrl}${endpoints.blog.listPostsWeb}${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, { next: { revalidate: 300, tags: ["blog-posts"] } });
    if (!res.ok) return { posts: [], pagination: null };

    const json: BlogListApiResponse = await res.json();
    if (!json.success) return { posts: [], pagination: null };

    return { posts: json.data.posts, pagination: json.data.pagination };
  } catch {
    return { posts: [], pagination: null };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const { posts, pagination } = await getPosts(resolved);
  return <T.BlogPage posts={posts} pagination={pagination} />;
}
