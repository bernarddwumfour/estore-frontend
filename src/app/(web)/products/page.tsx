// Thin route shell: the products listing composition comes from the active
// store template (selected by NEXT_PUBLIC_STORE). Look lives in
// src/templates/<store>/ProductsPage.tsx. Data fetching, filters and the grid
// stay shared.
import { T } from "@/templates/registry";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Products({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  return <T.ProductsPage searchParams={resolvedSearchParams} />;
}
