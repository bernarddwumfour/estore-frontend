// app/products/ProductsGridSkeleton.tsx
const ProductsGridSkeleton = () => {
  return (
    <div className="mt-8 px-4">
      <div className="grid gap-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>

            <div className="flex">
              <div className="h-10 bg-gray-200 w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsGridSkeleton