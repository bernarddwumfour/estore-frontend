// Furniture store products listing — furniture-themed header + category pills.
// Filters and the products grid stay shared (the grid already renders the
// furniture ProductCard via the template registry).
import { Suspense } from "react";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import ProductsGridWrapper from "@/app/(web)/products/(components)/ProductsGridWrapper";
import { AdvancedFilters } from "@/widgets/AdvancedFilters/AdvancedFilters";
import Categories from "../components/Categories";
import PageHeader from "../components/PageHeader";
import type { ProductsPageProps } from "../../contract";

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="Our Products"
        title="Find the Perfect Furniture"
        description="Browse our full collection — filter by category, price and more to discover pieces made for the way you live."
      />

      {/* Furniture-themed category pills (active state from the URL). */}
      <section className="container mx-auto px-4 pt-8 lg:px-8">
        <Suspense fallback={<div className="h-12" />}>
          <Categories searchParams={searchParams} />
        </Suspense>
      </section>

      {/* Filters + grid */}
      <section className="container mx-auto px-4 py-12 lg:px-8">
        <Suspense fallback={<ProductsGridSkeleton />}>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-shrink-0 lg:sticky lg:top-32 lg:h-fit lg:w-[280px] lg:rounded-2xl lg:border lg:border-[#e7e1d3] lg:p-4 xl:w-[300px]">
              <AdvancedFilters />
            </div>
            <div className="min-w-0 flex-1">
              <ProductsGridWrapper searchParams={searchParams} />
            </div>
          </div>
        </Suspense>
      </section>
    </div>
  );
}
