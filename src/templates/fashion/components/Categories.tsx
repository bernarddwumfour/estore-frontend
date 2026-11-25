import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, LayoutGrid } from "lucide-react";
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
    console.error("Error fetching fashion storefront categories:", error);
    return [];
  }
}

export function CategoriesSkeleton() {
  return (
    <section aria-label="Loading categories" aria-busy="true" className="flex flex-wrap justify-center gap-3">
      <span className="sr-only">Loading categories</span>
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-12 w-32 animate-pulse rounded-full border border-[#e9e1d7] bg-[#f6f3ee]" />)}
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
      <span className={`inline-flex items-center gap-2 rounded-full border p-1.5 text-sm font-semibold transition-colors ${active ? "border-[#ad8a60] bg-[#ad8a60] text-white" : "border-[#e9e1d7] bg-white text-[#5f5953] hover:border-[#ad8a60] hover:text-[#92704a]"}`}>
        <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${active ? "bg-[#f2eee8] text-[#92704a]" : "bg-[#f6f3ee] text-[#ad8a60]"}`}>
          {image ? (
            <Image src={image} alt="" fill sizes="32px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            all ? <LayoutGrid className="h-4 w-4" aria-hidden="true" /> : <ShoppingBag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
        <span className="whitespace-nowrap pr-1.5">{name}</span>
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
        <p className="border border-[#e9e1d7] bg-[#f6f3ee] px-5 py-6 text-center text-sm text-[#77716b]">Categories will appear here when they’re available.</p>
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
