// app/products/page.tsx
import { Suspense } from 'react';
import Categories from '@/widgets/categories/Categories';
import ProductsGridSkeleton from './(components)/ProductsGridSkeleton';
import ProductsGridWrapper from './(components)/ProductsGridWrapper';
import { AdvancedFilters } from '@/widgets/AdvancedFilters/AdvancedFilters';
// import PromotionsCarousel from './(components)/Promotions/PromotionsCarousel';

// Define types for the page props (searchParams is a Promise in Next.js 15+)
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Products({ searchParams }: PageProps) {
  // Await the searchParams to get the actual object
  const resolvedSearchParams = await searchParams;

  return (
    <section className="relative py-28 bg-cover bg-center">
      <div className="mx-auto container">

        <div className="px-4 md:px-6">
          <div className="max-w-4xl space-y-4 pb-6 sm:pb-2 md:pb-4">
            <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
              Explore Our Products
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Find the perfect products {" "}
              <span className="text-slate-950 relative inline-block">
                for your needs.
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-slate-950/0 via-slate-950/40 to-slate-950/0 blur-xs"></span>
              </span>
            </h3>
          </div>

          {/* <PromotionsCarousel /> */}
        </div>

        {/* Pass the resolved object down to your component */}
        <Categories type='badge' searchParams={resolvedSearchParams} />

        <Suspense fallback={<ProductsGridSkeleton />}>
          {/* Products with Filters Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 pt-6">
            {/* Filters Sidebar - Hidden on mobile, shown on desktop */}
            <div className="lg:sticky lg:top-32 lg:shadow-md lg:p-4 lg:rounded-md lg:h-fit lg:w-[280px] xl:w-[300px] flex-shrink-0">
              <AdvancedFilters />
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              <ProductsGridWrapper searchParams={resolvedSearchParams} />
            </div>
          </div>
        </Suspense>
      </div>
    </section>
  );
}