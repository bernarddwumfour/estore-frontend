import { ProductType } from "@/types/productTypes"
import Product from "./Product"
import { endpoints } from "@/constants/endpoints/endpoints"

interface ProductsGridProps {
  category?: string,
  endpoint?:string
}

async function getProducts(category?: string,endpoint?:string) {
  try {
    const params = new URLSearchParams({
      limit: '20',
      category: category || ""
    })

    // Fix URL construction
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const apiPath = endpoint || endpoints.products.listProductsWeb

    // Ensure we don't have double slashes
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/${apiPath.replace(/^\//, '')}`
    const url = new URL(fullUrl)
    url.search = params.toString()

    console.log('Fetching from:', url.toString())

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 300,
        tags: ['products', category ? `products-${category}` : 'all-products']
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to load products")
    }

    return data.data || []
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export default async function ProductsGrid({ category,endpoint }: ProductsGridProps) {
  let products: ProductType[] = []
  let error: string | null = null

  try {
    products = await getProducts(category,endpoint)
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
            : "No products available at the moment"
          }
        </p>
      </div>
    )
  }

  // Render products grid
  return (
    <div className="mt-8">
      {category && (
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-semibold capitalize">
            {category.replace(/-/g, ' ')}
          </h2>
        </div>
      )}

      <ul className="grid gap-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 px-4">
        {products.map((product: ProductType) => (
          <Product product={product} key={product.id} />
        ))}
      </ul>
    </div>
  )
}