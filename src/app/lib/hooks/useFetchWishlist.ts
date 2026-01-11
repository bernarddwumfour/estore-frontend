// useFetchWishlist.ts - Alternative with individual hook
"use client"
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useWishlistHydrated,
  useSetWishlist // If you created this hook
} from '../store/wishlist-store'
import securityAxios from '@/axios-instances/SecurityAxios'
import { endpoints } from '@/constants/endpoints/endpoints'
import { useAuth } from '@/lib/use-auth'

export const useFetchWishlist = (enabled = true) => {
  const hasHydrated = useWishlistHydrated()
  const setWishlist = useSetWishlist()
  const { user } = useAuth()


  const query = useQuery({
    queryKey: [endpoints.products.listWishList],
    queryFn: async () => {
      const response = await securityAxios.get(endpoints.products.listWishList)
      return response.data
    },
    enabled: enabled && hasHydrated,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {

    if (!user?.id) {
      setWishlist([])
      return
    }
    
    if (query.data && hasHydrated) {
      const variantIds = query.data.data.items.map((item: any) => item.default_variant.id)
      setWishlist(variantIds)
    }
  }, [query.data, hasHydrated, setWishlist,user])

  return query
}