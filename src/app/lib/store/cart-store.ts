import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface BundleItem {
  id: string
  sku: string
  title: string
  price: number
  quantity: number
  imageUrl: string
  variantId: string
}

export interface CartItem {
  id: string
  sku: string
  title: string
  price: number
  slug: string
  imageUrl: string
  quantity: number
  originalPrice?: number
  attributes: Record<string, string>
  variantId: string
  // Bundle-specific fields
  isBundle?: boolean
  bundleId?: string
  bundleItems?: BundleItem[]
}

const matchesCartIdentity = (item: CartItem, key: string, items: CartItem[]) =>
  items.some((candidate) => candidate.variantId === key)
    ? item.variantId === key
    : item.sku === key

interface CartStore {
  items: CartItem[]
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  addBundle: (bundle: Omit<CartItem, 'quantity' | 'isBundle' | 'sku'> & { quantity?: number }) => void
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
          // Public SKUs are masked and can collide across sibling variants.
          // A concrete variant ID is the cart identity whenever available.
          const matchesItem = (item: CartItem) =>
            newItem.variantId && item.variantId
              ? item.variantId === newItem.variantId
              : item.sku === newItem.sku
          const existingItem = state.items.find(matchesItem)

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                matchesItem(i)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          } else {
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

      // Add bundle as a single item with nested items
      addBundle: (bundle) => {
        const quantity = bundle.quantity || 1
        const bundleSku = `bundle_${bundle.bundleId}`

        set((state) => {
          const existingBundle = state.items.find((i) => i.sku === bundleSku)

          if (existingBundle) {
            return {
              items: state.items.map((i) =>
                i.sku === bundleSku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          } else {
            return {
              items: [
                ...state.items,
                {
                  ...bundle,
                  sku: bundleSku,
                  isBundle: true,
                  quantity,
                } as CartItem,
              ],
            }
          }
        })
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => !matchesCartIdentity(item, sku, state.items)),
        }))
      },

      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            matchesCartIdentity(item, sku, state.items) ? { ...item, quantity } : item
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
        const items = get().items
        return items.some((item) => matchesCartIdentity(item, sku, items))
      },

      getItemQuantity: (sku) => {
        const items = get().items
        const item = items.find((item) => matchesCartIdentity(item, sku, items))
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
