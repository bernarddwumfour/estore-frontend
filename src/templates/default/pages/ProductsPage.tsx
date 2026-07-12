import { Suspense } from 'react';
import Categories from '@/widgets/categories/Categories';
import ProductsGridSkeleton from '@/app/(web)/products/(components)/ProductsGridSkeleton';
import ProductsGridWrapper from '@/app/(web)/products/(components)/ProductsGridWrapper';
import { AdvancedFilters } from '@/widgets/advanced-filters/AdvancedFilters';
import PageHeader from '../components/PageHeader';
import type { ProductsPageProps } from '../../contract';

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div>
      <PageHeader
        subtitle="Explore Our Products"
        title="Find the perfect products for your needs."
      />
      <div className="mx-auto container py-12">

        {/* Pass the resolved object down to your component */}
        <Categories type='badge' searchParams={searchParams} />

        <Suspense fallback={<ProductsGridSkeleton />}>
          {/* Products with Filters Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 pt-6">
            {/* Filters Sidebar - Hidden on mobile, shown on desktop */}
            <div className="lg:sticky lg:top-32 lg:shadow-md lg:p-4 lg:rounded-md lg:h-fit lg:w-[280px] xl:w-[300px] flex-shrink-0">
              <AdvancedFilters />
            </div>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              <ProductsGridWrapper searchParams={searchParams} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
