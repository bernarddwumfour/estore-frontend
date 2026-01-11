// wishlist-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistStore {
  wishlist: string[]
  hasHydrated: boolean
  
  // Actions
  setHasHydrated: (state: boolean) => void
  setWishlist: (variantIds: string[]) => void
  addToWishlist: (variantId: string) => void
  removeFromWishlist: (variantId: string) => void
  clearWishlist: () => void
  
  // Getters
  isInWishlist: (variantId: string) => boolean
  getWishlistCount: () => number
}

const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state })
      },

      setWishlist: (variantIds) => set({ wishlist: variantIds }),

      addToWishlist: (variantId) =>
        set((state) => {
          if (state.wishlist.includes(variantId)) {
            return state
          }
          return { wishlist: [...state.wishlist, variantId] }
        }),

      removeFromWishlist: (variantId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((id) => id !== variantId),
        })),

      clearWishlist: () => set({ wishlist: [] }),

      isInWishlist: (variantId) => {
        return get().wishlist.includes(variantId)
      },

      getWishlistCount: () => {
        return get().wishlist.length
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

// Selector hooks - FOLLOWING CART STORE PATTERN
export const useWishlist = () => useWishlistStore((state) => state.wishlist)
export const useWishlistHydrated = () => useWishlistStore((state) => state.hasHydrated)

// Check cart-store.ts - they DON'T have a useCartActions hook!
// They use individual hooks or direct access:
export const useIsInWishlist = (variantId: string) => 
  useWishlistStore((state) => state.isInWishlist(variantId))

// For actions, either:
// 1. Use direct store access (like cart store does)
export const addToWishlist = (variantId: string) => 
  useWishlistStore.getState().addToWishlist(variantId)

export const removeFromWishlist = (variantId: string) => 
  useWishlistStore.getState().removeFromWishlist(variantId)

// 2. Or create individual action hooks
export const useAddToWishlist = () => useWishlistStore((state) => state.addToWishlist)
export const useRemoveFromWishlist = () => useWishlistStore((state) => state.removeFromWishlist)
export const useClearWishlist = () => useWishlistStore((state) => state.clearWishlist)
export const useSetWishlist = () => useWishlistStore((state) => state.setWishlist)