// app/(web)/products/page.tsx
import ProductsGrid from "../ProductsGrid"

// Define the type for Next.js Page Props
type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Await the searchParams promise directly
  const resolvedParams = await searchParams;
  
  // Extract the 'category' from the resolved object
  const currentCategorySlug = typeof resolvedParams.category === 'string' 
    ? resolvedParams.category 
    : undefined;

  console.log("CATEGORY from searchParams =>", currentCategorySlug);

  return <ProductsGrid category={currentCategorySlug} />;
}
