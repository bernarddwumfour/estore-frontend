// use-fetch-wishlist.ts — fetches and hydrates wishlist from API
"use client"
import { useEffect, useState } from 'react'
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
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error('The store API is not configured for this deployment.')
      }
      const response = await securityAxios.get(endpoints.products.listWishList)
      const payload = response.data
      if (!Array.isArray(payload?.data?.items)) {
        throw new Error('The wishlist service returned an invalid response.')
      }
      return payload
    },
    enabled: enabled && hasHydrated && tokenReady && Boolean(user?.id),
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

    if (Array.isArray(query.data?.data?.items) && hasHydrated) {
      const variantIds = query.data.data.items.flatMap((item: { variants?: Array<{ id?: string }>; variant?: { id?: string } }) =>
        (item.variants?.length ? item.variants : item.variant ? [item.variant] : [])
          .map(variant => variant.id)
          .filter((id): id is string => typeof id === 'string')
      )
      setWishlist(variantIds)
    }
  }, [query.data, hasHydrated, setWishlist, user])

  return query
}
