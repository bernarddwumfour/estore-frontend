"use client";

import { ProductType } from "@/types/productTypes";
import Product from "./Product";
import { useEffect, useState } from "react";
import securityAxios from "@/axios-instances/SecurityAxios";
import { endpoints } from "@/constants/endpoints/endpoints";
import { Loader2 } from "lucide-react";

const ProductsGrid = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await securityAxios.get(endpoints.products.listProductsWeb, {
        params: {
          status: 'published',
          limit: 20,
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <p className="text-muted-foreground">
          Showing {products.length} products
        </p>
      </div>

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