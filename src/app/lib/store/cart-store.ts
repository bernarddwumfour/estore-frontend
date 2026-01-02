// app/lib/store/cart-store.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string            // product.id (for grouping/display)
  sku: string           // unique variant identifier
  title: string
  price: number
  imageUrl: string
  quantity: number
  originalPrice?: number
  attributes: Record<string, string>  // e.g., { brand: "Sony", color: "Black", size: "40mm" }
}

interface CartStore {
  items: CartItem[]
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (sku: string) => void
  updateQuantity: (sku: string, quantity: number) => void
  clearCart: () => void

  // Getters
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (sku: string) => boolean
  getItemQuantity: (sku: string) => number
  getItemsByProductId: (productId: string) => CartItem[]
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state })
      },

      addItem: (newItem) => {
        const quantity = newItem.quantity || 1
        set((state) => {
          const existingItem = state.items.find((i) => i.sku === newItem.sku)

          if (existingItem) {
            // Increase quantity if same variant already exists
            return {
              items: state.items.map((i) =>
                i.sku === newItem.sku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          } else {
            // Add new variant
            return {
              items: [
                ...state.items,
                {
                  ...newItem,
                  quantity,
                } as CartItem,
              ],
            }
          }
        })
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        }))
      },

      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      isInCart: (sku) => {
        return get().items.some((item) => item.sku === sku)
      },

      getItemQuantity: (sku) => {
        const item = get().items.find((item) => item.sku === sku)
        return item ? item.quantity : 0
      },

      getItemsByProductId: (productId) => {
        return get().items.filter((item) => item.id === productId)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)