import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
export interface CartItem {
  id: string
  title: string
  price: number
  imageUrl: string
  quantity: number
  originalPrice?: number
}

interface CartStore {
  items: CartItem[]
  hasHydrated: boolean // Add this
  setHasHydrated: (state: boolean) => void // Add this
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      hasHydrated: false, 

      setHasHydrated: (state) => {
        set({ hasHydrated: state })
      },
      

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          
          if (existingItem) {
            // If item already exists, increase quantity
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          } else {
            // If item doesn't exist, add it with quantity 1
            return {
              items: [...state.items, { ...item, quantity: 1 }],
            }
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
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
      
      isInCart: (id) => {
        return get().items.some((item) => item.id === id)
      },
      
      getItemQuantity: (id) => {
        const item = get().items.find((item) => item.id === id)
        return item ? item.quantity : 0
      },
    }),
    {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          // This runs after rehydration
          if (state) {
            state.setHasHydrated(true)
          }
        },
      }
  )
)