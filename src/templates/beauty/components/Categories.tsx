import Image from "next/image";
import Link from "next/link";
import { Flower2, LayoutGrid } from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
    const response = await fetch(`${baseUrl}${endpoints.products.listCategories}`, {
      next: { revalidate: 3600, tags: ["categories"] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.success && Array.isArray(data?.data?.categories)
      ? data.data.categories
      : [];
  } catch (error) {
    console.error("Error fetching beauty storefront categories:", error);
    return [];
  }
}

export function CategoriesSkeleton() {
  return (
    <section aria-label="Loading categories" aria-busy="true" className="flex flex-wrap justify-center gap-3">
      <span className="sr-only">Loading categories</span>
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-12 w-32 animate-pulse rounded-full border border-[#eee5dd] bg-[#f8f3ed]" />)}
    </section>
  );
}

function CategoryChip({
  href,
  name,
  image,
  active,
  all = false,
}: {
  href: string;
  name: string;
  image?: string | null;
  active: boolean;
  all?: boolean;
}) {
  return (
    <Link href={href} scroll={false} aria-current={active ? "page" : undefined} className="group block">
      <span className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${active ? "border-[#39271f] bg-[#39271f] text-[#fffaf5]" : "border-[#e9dfd6] bg-white text-[#57463b] hover:border-[#9b5c40] hover:text-[#92583e]"}`}>
        <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${active ? "bg-[#f1e5dc] text-[#92583e]" : "bg-[#f8f3ed] text-[#9b5c40]"}`}>
          {image ? (
            <Image src={image} alt="" fill sizes="32px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            all ? <LayoutGrid className="h-4 w-4" aria-hidden="true" /> : <Flower2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
        <span className="whitespace-nowrap">{name}</span>
      </span>
    </Link>
  );
}

export default async function Categories({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categories = await getCategories();
  const current = typeof searchParams.category === "string" ? searchParams.category : undefined;

  return (
    <section aria-label="Shop by category">
      {categories.length === 0 ? (
        <p className="border border-[#eee5dd] bg-[#f8f3ed] px-5 py-6 text-center text-sm text-[#75665b]">Categories will appear here when they’re available.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          <CategoryChip href="/products" name="All products" active={!current} all />
          {categories.map((category) => (
            <CategoryChip key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} name={category.name} image={category.image} active={category.slug === current} />
          ))}
        </div>
      )}
    </section>
  );
}
