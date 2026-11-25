import Image from "next/image";
import Link from "next/link";
import type { BlogPostPageProps } from "../../contract";
import PageHeader from "../components/PageHeader";

export default function BlogPostPage({ post }: BlogPostPageProps) {
  return <div className="min-h-screen bg-[#fffdf9] text-[#24211f]"><PageHeader subtitle={post.category?.name || "The fashion journal"} title={post.title} /><section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">{post.cover_image_url && <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-[#eee9e2]"><Image src={post.cover_image_url} alt={post.title} fill sizes="(max-width: 900px) 100vw, 900px" className="object-cover" /></div>}<p className="mb-8 text-xs text-[#8a8179]">{post.author}{post.published_at && ` · ${new Date(post.published_at).toLocaleDateString()}`}</p><article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} /><Link href="/blog" className="mt-10 inline-flex text-sm font-semibold text-[#92704a]">← Back to the journal</Link></section></div>;
}
