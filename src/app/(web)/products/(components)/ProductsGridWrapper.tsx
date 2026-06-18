// app/(web)/products/page.tsx
import ProductsGrid from "../ProductsGrid"

// Define the type for Next.js Page Props
type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Await the searchParams promise directly
  const resolvedParams = await searchParams;

  // Extract all filter parameters
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const brand = typeof resolvedParams.brand === 'string' ? resolvedParams.brand : undefined;
  const min_price = resolvedParams.min_price ? parseFloat(String(resolvedParams.min_price)) : undefined;
  const max_price = resolvedParams.max_price ? parseFloat(String(resolvedParams.max_price)) : undefined;
  const in_stock = resolvedParams.in_stock === 'true' ? true : undefined;
  const featured = resolvedParams.featured === 'true' ? true : undefined;
  const bestseller = resolvedParams.bestseller === 'true' ? true : undefined;
  const newArrivals = resolvedParams.new === 'true' ? true : undefined;
  const sort_by = typeof resolvedParams.sort_by === 'string' ? resolvedParams.sort_by : 'created_at';
  const sort_order = typeof resolvedParams.sort_order === 'string' ? resolvedParams.sort_order : 'desc';
  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const page = resolvedParams.page ? parseInt(String(resolvedParams.page)) : 1;
  const limit = resolvedParams.limit ? parseInt(String(resolvedParams.limit)) : 20;

  console.log("ProductsPage params =>", {
    category,
    brand,
    min_price,
    max_price,
    in_stock,
    featured,
    bestseller,
    newArrivals,
    sort_by,
    sort_order,
    search,
    page,
    limit
  });

  return (
    <ProductsGrid
      category={category}
      brand={brand}
      min_price={min_price}
      max_price={max_price}
      in_stock={in_stock}
      featured={featured}
      bestseller={bestseller}
      new={newArrivals}
      sort_by={sort_by}
      sort_order={sort_order}
      search={search}
      page={page}
      limit={limit}
    />
  );
}