import { Suspense } from 'react';
import Categories from '@/widgets/categories/Categories';
import ProductsPageProducts from './ProductsPageProducts';

export default function Products() {
  return (
    <section className="relative py-32 bg-cover bg-center">
      <div className="mx-auto px-4 container">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">
            Explore Our Catalogue
          </h1>
          <p className="text-gray-600">
            Find the perfect products for your needs.
          </p>
        </div>
        <Categories type='badge'/>
        
        <Suspense fallback={<div className="p-10 text-center">Loading Products...</div>}>
          <ProductsPageProducts />
        </Suspense>
      </div>
    </section>
  );
}