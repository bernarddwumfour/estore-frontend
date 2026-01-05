"use client"

import { useState, useEffect, Suspense } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import unAuthenticatedAxios from '@/axios-instances/UnAuthenticatedAxios'
import { endpoints } from '@/constants/endpoints/endpoints'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
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
  image_url?: string
  image?: string
  created_at: string
}

type CategoriesDisplayType = "withImage" | "badge"

interface CategoriesProps {
  type?: CategoriesDisplayType
}

function Categories({ type = "withImage" }: CategoriesProps) {
  return (<Suspense fallback="">
    <CategoryComponent type={type}/>
  </Suspense>)
}

function CategoryComponent({ type = "withImage" }: CategoriesProps){
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get URL search params to check current category
  const searchParams = useSearchParams()
  const currentCategorySlug = searchParams.get('category')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await unAuthenticatedAxios.get(endpoints.products.listCategoriesWeb)

      if (response.data.success && Array.isArray(response.data.data?.categories)) {
        setCategories(response.data.data.categories)
      } else {
        setCategories([])
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (category: Category): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    if (category.image_url) {
      return category.image_url
    }

    if (category.image) {
      // Remove leading slash if present
      const imagePath = category.image.startsWith('/')
        ? category.image.slice(1)
        : category.image
      return `${baseUrl}/${imagePath}`
    }

    return '/placeholder.svg'
  }

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
        <p className="text-gray-600">
            Loading Categories. 
          </p>
          <Spinner size='sm'/>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && categories.length === 0) {
    return (
      <section className="relative">
        <div className="container mx-auto">
          <div className="py-8">

            <Button
              onClick={fetchCategories}
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

  if (categories.length === 0 && !loading) {
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
      <div className="container mx-auto pb-8">

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
                      src={getImageUrl(category)}
                      alt={category.name}
                      fill
                      className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
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
            <Link href={"/products"} >
            <Badge
              variant={!currentCategorySlug || currentCategorySlug == "" ? "default" : "outline"}
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
    </section >
  )
}

export default Categories