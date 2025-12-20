// components/providers/cart-provider.tsx
'use client'

import { useCartStore } from '@/app/lib/store/cart-store'
import { ReactNode, useEffect, useState } from 'react'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const setHasHydrated = useCartStore((state) => state.setHasHydrated)

  // Wait till Zustand rehydrates from localStorage
  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
      setHasHydrated(true)
    })

    // If already hydrated, set immediately
    if (useCartStore.persist.hasHydrated()) {
      setIsHydrated(true)
      setHasHydrated(true)
    }

    return () => {
      unsubscribe()
    }
  }, [setHasHydrated])

  // You can show a loading skeleton here while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen">
        {/* Optional: Add a subtle loading indicator */}
        <div className="sr-only">Loading cart...</div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}