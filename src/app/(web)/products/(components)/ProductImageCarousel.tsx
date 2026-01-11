// app/components/Product/ProductImageCarousel.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import AddToWishList from './AddToWishList'

interface ProductImageCarouselProps {
  images: Array<{
    id?: string
    url: string
    alt_text?: string,
    type ?: string
  }>
  productTitle: string
  isFeatured: boolean
  isBestseller: boolean
  variantId : string
}

export default function ProductImageCarousel({
  images,
  productTitle,
  isFeatured,
  isBestseller,
  variantId
}: ProductImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset when images change
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [images])

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const currentImage = images[currentImageIndex] || null

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      {currentImage && currentImage.url ? (
        <Image
          src={`${currentImage.url}`}
          alt={currentImage.alt_text || productTitle}
          fill
          className="object-cover scale-100 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={isFeatured || isBestseller}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-sm text-gray-500">No Image</p>
          </div>
        </div>
      )}


      <AddToWishList variantId={variantId}/>

      {/* Image count badge - Click to cycle images */}
      {images.length > 1 && (
        <button
          onClick={handleBadgeClick}
          className="absolute flex gap-1 items-center bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition-colors cursor-pointer"
          aria-label={`Click to see next image. Image ${currentImageIndex + 1} of ${images.length}`}
        >
          +{images.length - 1} <ImageIcon className='w-3'/>
        </button>
      )}

    </div>
  )
}