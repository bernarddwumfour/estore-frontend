import { Suspense } from "react";
import ProductsGridSkeleton from "@/app/(web)/products/(components)/ProductsGridSkeleton";
import ProductsGridWrapper from "@/app/(web)/products/(components)/ProductsGridWrapper";
import { AdvancedFilters } from "@/widgets/advanced-filters/AdvancedFilters";
import ProductFiltersSkeleton from "@/widgets/advanced-filters/ProductFiltersSkeleton";
import Categories, { CategoriesSkeleton } from "../components/Categories";
import type { ProductsPageProps } from "../../contract";
import PageHeader from "../components/PageHeader";

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <div className="min-h-screen bg-[#fffdf9] text-[#24211f]"><PageHeader subtitle="The Amammre Wears collection" title="Find your own kind of elegance." description="Explore pieces for everyday moments and special occasions." /><section className="mx-auto max-w-[1440px] px-5 pt-10 sm:px-8 lg:px-12"><Suspense fallback={<CategoriesSkeleton />}><Categories searchParams={searchParams} /></Suspense></section><section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-6 lg:flex-row"><aside className="shrink-0 lg:sticky lg:top-28 lg:h-fit lg:w-[280px] lg:rounded-xl lg:border lg:border-[#eee9e2] lg:bg-white lg:p-4"><Suspense fallback={<ProductFiltersSkeleton />}><AdvancedFilters /></Suspense></aside><div className="min-w-0 flex-1"><Suspense fallback={<ProductsGridSkeleton />}><ProductsGridWrapper searchParams={searchParams} /></Suspense></div></div></section></div>;
}
