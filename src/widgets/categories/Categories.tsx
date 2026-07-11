import { ArrowUpRight } from 'lucide-react'
import { endpoints } from '@/constants/endpoints/endpoints'
import Image from 'next/image'
import Link from 'next/link'
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
  searchParams?: ProductsPageProps
}

async function getCategories() {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')}${endpoints.products.listCategories}`)

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories']
      }
    })

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

// Loading component matching clean design style
function CategoriesLoading() {
  return (
    <section className="relative py-4">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">Loading Filters</span>
        <Spinner size='sm' />
      </div>
    </section>
  )
}

export default async function Categories({
  type = "withImage",
  searchParams
}: CategoriesProps) {
  try {
    const resolvedSearchParams = await searchParams;
    const currentCategorySlug = resolvedSearchParams?.category;
    const categories = await getCategories();

    if (categories.length === 0) {
      return (
        <section className="relative py-6">
          <div className="container mx-auto text-center">
            <p className="text-sm font-medium text-slate-400">No categories available at the moment.</p>
          </div>
        </section>
      )
    }

    return (
      <section className="relative w-full">
        <div className="container mx-auto px-4 lg:px-8">

          {type === "withImage" ? (
            /* Premium Bento/Grid Style Categories (Modulive Grid Concept) */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="block group"
                >
                  <div className="relative overflow-hidden bg-[#f8f9fa] rounded-[2rem] border border-slate-100 p-5 aspect-[6/5] flex flex-col justify-between transition-all duration-300 hover:bg-[#f1f3f5]">

                    <div className="w-8 h-8 absolute top-6 right-6 rounded-full bg-white text-slate-950 flex items-center justify-center border border-slate-100 shadow-sm opacity-0 transform translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>

                    {/* Centered Graphic Media Element Context */}
                    <div className="relative w-full h-full my-auto flex items-center justify-center mix-blend-multiply transition-transform duration-500 group-hover:scale-102">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain max-h-full max-w-full"
                      // sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>

                    {/* Lower Identification Context Labels */}
                    <div className="pt-2 border-t border-slate-200/40">
                      <h3 className="text-sm font-extrabold text-slate-950 tracking-tight transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Modulive Centered Horizontal Filter Row Style */
            <div className="flex flex-wrap items-center justify-start gap-2.5 max-w-3xl  py-4">

              {/* Universal "All" Selector Item */}
              <Link href="/products" scroll={false}>
                <span className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border ${!currentCategorySlug
                  ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                  }`}>
                  All
                </span>
              </Link>

              {/* Dynamic Categorized Collection Elements */}
              {categories.map((category) => {
                const isCurrentCategory = category.slug === currentCategorySlug

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    scroll={false}
                  >
                    <span className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border ${isCurrentCategory
                      ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                      }`}>
                      {category.name}
                    </span>
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

    return (
      <section className="relative py-8">
        <div className="container mx-auto text-center">
          <p className="text-sm font-semibold text-destructive mb-3">Failed to load categories</p>
          <Link href="/products">
            <Button variant="outline" size="sm" className="rounded-full">
              Try Again
            </Button>
          </Link>
        </div>
      </section>
    )
  }
}