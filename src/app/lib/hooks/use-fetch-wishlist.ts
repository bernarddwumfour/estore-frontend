// use-fetch-wishlist.ts — fetches and hydrates wishlist from API
"use client"
import { useEffect, useRef, useState } from 'react'
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
  const { user, tokens } = useAuth()
  const [tokenReady, setTokenReady] = useState(false)


  const query = useQuery({
    queryKey: [endpoints.products.listWishList],
    queryFn: async () => {
      const response = await securityAxios.get(endpoints.products.listWishList)
      return response.data
    },
    enabled: enabled && hasHydrated && tokenReady,
    staleTime: 1000 * 60 * 5,
  })


  // Wait for token to be available
  useEffect(() => {
    if (tokens?.access_token) {
      setTimeout(() => {
        setTokenReady(true)
      }, 300)
    }
  }, [tokens?.access_token])


  useEffect(() => {

    if (!user?.id) {
      setWishlist([])
      return
    }

    if (query.data && hasHydrated) {
      console.log("QUERY", query)
      const variantIds = query.data.data.items.map((item: any) => item.variant.id)
      setWishlist(variantIds)
    }
  }, [query.data, hasHydrated, setWishlist, user])

  return query
}