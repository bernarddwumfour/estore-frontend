"use client";

import { products } from '@/constants/products';
import ProductsGrid from './ProductsGrid';

export default function Products() {
  // Subscribe to cart items — even if we don't use the value directly
  // This forces the component (and its children) to re-render when cart changes


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
        <ProductsGrid />
      </div>
    </section>
  );
}