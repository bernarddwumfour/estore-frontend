'use client'

import { useState } from 'react'
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import securityAxios from '@/axios-instances/SecurityAxios'
import { endpoints } from '@/constants/endpoints/endpoints'
import { useAuth } from '@/lib/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist, 
  useWishlistHydrated 
} from '@/app/lib/store/wishlist-store'

interface AddToWishListProps {
  variantId: string
  productTitle?: string
}

const AddToWishList = ({ variantId, productTitle }: AddToWishListProps) => {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const wishlist = useWishlist()
  const hasHydrated = useWishlistHydrated()
  const addToWishlist = useAddToWishlist()  // Individual hook
  const removeFromWishlist = useRemoveFromWishlist()  // Individual hook

  // Derive isInWishlist from the full array
  const isInWishlist = wishlist.includes(variantId)

  const handleWishlistAction = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user?.id) {
      setShowLoginDialog(true)
      return
    }

    // Optional: Check if store is hydrated
    if (!hasHydrated) {
      console.log('Wishlist store not hydrated yet')
      return
    }

    try {
      setIsAdding(true)

      if (isInWishlist) {
        // Remove from wishlist
        const response = await securityAxios.delete(
          endpoints.products.removeFromWishList.replace(":id", variantId)
        )

        if (response.status === 200 || response.data.success) {
          toast.success(response.data.message || "Removed from wishlist!");
          
          // Use direct store access like cart store pattern
          removeFromWishlist(variantId)
          
          queryClient.invalidateQueries({ 
            queryKey: [endpoints.products.listWishList] 
          })
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const response = await securityAxios.post(
          endpoints.products.addToWishList,
          { variant_id: variantId },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.status === 201 || response.data.success) {
          toast.success(response.data.message || "Added to wishlist!");
          
          // Use direct store access like cart store pattern
          addToWishlist(variantId)
          
          queryClient.invalidateQueries({ 
            queryKey: [endpoints.products.listWishList] 
          })
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (error: any) {
      console.error("Error with wishlist action:", error)
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsAdding(false)
    }
  }

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLoginDialog(false)
    router.push('/login')
  }

  const handleSignup = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLoginDialog(false)
    router.push('/signup')
  }

  return (
    <>
      <button
        onClick={handleWishlistAction}
        disabled={isAdding || !hasHydrated}
        className="absolute flex gap-1 items-center bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={
          !hasHydrated ? 'Loading...' :
          isAdding ? 'Processing...' :
          isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
        }
      >
        <Heart
          className={`w-4 ${isInWishlist ? 'fill-primary stroke-primary' : ''} ${isAdding ? 'animate-pulse' : ''}`}
        />
      </button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              {productTitle
                ? `You need to be logged in to add "${productTitle}" to your wishlist.`
                : 'You need to be logged in to add items to your wishlist.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Create an account or login to save items to your wishlist, track your favorites, and get personalized recommendations.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowLoginDialog(false)
              }}
            >
              Continue Browsing
            </Button>
            <Button
              onClick={handleSignup}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Create Account
            </Button>
            <Button
              onClick={handleLogin}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddToWishList