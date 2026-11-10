// Furniture-themed category pills shown under "Our Products
// Collections". Fetches real categories and links each to the filtered
// products page. Green active "All" pill to match the furniture palette.
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { endpoints } from "@/constants/endpoints/endpoints";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')}${endpoints.products.listCategories}`
    );
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data?.categories)) return [];
    return data.data.categories as Category[];
  } catch (err) {
    console.error("Error fetching furniture categories:", err);
    return [];
  }
}

const active = "inline-flex items-center gap-2 rounded-full bg-[#654035] px-3 py-2 text-sm font-bold text-[#f6f3ec]";
const idle =
  "inline-flex items-center gap-2 rounded-full border border-[#e7e1d3] bg-white px-3 py-2 text-sm font-bold text-[#2b2b22] transition-colors hover:border-[#654035] hover:text-[#654035]";

export default async function Categories({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const categories = await getCategories();
  const current = searchParams?.category;

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link href="/products" scroll={false}>
        <span className={current ? idle : active}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6f3ec] text-[#654035]">
            <LayoutGrid aria-hidden="true" className="h-4 w-4" />
          </span>
          All Products
        </span>
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`/products?category=${c.slug}`} scroll={false}>
          <span className={c.slug === current ? active : idle}>
            {c.image && (
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f6f3ec]">
                <Image src={c.image} alt="" fill sizes="32px" className="object-cover" />
              </span>
            )}
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
