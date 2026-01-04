import Categories from '@/widgets/categories/Categories';
import ProductsPageProducts from './ProductsPageProducts';

export default function Products() {
  

  return (
    <section className="relative py-32 bg-cover bg-center">
      <div className="mx-auto container">
        <div className="py-6">
          <h1 className="font-bebas-neue uppercase text-3xl font-bold mb-2">
            Explore Our Catalogue
          </h1>
          <p className="text-gray-600">
            This is the main content area. The footer will stay at the bottom.
          </p>
        </div>
        <Categories type='badge'/>
        <ProductsPageProducts />
      </div>
    </section>
  );
}