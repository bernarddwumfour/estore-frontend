import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Bundle line nested inside a POS cart item. Mirrors the shape the POS page
// and the create-order API expect.
export interface PosBundleItem {
  variant_id: string
  sku: string
  product_title: string
  quantity: number
  original_price: number
  is_free: boolean
}

// POS cart item. Intentionally separate from the storefront CartItem so a
// cashier's in-progress sale never mixes with a customer's storefront cart.
export interface PosCartItem {
  id: string
  sku: string
  title: string
  price: number
  quantity: number
  imageUrl: string
  variantId: string
  isBundle?: boolean
  bundleId?: string
  bundleName?: string
  bundleItems?: PosBundleItem[]
}

interface PosCartStore {
  items: PosCartItem[]
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Actions
  addItem: (item: Omit<PosCartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (sku: string) => void
  updateQuantity: (sku: string, quantity: number) => void
  clearCart: () => void

  // Getters
  getTotalItems: () => number
  getItemQuantity: (sku: string) => number
}

export const usePosCartStore = create<PosCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      addItem: (newItem) => {
        const quantity = newItem.quantity || 1
        set((state) => {
          const existing = state.items.find((i) => i.sku === newItem.sku)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === newItem.sku
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { ...newItem, quantity } as PosCartItem],
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

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getItemQuantity: (sku) =>
        get().items.find((item) => item.sku === sku)?.quantity ?? 0,
    }),
    {
      name: 'pos-cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
