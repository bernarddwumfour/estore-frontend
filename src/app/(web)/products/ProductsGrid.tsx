// app/(web)/products/(components)/ProductsGrid.tsx
import { ProductType } from "@/types/productTypes"
import { T } from "@/templates/registry"
import { endpoints } from "@/constants/endpoints/endpoints"

interface ProductsGridProps {
  category?: string,
  brand?: string,
  min_price?: number,
  max_price?: number,
  in_stock?: boolean,
  featured?: boolean,
  bestseller?: boolean,
  new?: boolean,
  sort_by?: string,
  sort_order?: string,
  search?: string,
  endpoint?: string,
  page?: number,
  limit?: number
}

async function getProducts(filters: {
  category?: string,
  brand?: string,
  min_price?: number,
  max_price?: number,
  in_stock?: boolean,
  featured?: boolean,
  bestseller?: boolean,
  new?: boolean,
  sort_by?: string,
  sort_order?: string,
  search?: string,
  endpoint?: string,
  page?: number,
  limit?: number
}) {
  try {
    const params = new URLSearchParams()

    // Add all filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && key !== 'endpoint') {
        if (typeof value === 'boolean') {
          params.set(key, String(value))
        } else {
          params.set(key, String(value))
        }
      }
    })

    // Set defaults if not provided
    if (!params.has('limit')) params.set('limit', '20')
    if (!params.has('page')) params.set('page', '1')
    if (!params.has('sort_by')) params.set('sort_by', 'created_at')
    if (!params.has('sort_order')) params.set('sort_order', 'desc')

    // Fix URL construction
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000'
    const apiPath = filters.endpoint || endpoints.products.listProductsWeb

    const fullUrl = `${baseUrl.replace(/\/$/, '')}/${apiPath.replace(/^\//, '')}`
    const url = new URL(fullUrl)
    url.search = params.toString()

    console.log('Fetching products with params:', url.toString())

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 300,
        tags: ['products', filters.category ? `products-${filters.category}` : 'all-products']
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    console.log("Products response =>", data)

    if (!data.success) {
      throw new Error(data.error || "Failed to load products")
    }

    return {
      products: data.data.products || [],
      pagination: data.data.pagination || {
        current_page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export default async function ProductsGrid({
  category,
  brand,
  min_price,
  max_price,
  in_stock,
  featured,
  bestseller,
  new: isNew,
  sort_by = "created_at",
  sort_order = "desc",
  search,
  endpoint,
  page = 1,
  limit = 20
}: ProductsGridProps) {
  let products: ProductType[] = []
  let pagination: any = null
  let error: string | null = null

  try {
    const result = await getProducts({
      category,
      brand,
      min_price,
      max_price,
      in_stock,
      featured,
      bestseller,
      new: isNew,
      sort_by,
      sort_order,
      search,
      endpoint,
      page,
      limit
    })
    products = result.products
    pagination = result.pagination
  } catch (err: any) {
    error = err.message || "Failed to load products"
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
      </div>
    )
  }

  // Handle empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {category
            ? `No products found in "${category}" category`
            : search
              ? `No products found for "${search}"`
              : "No products available at the moment"
          }
        </p>
        {(category || search || brand || min_price !== undefined || max_price !== undefined || in_stock || featured || bestseller || isNew) && (
          <button
            onClick={() => window.location.href = '/products'}
            className="mt-4 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-8">
      {category && !search && (
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-semibold capitalize">
            {category.replace(/-/g, ' ')}
          </h2>
        </div>
      )}

      {search && (
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-semibold">
            Results for "{search}"
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {pagination?.total || 0} products found
          </p>
        </div>
      )}

      <ul className="grid gap-2 md:gap-4 gap-y-12 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 px-4">
        {products.map((product: ProductType) => (
          <T.ProductCard product={product} key={product.id} />
        ))}
      </ul>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            {pagination.has_previous && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set('page', String(pagination.current_page - 1))
                  window.location.href = `/products?${params.toString()}`
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
            )}

            <span className="px-4 py-2 text-sm text-slate-600">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>

            {pagination.has_next && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set('page', String(pagination.current_page + 1))
                  window.location.href = `/products?${params.toString()}`
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}