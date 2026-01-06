// app/products/page.tsx
import { Suspense } from 'react';
import Categories from '@/widgets/categories/Categories';
import ProductsGridSkeleton from './(components)/ProductsGridSkeleton';
import ProductsGridWrapper from './(components)/ProductsGridWrapper';

// Define types for the page props (searchParams is a Promise in Next.js 15+)
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Products({ searchParams }: PageProps) {
  // Await the searchParams to get the actual object
  const resolvedSearchParams = await searchParams;

  return (
    <section className="relative py-32 bg-cover bg-center">
      <div className="mx-auto container">
        <div className="py-6 px-4">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">
            Explore Our Catalogue
          </h1>
          <p className="text-gray-600">
            Find the perfect products for your needs.
          </p>
        </div>
        
        {/* Pass the resolved object down to your component */}
        <Categories type='badge' searchParams={resolvedSearchParams} />

        <Suspense fallback={<ProductsGridSkeleton />}>
          {/* Also pass them to the wrapper if it needs to filter products */}
          <ProductsGridWrapper searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </section>
  );
}
