import { Suspense } from "react";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import ProductsGridWrapper from "@/app/(web)/products/(components)/ProductsGridWrapper";
import { AdvancedFilters } from "@/widgets/advanced-filters/AdvancedFilters";
import Categories, { CategoriesSkeleton } from "../components/Categories";
import PageHeader from "../../default/components/PageHeader";
import type { ProductsPageProps } from "../../contract";

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#39271f]">
      <PageHeader
        subtitle="The beauty collection"
        title="Find your everyday ritual."
        description="Explore our skincare and beauty essentials, selected to make a little time for yourself feel even better."
      />

      <section className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <Suspense fallback={<CategoriesSkeleton />}>
          <Categories searchParams={searchParams} />
        </Suspense>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <Suspense fallback={<ProductsGridSkeleton />}>
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="flex-shrink-0 lg:sticky lg:top-28 lg:h-fit lg:w-[280px] lg:border lg:border-[#eee5dd] lg:bg-white lg:p-4 xl:w-[300px]">
              <AdvancedFilters />
            </aside>
            <div className="min-w-0 flex-1">
              <ProductsGridWrapper searchParams={searchParams} />
            </div>
          </div>
        </Suspense>
      </section>
    </div>
  );
}
