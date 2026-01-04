"use client";

import { ProductType } from "@/types/productTypes";
import Product from "./Product";
import { useEffect, useState } from "react";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/app/lib/store/cart-store";
import unAuthenticatedAxios from "@/axios-instances/UnAuthenticatedAxios";

const ProductsGrid = ({category,searchParams}:{category?:string,searchParams?: string}) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const items = useCartStore(state => state.items);
  
  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await unAuthenticatedAxios.get(endpoints.products.listProductsWeb, {
        params: {
          status: 'published',
          limit: 20,
          category : category || undefined 
        }
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.error || "Failed to load products");
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(
        error?.response?.data?.error || 
        error?.message || 
        "Failed to fetch products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {products.length > 0 ? (
        <ul className="grid gap-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <Product product={product} key={product.id} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;