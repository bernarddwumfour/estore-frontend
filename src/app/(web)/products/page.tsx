"use client";

import Product from './Product';
import { products } from '@/constants/products';
import { useCartStore } from '@/app/lib/store/cart-store';
import { useEffect } from 'react';

export default function Products() {
  // Subscribe to cart items — even if we don't use the value directly
  // This forces the component (and its children) to re-render when cart changes
  useCartStore((state) => state.items);

  // Optional: force re-render on mount/navigation if needed
  useEffect(() => {}, []);

  return (
    <section className="relative py-32 bg-cover bg-center">
      <div className="mx-auto container">
        <div className="py-6 pb-12">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-4">
            Explore Our Catalogue
          </h1>
          <p className="text-gray-600">
            This is the main content area. The footer will stay at the bottom.
          </p>
        </div>
        <ul className="grid gap-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Product product={product} key={product.id} />
          ))}
        </ul>
      </div>
    </section>
  );
}