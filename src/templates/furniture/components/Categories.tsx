// Furniture-themed category pills (no images) shown under "Our Products
// Collections". Fetches real categories and links each to the filtered
// products page. Green active "All" pill to match the furniture palette.
import Link from "next/link";
import { endpoints } from "@/constants/endpoints/endpoints";

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoints.products.listCategories}`
    );
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600, tags: ["categories"] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data?.categories)) return [];
    return data.data.categories as Category[];
  } catch (err) {
    console.error("Error fetching furniture categories:", err);
    return [];
  }
}

const active = "inline-flex rounded-full bg-[#3f4d2c] px-4 py-2 text-sm font-bold text-[#f6f3ec]";
const idle =
  "inline-flex rounded-full border border-[#e7e1d3] bg-white px-4 py-2 text-sm font-bold text-[#2b2b22] transition-colors hover:border-[#3f4d2c] hover:text-[#3f4d2c]";

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
        <span className={current ? idle : active}>All Products</span>
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`/products?category=${c.slug}`} scroll={false}>
          <span className={c.slug === current ? active : idle}>{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
