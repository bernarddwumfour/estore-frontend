import { ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { endpoints } from '@/constants/endpoints/endpoints'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Spinner from '../loaders/Spinner'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  parent_id?: string
  parent_name?: string
  is_active: boolean
  product_count: number
  image: string
  created_at: string
}

type CategoriesDisplayType = "withImage" | "badge"


interface ProductsPageProps {
    category?: string 
}

interface CategoriesProps {
  type?: CategoriesDisplayType
  searchParams?: ProductsPageProps // Pass from parent
}

async function getCategories() {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL?.slice(0,-1)}${endpoints.products.listCategoriesWeb}`)
    

    console.log("URL : ",url)

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories']
      }
    })

    console.log("CATEGORIES",response)

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !Array.isArray(data.data?.categories)) {
      throw new Error('Invalid response format')
    }

    return data.data.categories as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Error component for client-side retry
function CategoriesError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="relative">
      <div className="container mx-auto">
        <div className="py-8">
          <Button
            onClick={onRetry}
            variant="default"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    </section>
  )
}

// Loading component
function CategoriesLoading() {
  return (
    <section className="relative">
      <div className="container mx-auto">
        <div className="flex items-center gap-2">
          <p className="text-gray-600">
            Loading Categories.
          </p>
          <Spinner size='sm' />
        </div>
      </div>
    </section>
  )
}

export default async function Categories({ 
  type = "withImage", 
  searchParams 
}: CategoriesProps) {
  try {
    // 1. You MUST await searchParams in Next.js 15+
    const resolvedSearchParams = await searchParams; 
    console.log(resolvedSearchParams)
    
    // 2. Now you can safely access the property
    const currentCategorySlug = resolvedSearchParams?.category;

    const categories = await getCategories();

    if (categories.length === 0) {
      return (
        <section className="relative">
          <div className="container mx-auto">
            <p className="text-gray-600">
              No categories available at the moment.
            </p>
          </div>
        </section>
      )
    }

    return (
      <section className="relative bg-center">
        <div className="container mx-auto px-4 pb-8">

          {type === "withImage" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="block"
                >
                  <div className="relative overflow-hidden group cursor-pointer h-58 p-4 flex justify-center items-end transition-all duration-300 ">
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        // onError={(e) => {
                        //   const target = e.target as HTMLImageElement
                        //   target.src = '/placeholder.svg'
                        // }}
                      />
                    </div>

                    <div className="relative overflow-hidden w-full mb-6 bg-stone-200 p-6 z-[2] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-serif">
                          {category.parent_name || 'Apple Products'}
                        </p>
                        <h3 className="text-2xl font-serif mb-2 group-hover:text-stone-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {category.product_count} Product
                          {category.product_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link href="/products">
                <Badge
                  variant={!currentCategorySlug ? "default" : "outline"}
                  className="px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  All
                </Badge>
              </Link>

              {categories.map((category) => {
                const isCurrentCategory = category.slug === currentCategorySlug

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                  >
                    <Badge
                      variant={isCurrentCategory ? "default" : "outline"}
                      className="px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error in Categories component:', error)
    
    // Return error component that can be refreshed by parent
    return (
      <section className="relative">
        <div className="container mx-auto">
          <div className="py-8">
            <p className="text-destructive mb-4">Failed to load categories</p>
            <Link href="/products">
              <Button variant="default">
                Try Again
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }
}