// types/blogTypes.ts

export interface BlogCategoryType {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPostType {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: string;
  is_featured: boolean;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPostType extends BlogPostType {
  status: "draft" | "published" | "archived";
  author_user_id: string | null;
  author_name: string;
}
