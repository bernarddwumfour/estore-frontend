"use client"
import { useAuth } from '@/lib/use-auth'
import { useFetchWishlist } from '../lib/hooks/use-fetch-wishlist'
import { useSetWishlist } from '../lib/store/wishlist-store'

export const WishlistInitializer = () => {
  const setWishlist = useSetWishlist()

  useFetchWishlist()
  
  return null
}