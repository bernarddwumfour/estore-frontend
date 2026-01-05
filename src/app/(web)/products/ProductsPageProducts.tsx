"use client"
import { useSearchParams } from "next/navigation"
import ProductsGrid from "./ProductsGrid"
import { Suspense } from "react"

const ProductsPageProducts = () => {
  const searchParams = useSearchParams()
  const currentCategorySlug = searchParams.get('category')

  return (
      <ProductsGrid category={ currentCategorySlug?String(currentCategorySlug):undefined} searchParams={searchParams.toString()}/>

  )
}

export default ProductsPageProducts